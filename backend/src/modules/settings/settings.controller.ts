import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { role } from '@prisma/client';
import { SettingsService } from './settings.service';
import { UpdateAttendanceSettingsDto } from './dto/update-attendance-settings.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user';

@ApiTags('settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('attendance')
  @ApiOperation({ summary: 'Current attendance rules (any authenticated user)' })
  getAttendanceSettings() {
    return this.settingsService.getAttendanceSettings();
  }

  @Roles(role.ADMIN)
  @Patch('attendance')
  @ApiOperation({
    summary: 'Update the late-tolerance cutoff and location requirement',
    description:
      'Applies to future clock-ins only — past attendance records keep the tolerance that was in force when they were created.',
  })
  updateAttendanceSettings(
    @Body() dto: UpdateAttendanceSettingsDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.settingsService.updateAttendanceSettings(dto, user.user_id);
  }
}
