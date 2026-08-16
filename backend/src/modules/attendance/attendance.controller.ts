import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Body,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { role } from '@prisma/client';
import { AttendanceService } from './attendance.service';
import { ClockInDto } from './dto/clock-in.dto';
import { AdminAttendanceQueryDto, MyAttendanceQueryDto } from './dto/attendance-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { photoUploadOptions } from '../../common/utils/upload.util';

@ApiTags('attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Roles(role.EMPLOYEE)
  @Post('clock-in')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Clock in for today with a photo and (usually) a location' })
  @UseInterceptors(FileInterceptor('file', photoUploadOptions))
  clockIn(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ClockInDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.attendanceService.clockIn(user.employee_id as number, dto, file);
  }

  @Roles(role.EMPLOYEE)
  @Get('me/today')
  @ApiOperation({ summary: "Today's clock-in record, if any — drives the clock-in button state" })
  findMyToday(@CurrentUser() user: AuthenticatedUser) {
    return this.attendanceService.findToday(user.employee_id as number);
  }

  @Roles(role.EMPLOYEE)
  @Get('me')
  @ApiOperation({ summary: "The caller's own attendance history" })
  findMine(@CurrentUser() user: AuthenticatedUser, @Query() query: MyAttendanceQueryDto) {
    return this.attendanceService.findMine(user.employee_id as number, query);
  }

  @Roles(role.ADMIN)
  @Get()
  @ApiOperation({ summary: 'All attendance records, view-only (search, filters, pagination)' })
  findAll(@Query() query: AdminAttendanceQueryDto) {
    return this.attendanceService.findAllForAdmin(query);
  }

  @Roles(role.ADMIN)
  @Get(':id')
  @ApiOperation({ summary: 'One attendance record' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const record = await this.attendanceService.findOneForAdmin(id);
    if (!record) throw new NotFoundException('Attendance record not found');
    return record;
  }
}
