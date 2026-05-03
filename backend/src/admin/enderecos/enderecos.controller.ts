import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { EnderecosService } from './enderecos.service';
import { CreateEnderecoDto } from './dto/create-endereco.dto';

@ApiTags('Admin - Endereços')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
@Controller('admin/enderecos')
export class EnderecosController {
  constructor(private readonly service: EnderecosService) {}

  @Get('cep/:cep')
  @ApiOperation({ summary: 'Consultar CEP via ViaCEP' })
  lookupCep(@Param('cep') cep: string) {
    return this.service.lookupCep(cep);
  }

  @Post()
  @ApiOperation({ summary: 'Criar endereço' })
  create(@Body() dto: CreateEnderecoDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar endereços' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar endereço por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
