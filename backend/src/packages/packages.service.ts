import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { ListPackagesDto } from './dto/list-packages.dto';
import { PackageStatus } from '@prisma/client';

@Injectable()
export class PackagesService {
  constructor(private prisma: PrismaService) {}

  private generateTrackingCode(): string {
    const prefix = 'BR';
    const suffix = 'BR';
    const number = Math.random().toString().slice(2, 11);
    return `${prefix}${number}${suffix}`;
  }

  async create(dto: CreatePackageDto, userId: string) {
    let codigoRastreio: string;
    let attempts = 0;

    do {
      codigoRastreio = this.generateTrackingCode();
      attempts++;
      if (attempts > 10) {
        throw new BadRequestException('Não foi possível gerar código único');
      }
    } while (
      await this.prisma.package.findUnique({
        where: { codigo_rastreio: codigoRastreio },
      })
    );

    const pkg = await this.prisma.package.create({
      data: {
        codigo_rastreio: codigoRastreio,
        remetente: dto.remetente,
        destinatario: dto.destinatario,
        descricao: dto.descricao,
        peso: dto.peso,
        data_entrega_prevista: dto.data_entrega_prevista
          ? new Date(dto.data_entrega_prevista)
          : null,
        criado_por_id: userId,
        historico: {
          create: {
            status: PackageStatus.AGUARDANDO_COLETA,
            localizacao: 'Sistema',
            observacao: 'Encomenda cadastrada no sistema',
          },
        },
      },
      include: {
        historico: {
          orderBy: { data_atualizacao: 'desc' },
        },
        criado_por: {
          select: { id: true, nome: true, email: true },
        },
      },
    });

    return pkg;
  }

  async findAll(query: ListPackagesDto) {
    const { status, data_inicio, data_fim, busca, pagina = 1, por_pagina = 10 } = query;
    const skip = (pagina - 1) * por_pagina;

    const where: any = {};

    if (status) {
      where.status_atual = status;
    }

    if (data_inicio || data_fim) {
      where.data_envio = {};
      if (data_inicio) where.data_envio.gte = new Date(data_inicio);
      if (data_fim) where.data_envio.lte = new Date(data_fim + 'T23:59:59');
    }

    if (busca) {
      where.OR = [
        { codigo_rastreio: { contains: busca, mode: 'insensitive' } },
        { remetente: { contains: busca, mode: 'insensitive' } },
        { destinatario: { contains: busca, mode: 'insensitive' } },
      ];
    }

    const [total, packages] = await Promise.all([
      this.prisma.package.count({ where }),
      this.prisma.package.findMany({
        where,
        skip,
        take: por_pagina,
        orderBy: { created_at: 'desc' },
        include: {
          criado_por: { select: { id: true, nome: true } },
          _count: { select: { historico: true } },
        },
      }),
    ]);

    return {
      data: packages,
      meta: {
        total,
        pagina,
        por_pagina,
        total_paginas: Math.ceil(total / por_pagina),
      },
    };
  }

  async findOne(id: string) {
    const pkg = await this.prisma.package.findUnique({
      where: { id },
      include: {
        historico: {
          orderBy: { data_atualizacao: 'desc' },
        },
        criado_por: {
          select: { id: true, nome: true, email: true },
        },
      },
    });

    if (!pkg) {
      throw new NotFoundException('Encomenda não encontrada');
    }

    return pkg;
  }

  async updateStatus(id: string, status: PackageStatus, localizacao?: string, observacao?: string) {
    const pkg = await this.findOne(id);

    const updatedPackage = await this.prisma.package.update({
      where: { id },
      data: {
        status_atual: status,
        historico: {
          create: {
            status,
            localizacao: localizacao || null,
            observacao: observacao || null,
          },
        },
      },
      include: {
        historico: {
          orderBy: { data_atualizacao: 'desc' },
        },
      },
    });

    return updatedPackage;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.package.delete({ where: { id } });
    return { message: 'Encomenda removida com sucesso' };
  }

  async getStats() {
    const [total, porStatus] = await Promise.all([
      this.prisma.package.count(),
      this.prisma.package.groupBy({
        by: ['status_atual'],
        _count: true,
      }),
    ]);

    const statusMap = porStatus.reduce((acc, curr) => {
      acc[curr.status_atual] = curr._count;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      por_status: statusMap,
    };
  }
}
