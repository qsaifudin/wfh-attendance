import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { role } from '@prisma/client';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('dashboard')
@Roles(role.ADMIN)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({
    summary: 'KPI summary for a date range and department (default: today, all departments)',
  })
  summary(@Query() query: DashboardQueryDto) {
    return this.dashboardService.summary(query);
  }

  @Get('trend')
  @ApiOperation({ summary: 'Daily present/late counts for the same filters' })
  trend(@Query() query: DashboardQueryDto) {
    return this.dashboardService.trend(query);
  }
}
