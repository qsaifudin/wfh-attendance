import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService, UploadedFile } from '../storage/storage.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { UpdateOwnPhotoDto } from './dto/update-own-photo.dto';
import { EmployeesQueryDto } from './dto/employees-query.dto';

const detailInclude = {
  user: { select: { id: true, email: true, status: true } },
  department: true,
} as const;

type EmployeeWithRelations = Prisma.employeesGetPayload<{ include: typeof detailInclude }>;

function serializeEmployee(employee: EmployeeWithRelations) {
  return {
    id: employee.id,
    full_name: employee.full_name,
    position: employee.position,
    photo_url: employee.photo_url,
    email: employee.user.email,
    status: employee.user.status,
    department: { id: employee.department.id, name: employee.department.name },
  };
}

@Injectable()
export class EmployeesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async findAll(query: EmployeesQueryDto) {
    const { search, department_id, status, page, limit } = query;

    const where: Prisma.employeesWhereInput = {
      department_id,
      user: status ? { status } : undefined,
      ...(search
        ? {
            OR: [{ full_name: { contains: search } }, { user: { email: { contains: search } } }],
          }
        : {}),
    };

    const [rows, total] = await Promise.all([
      this.prisma.employees.findMany({
        where,
        include: detailInclude,
        orderBy: { full_name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.employees.count({ where }),
    ]);

    return {
      data: rows.map(serializeEmployee),
      meta: { page, limit, total, total_pages: Math.max(1, Math.ceil(total / limit)) },
    };
  }

  async findOne(id: number) {
    const employee = await this.prisma.employees.findUnique({
      where: { id },
      include: detailInclude,
    });
    if (!employee) throw new NotFoundException('Employee not found');
    return serializeEmployee(employee);
  }

  async create(dto: CreateEmployeeDto, file?: Express.Multer.File) {
    let uploaded: UploadedFile | null = null;
    if (file) uploaded = await this.storage.upload(file);

    try {
      const password = await bcrypt.hash(dto.password, 10);
      const created = await this.prisma.$transaction(async (tx) => {
        const user = await tx.users.create({
          data: {
            email: dto.email,
            password,
            role: 'EMPLOYEE',
            status: dto.status ?? 'ACTIVE',
          },
        });
        return tx.employees.create({
          data: {
            user_id: user.id,
            full_name: dto.full_name,
            position: dto.position,
            department_id: dto.department_id,
            photo_key: uploaded?.key,
            photo_url: uploaded?.url,
          },
        });
      });
      return this.findOne(created.id);
    } catch (error) {
      if (uploaded) await this.storage.delete(uploaded.key);
      throw error;
    }
  }

  /** Admin update — every field, including status and photo. */
  async update(id: number, dto: UpdateEmployeeDto, file?: Express.Multer.File) {
    const existing = await this.prisma.employees.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Employee not found');

    let uploaded: UploadedFile | null = null;
    if (file) uploaded = await this.storage.upload(file);

    try {
      await this.prisma.$transaction(async (tx) => {
        const data: Prisma.employeesUpdateInput = {
          ...(dto.full_name !== undefined && { full_name: dto.full_name }),
          ...(dto.position !== undefined && { position: dto.position }),
          ...(dto.department_id !== undefined && { department_id: dto.department_id }),
          ...this.photoFields(uploaded, dto.remove_photo),
        };
        if (Object.keys(data).length > 0) {
          await tx.employees.update({ where: { id }, data });
        }
        if (dto.status !== undefined) {
          await tx.users.update({ where: { id: existing.user_id }, data: { status: dto.status } });
        }
      });

      await this.cleanupOldPhoto(existing.photo_key, uploaded, dto.remove_photo);
      return this.findOne(id);
    } catch (error) {
      if (uploaded) await this.storage.delete(uploaded.key);
      throw error;
    }
  }

  /** Self-service update — photo only, no id or role fields to tamper with. */
  async updatePhoto(employeeId: number, dto: UpdateOwnPhotoDto, file?: Express.Multer.File) {
    const existing = await this.prisma.employees.findUnique({ where: { id: employeeId } });
    if (!existing) throw new NotFoundException('Employee not found');

    let uploaded: UploadedFile | null = null;
    if (file) uploaded = await this.storage.upload(file);

    try {
      const data = this.photoFields(uploaded, dto.remove_photo);
      if (Object.keys(data).length > 0) {
        await this.prisma.employees.update({ where: { id: employeeId }, data });
      }
      await this.cleanupOldPhoto(existing.photo_key, uploaded, dto.remove_photo);
      return this.findOne(employeeId);
    } catch (error) {
      if (uploaded) await this.storage.delete(uploaded.key);
      throw error;
    }
  }

  private photoFields(
    uploaded: UploadedFile | null,
    removePhoto: boolean | undefined,
  ): Partial<Prisma.employeesUpdateInput> {
    if (uploaded) return { photo_key: uploaded.key, photo_url: uploaded.url };
    if (removePhoto) return { photo_key: null, photo_url: null };
    return {};
  }

  /** Runs only after the DB write succeeds, so a failed delete leaves a
   * harmless orphan in storage rather than a broken avatar. */
  private async cleanupOldPhoto(
    previousKey: string | null,
    uploaded: UploadedFile | null,
    removePhoto: boolean | undefined,
  ) {
    if ((uploaded || removePhoto) && previousKey) {
      await this.storage.delete(previousKey);
    }
  }
}
