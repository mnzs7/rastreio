import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHistoryDto } from './dto/create-history.dto';

@Injectable()
export class TrackingService {
  constructor(private prisma: PrismaService) {}

  async trackByCodigo(codigo: string) {
    const pkg = await this.prisma.package.findUnique({
      where: { codigo_rastreio: codigo.toUpperCase() },
      select: {
        id: true,
        codigo_rastreio: true,
        remetente: true,
        destinatario: true,
        status_atual: true,
        descricao: true,
        peso: true,
        data_envio: true,
        data_entrega_prevista: true,
        historico: {
          orderBy: { data_atualizacao: 'desc' },
          select: {
            id: true,
            status: true,
            localizacao: true,
            observacao: true,
            data_atualizacao: true,
          },
        },
      },
    });

    if (!pkg) {
      throw new NotFoundException(
        `Encomenda com código ${codigo} não encontrada`,
      );
    }

    return pkg;
  }

  async addHistory(packageId: string, dto: CreateHistoryDto) {
    const pkg = await this.prisma.package.findUnique({
      where: { id: packageId },
    });

    if (!pkg) {
      throw new NotFoundException('Encomenda não encontrada');
    }

    const [history] = await this.prisma.$transaction([
      this.prisma.statusHistory.create({
        data: {
          encomenda_id: packageId,
          status: dto.status,
          localizacao: dto.localizacao,
          observacao: dto.observacao,
        },
      }),
      this.prisma.package.update({
        where: { id: packageId },
        data: { status_atual: dto.status },
      }),
    ]);

    return history;
  }

  async getHistory(packageId: string) {
    const pkg = await this.prisma.package.findUnique({
      where: { id: packageId },
    });

    if (!pkg) {
      throw new NotFoundException('Encomenda não encontrada');
    }

    return this.prisma.statusHistory.findMany({
      where: { encomenda_id: packageId },
      orderBy: { data_atualizacao: 'desc' },
    });
  }
}
