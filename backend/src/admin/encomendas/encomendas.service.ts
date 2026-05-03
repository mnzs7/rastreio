import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../../mail/mail.service';
import { CreateEncomendaDto } from './dto/create-encomenda.dto';
import { ListEncomendasDto } from './dto/list-encomendas.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { PackageStatus } from '@prisma/client';

const TERMINAL = [
  PackageStatus.ENTREGUE,
  PackageStatus.DEVOLVIDO,
  PackageStatus.EXTRAVIADO,
  PackageStatus.CANCELADO,
];

const EXCEPTIONS = [
  PackageStatus.TENTATIVA_ENTREGA,
  PackageStatus.DEVOLVIDO,
  PackageStatus.EXTRAVIADO,
  PackageStatus.CANCELADO,
];

const NORMAL_FLOW = [
  PackageStatus.AGUARDANDO_COLETA,
  PackageStatus.COLETADO,
  PackageStatus.EM_TRANSITO,
  PackageStatus.EM_SEPARACAO,
  PackageStatus.SAIU_PARA_ENTREGA,
  PackageStatus.ENTREGUE,
];

@Injectable()
export class EncomendasService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  private generateCode(): string {
    const n = Math.floor(100000000 + Math.random() * 900000000).toString();
    return `BR${n}BR`;
  }

  private validateTransition(from: PackageStatus, to: PackageStatus): void {
    if (TERMINAL.includes(from)) {
      throw new BadRequestException(`Status "${from}" é terminal e não pode ser alterado`);
    }
    if (EXCEPTIONS.includes(to)) return;
    if (from === PackageStatus.TENTATIVA_ENTREGA && to === PackageStatus.SAIU_PARA_ENTREGA) return;
    const fi = NORMAL_FLOW.indexOf(from);
    const ti = NORMAL_FLOW.indexOf(to);
    if (fi === -1 || ti === -1 || ti <= fi) {
      throw new BadRequestException(`Transição de "${from}" para "${to}" não é permitida`);
    }
  }

  async create(dto: CreateEncomendaDto, userId: string) {
    let codigo: string;
    let attempts = 0;
    do {
      codigo = this.generateCode();
      if (++attempts > 10) throw new BadRequestException('Não foi possível gerar código único');
    } while (await this.prisma.package.findUnique({ where: { codigo_rastreio: codigo } }));

    const [origem, destino] = await Promise.all([
      this.prisma.endereco.create({ data: { ...dto.endereco_origem } }),
      this.prisma.endereco.create({ data: { ...dto.endereco_destino } }),
    ]);

    return this.prisma.package.create({
      data: {
        codigo_rastreio: codigo,
        remetente: dto.remetente_nome,
        remetente_email: dto.remetente_email,
        remetente_telefone: dto.remetente_telefone,
        endereco_origem_id: origem.id,
        destinatario: dto.destinatario_nome,
        destinatario_email: dto.destinatario_email,
        destinatario_telefone: dto.destinatario_telefone,
        endereco_destino_id: destino.id,
        descricao: dto.descricao,
        peso: dto.peso,
        data_envio: dto.data_envio ? new Date(dto.data_envio) : new Date(),
        data_entrega_prevista: dto.data_entrega_prevista ? new Date(dto.data_entrega_prevista) : null,
        criado_por_id: userId,
        historico: {
          create: {
            status: PackageStatus.AGUARDANDO_COLETA,
            localizacao: `${origem.cidade}, ${origem.estado}`,
            observacao: 'Encomenda cadastrada no sistema',
            atualizado_por_id: userId,
          },
        },
      },
      include: {
        endereco_origem: true,
        endereco_destino: true,
        historico: { orderBy: { data_atualizacao: 'desc' } },
        criado_por: { select: { id: true, nome: true, email: true } },
      },
    });
  }

  async findAll(query: ListEncomendasDto) {
    const { status, cidade_origem, cidade_destino, data_inicio, data_fim, search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) where.status_atual = status;
    if (data_inicio || data_fim) {
      where.data_envio = {};
      if (data_inicio) where.data_envio.gte = new Date(data_inicio);
      if (data_fim) where.data_envio.lte = new Date(data_fim + 'T23:59:59');
    }
    if (search) {
      where.OR = [
        { codigo_rastreio: { contains: search, mode: 'insensitive' } },
        { remetente: { contains: search, mode: 'insensitive' } },
        { destinatario: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (cidade_origem) {
      where.endereco_origem = { cidade: { contains: cidade_origem, mode: 'insensitive' } };
    }
    if (cidade_destino) {
      where.endereco_destino = { cidade: { contains: cidade_destino, mode: 'insensitive' } };
    }

    const [total, data] = await Promise.all([
      this.prisma.package.count({ where }),
      this.prisma.package.findMany({
        where, skip, take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          endereco_origem: true,
          endereco_destino: true,
          criado_por: { select: { id: true, nome: true } },
          _count: { select: { historico: true } },
        },
      }),
    ]);

    return { data, meta: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const pkg = await this.prisma.package.findUnique({
      where: { id },
      include: {
        endereco_origem: true,
        endereco_destino: true,
        historico: {
          orderBy: { data_atualizacao: 'desc' },
          include: { atualizado_por: { select: { id: true, nome: true } } },
        },
        criado_por: { select: { id: true, nome: true, email: true } },
      },
    });
    if (!pkg) throw new NotFoundException('Encomenda não encontrada');
    return pkg;
  }

  async updateStatus(id: string, dto: UpdateStatusDto, userId: string) {
    const pkg = await this.findOne(id);
    this.validateTransition(pkg.status_atual, dto.status);

    const updated = await this.prisma.package.update({
      where: { id },
      data: {
        status_atual: dto.status,
        ...(dto.status === PackageStatus.ENTREGUE && { data_entrega_real: new Date() }),
        historico: {
          create: {
            status: dto.status,
            status_anterior: pkg.status_atual,
            localizacao: dto.localizacao_atual,
            latitude: dto.latitude,
            longitude: dto.longitude,
            observacao: dto.observacao,
            atualizado_por_id: userId,
          },
        },
      },
      include: {
        endereco_destino: true,
        historico: { orderBy: { data_atualizacao: 'desc' }, take: 5 },
      },
    });

    if (pkg.destinatario_email) {
      this.mail.sendStatusUpdate({
        to: pkg.destinatario_email,
        destinatarioNome: pkg.destinatario,
        codigoRastreio: pkg.codigo_rastreio,
        novoStatus: dto.status,
        localizacao: dto.localizacao_atual,
        observacao: dto.observacao,
      }).catch(() => {});
    }

    return updated;
  }

  async remove(id: string, userId: string) {
    const pkg = await this.findOne(id);
    if (pkg.status_atual === PackageStatus.CANCELADO) {
      throw new BadRequestException('Encomenda já está cancelada');
    }
    return this.prisma.package.update({
      where: { id },
      data: {
        status_atual: PackageStatus.CANCELADO,
        historico: {
          create: {
            status: PackageStatus.CANCELADO,
            status_anterior: pkg.status_atual,
            localizacao: 'Sistema',
            observacao: 'Cancelada pelo administrador',
            atualizado_por_id: userId,
          },
        },
      },
    });
  }
}
