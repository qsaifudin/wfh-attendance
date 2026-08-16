import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SettingsService } from './settings.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('SettingsService', () => {
  let service: SettingsService;
  let prisma: { attendance_settings: { upsert: jest.Mock } };

  beforeEach(async () => {
    prisma = { attendance_settings: { upsert: jest.fn() } };
    const moduleRef = await Test.createTestingModule({
      providers: [
        SettingsService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: { get: () => undefined } },
      ],
    }).compile();
    service = moduleRef.get(SettingsService);
  });

  it('always targets id:1, whether the row exists yet or not', async () => {
    prisma.attendance_settings.upsert.mockResolvedValue({ id: 1 });
    await service.getAttendanceSettings();

    const call = prisma.attendance_settings.upsert.mock.calls[0][0];
    expect(call.where).toEqual({ id: 1 });
    expect(call.create.id).toBe(1);
  });

  it('update is also an upsert on id:1 — there is no path that creates a second row', async () => {
    prisma.attendance_settings.upsert.mockResolvedValue({ id: 1 });
    await service.updateAttendanceSettings(
      { late_tolerance_time: '10:00', require_location: false },
      7,
    );

    const call = prisma.attendance_settings.upsert.mock.calls[0][0];
    expect(call.where).toEqual({ id: 1 });
    expect(call.update).toEqual({
      late_tolerance_time: '10:00',
      require_location: false,
      updated_by_id: 7,
    });
  });
});
