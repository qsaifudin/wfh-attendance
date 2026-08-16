import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateAttendanceSettingsDto } from './dto/update-attendance-settings.dto';

const SETTINGS_ID = 1;

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /** Single-row table — this upsert is the only place id:1 is ever written,
   * so there is no path that creates a second row. */
  async getAttendanceSettings() {
    return this.prisma.attendance_settings.upsert({
      where: { id: SETTINGS_ID },
      update: {},
      create: {
        id: SETTINGS_ID,
        late_tolerance_time: this.config.get('ATTENDANCE_DEFAULT_LATE_TOLERANCE', '09:30'),
        require_location: this.config.get('ATTENDANCE_DEFAULT_REQUIRE_LOCATION', 'true') === 'true',
      },
    });
  }

  async updateAttendanceSettings(dto: UpdateAttendanceSettingsDto, updatedById: number) {
    return this.prisma.attendance_settings.upsert({
      where: { id: SETTINGS_ID },
      update: { ...dto, updated_by_id: updatedById },
      create: { id: SETTINGS_ID, ...dto, updated_by_id: updatedById },
    });
  }
}
