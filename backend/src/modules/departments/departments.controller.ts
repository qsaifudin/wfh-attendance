import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { role } from '@prisma/client';
import { DepartmentsService } from './departments.service';
import { DepartmentDto } from './dto/department.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('departments')
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List all departments (any authenticated user)' })
  findAll() {
    return this.departmentsService.findAll();
  }

  @Roles(role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a department' })
  create(@Body() dto: DepartmentDto) {
    return this.departmentsService.create(dto);
  }

  @Roles(role.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Rename a department' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: DepartmentDto) {
    return this.departmentsService.update(id, dto);
  }

  @Roles(role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a department (fails if employees are still assigned)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.departmentsService.remove(id);
  }
}
