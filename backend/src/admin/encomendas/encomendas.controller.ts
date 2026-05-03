import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { EncomendasService } from './encomendas.service';
import { CreateEncomendaDto } from './dto/create-encomenda.dto';
import { ListEncomendasDto } from './dto/list-encomendas.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@ApiTags('Admin - Encomendas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
@Controller('admin/encomendas')
export class EncomendasController {
  constructor(private readonly service: EncomendasService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova encomenda' })
  create(@Body() dto: CreateEncomendaDto, @CurrentUser() user: any) {
    return this.service.create(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar encomendas com filtros e paginação' })
  findAll(@Query() query: ListEncomendasDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar encomenda por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualizar status da encomenda' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto, @CurrentUser() user: any) {
    return this.service.updateStatus(id, dto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancelar encomenda' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user.id);
  }
}
