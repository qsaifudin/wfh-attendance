import { Module } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { StorageModule } from '../storage/storage.module';
import { SettingsModule } from '../settings/settings.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [StorageModule, SettingsModule, RealtimeModule],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
