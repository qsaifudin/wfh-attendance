import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

describe('EmployeesService', () => {
  let service: EmployeesService;
  let prisma: {
    employees: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };
  let storage: { upload: jest.Mock; delete: jest.Mock };

  const baseEmployee = {
    id: 1,
    user_id: 10,
    photo_key: 'uploads/old.png',
    photo_url: 'https://cdn.example.com/uploads/old.png',
  };

  const detailPayload = {
    id: 1,
    full_name: 'Saifudin',
    position: 'Engineer',
    photo_url: null,
    user: { id: 10, email: 'saifudin@attendance.com', status: 'ACTIVE' },
    department: { id: 1, name: 'Engineering' },
  };

  beforeEach(async () => {
    prisma = {
      employees: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };
    storage = { upload: jest.fn(), delete: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        EmployeesService,
        { provide: PrismaService, useValue: prisma },
        { provide: StorageService, useValue: storage },
      ],
    }).compile();

    service = moduleRef.get(EmployeesService);
    jest.spyOn(service, 'findOne').mockResolvedValue(detailPayload as any);
  });

  describe('updatePhoto (self-service)', () => {
    it('remove_photo=false leaves the photo intact — the boolean-coercion trap', async () => {
      prisma.employees.findUnique.mockResolvedValue(baseEmployee);

      await service.updatePhoto(1, { remove_photo: false }, undefined);

      // No data.photo_key/photo_url change and no update call at all —
      // false is not a request to clear anything.
      expect(prisma.employees.update).not.toHaveBeenCalled();
      expect(storage.delete).not.toHaveBeenCalled();
    });

    it('remove_photo=true clears both photo columns and deletes the old key', async () => {
      prisma.employees.findUnique.mockResolvedValue(baseEmployee);
      prisma.employees.update.mockResolvedValue({});

      await service.updatePhoto(1, { remove_photo: true }, undefined);

      expect(prisma.employees.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { photo_key: null, photo_url: null },
      });
      expect(storage.delete).toHaveBeenCalledWith('uploads/old.png');
    });

    it('replacing the photo uploads first, then deletes the old key only after the DB write succeeds', async () => {
      prisma.employees.findUnique.mockResolvedValue(baseEmployee);
      prisma.employees.update.mockResolvedValue({});
      storage.upload.mockResolvedValue({
        key: 'uploads/new.png',
        url: 'https://cdn.example.com/uploads/new.png',
      });

      const file = { buffer: Buffer.from('x'), mimetype: 'image/png' } as Express.Multer.File;
      await service.updatePhoto(1, {}, file);

      expect(storage.upload).toHaveBeenCalledWith(file);
      expect(prisma.employees.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          photo_key: 'uploads/new.png',
          photo_url: 'https://cdn.example.com/uploads/new.png',
        },
      });
      expect(storage.delete).toHaveBeenCalledWith('uploads/old.png');
    });

    it('compensates by deleting the newly uploaded file if the DB write fails', async () => {
      prisma.employees.findUnique.mockResolvedValue(baseEmployee);
      prisma.employees.update.mockRejectedValue(new Error('db down'));
      storage.upload.mockResolvedValue({
        key: 'uploads/new.png',
        url: 'https://cdn.example.com/uploads/new.png',
      });

      const file = { buffer: Buffer.from('x'), mimetype: 'image/png' } as Express.Multer.File;
      await expect(service.updatePhoto(1, {}, file)).rejects.toThrow('db down');

      expect(storage.delete).toHaveBeenCalledWith('uploads/new.png');
    });

    it('throws NotFoundException for an unknown employee', async () => {
      prisma.employees.findUnique.mockResolvedValue(null);
      await expect(service.updatePhoto(999, {}, undefined)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
