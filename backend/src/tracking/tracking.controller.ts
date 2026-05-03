import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Throttle,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TrackingService } from './tracking.service';
import { CreateHistoryDto } from './dto/create-history.dto';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Rastreamento')
@Controller('tracking')
export class TrackingController {
  constructor(private trackingService: TrackingService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Get(':codigo')
  @ApiOperation({ summary: 'Rastrear encomenda pelo código (público)' })
  @ApiResponse({ status: 200, description: 'Dados de rastreamento' })
  @ApiResponse({ status: 404, description: 'Encomenda não encontrada' })
  @ApiResponse({ status: 429, description: 'Muitas requisições' })
  track(@Param('codigo') codigo: string) {
    return this.trackingService.trackByCodigo(codigo);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Post(':packageId/history')
  @ApiOperation({ summary: 'Adicionar movimentação ao histórico (admin)' })
  addHistory(
    @Param('packageId') packageId: string,
    @Body() dto: CreateHistoryDto,
  ) {
    return this.trackingService.addHistory(packageId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Get(':packageId/history')
  @ApiOperation({ summary: 'Listar histórico completo (admin)' })
  getHistory(@Param('packageId') packageId: string) {
    return this.trackingService.getHistory(packageId);
  }
}
