import { Test } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('DepartmentsService', () => {
  let service: DepartmentsService;
  let prisma: {
    employees: { count: jest.Mock };
    departments: { delete: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      employees: { count: jest.fn() },
      departments: { delete: jest.fn() },
    };
    const moduleRef = await Test.createTestingModule({
      providers: [DepartmentsService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(DepartmentsService);
  });

  describe('remove', () => {
    it('rejects with a 409 naming the employee count when the department is not empty', async () => {
      prisma.employees.count.mockResolvedValue(4);

      const error: ConflictException = await service.remove(1).catch((e) => e);
      expect(error).toBeInstanceOf(ConflictException);
      expect(error.getStatus()).toBe(409);
      expect(error.message).toBe(
        'Cannot delete: 4 employees are still assigned to this department',
      );
      expect(prisma.departments.delete).not.toHaveBeenCalled();
    });

    it('uses singular phrasing for exactly one employee', async () => {
      prisma.employees.count.mockResolvedValue(1);
      const error: ConflictException = await service.remove(1).catch((e) => e);
      expect(error.message).toBe('Cannot delete: 1 employee is still assigned to this department');
    });

    it('deletes when no employees are assigned', async () => {
      prisma.employees.count.mockResolvedValue(0);
      prisma.departments.delete.mockResolvedValue({});

      const result = await service.remove(1);

      expect(prisma.departments.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual({ success: true });
    });
  });
});
