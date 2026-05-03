import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { PackagesService } from './packages.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageStatusDto } from './dto/update-package-status.dto';
import { ListPackagesDto } from './dto/list-packages.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Encomendas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
@Controller('packages')
export class PackagesController {
  constructor(private packagesService: PackagesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova encomenda' })
  @ApiResponse({ status: 201, description: 'Encomenda criada com sucesso' })
  create(@Body() dto: CreatePackageDto, @CurrentUser() user: any) {
    return this.packagesService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar encomendas com filtros e paginação' })
  findAll(@Query() query: ListPackagesDto) {
    return this.packagesService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Estatísticas gerais das encomendas' })
  getStats() {
    return this.packagesService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar encomenda por ID' })
  findOne(@Param('id') id: string) {
    return this.packagesService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualizar status da encomenda' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdatePackageStatusDto,
  ) {
    return this.packagesService.updateStatus(id, dto.status, dto.localizacao, dto.observacao);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover encomenda' })
  remove(@Param('id') id: string) {
    return this.packagesService.remove(id);
  }
}
