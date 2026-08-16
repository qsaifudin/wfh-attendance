import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DepartmentDto } from './dto/department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.departments.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { employees: true } } },
    });
  }

  create(dto: DepartmentDto) {
    return this.prisma.departments.create({ data: dto });
  }

  update(id: number, dto: DepartmentDto) {
    return this.prisma.departments.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    const employeeCount = await this.prisma.employees.count({ where: { department_id: id } });
    if (employeeCount > 0) {
      throw new ConflictException(
        `Cannot delete: ${employeeCount} employee${employeeCount === 1 ? ' is' : 's are'} still assigned to this department`,
      );
    }
    await this.prisma.departments.delete({ where: { id } });
    return { success: true };
  }
}
