import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';
import { EncomendasController } from './encomendas/encomendas.controller';
import { EncomendasService } from './encomendas/encomendas.service';
import { EnderecosController } from './enderecos/enderecos.controller';
import { EnderecosService } from './enderecos/enderecos.service';
import { DashboardController } from './dashboard/dashboard.controller';
import { DashboardService } from './dashboard/dashboard.service';

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [EncomendasController, EnderecosController, DashboardController],
  providers: [EncomendasService, EnderecosService, DashboardService],
})
export class AdminModule {}
