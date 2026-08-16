import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { role } from '@prisma/client';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { UpdateOwnPhotoDto } from './dto/update-own-photo.dto';
import { EmployeesQueryDto } from './dto/employees-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { photoUploadOptions } from '../../common/utils/upload.util';

@ApiTags('employees')
@Roles(role.ADMIN)
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @ApiOperation({ summary: 'List employees with search, filters, and pagination' })
  findAll(@Query() query: EmployeesQueryDto) {
    return this.employeesService.findAll(query);
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create an employee (also creates their login)' })
  @UseInterceptors(FileInterceptor('file', photoUploadOptions))
  create(@Body() dto: CreateEmployeeDto, @UploadedFile() file?: Express.Multer.File) {
    return this.employeesService.create(dto, file);
  }

  // Declared BEFORE ':id' — otherwise Nest would match the literal "me" as
  // the :id param and ParseIntPipe would throw a confusing 400.
  @Roles(role.EMPLOYEE)
  @Patch('me')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: "Update the caller's own avatar" })
  @UseInterceptors(FileInterceptor('file', photoUploadOptions))
  updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateOwnPhotoDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.employeesService.updatePhoto(user.employee_id as number, dto, file);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one employee' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.employeesService.findOne(id);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update an employee: fields, status, and/or photo' })
  @UseInterceptors(FileInterceptor('file', photoUploadOptions))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmployeeDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.employeesService.update(id, dto, file);
  }
}
