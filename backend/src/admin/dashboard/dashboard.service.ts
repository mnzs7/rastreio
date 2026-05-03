import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PackageStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [total, statusCounts, recentHistory, monthlyData] = await Promise.all([
      this.prisma.package.count(),
      this.prisma.package.groupBy({
        by: ['status_atual'],
        _count: { id: true },
      }),
      this.prisma.statusHistory.findMany({
        take: 10,
        orderBy: { data_atualizacao: 'desc' },
        include: {
          package: { select: { codigo_rastreio: true, destinatario: true } },
          atualizado_por: { select: { nome: true } },
        },
      }),
      this.getMonthlyVolume(),
    ]);

    const byStatus = Object.fromEntries(
      Object.values(PackageStatus).map((s) => [s, 0])
    );
    statusCounts.forEach((row) => {
      byStatus[row.status_atual] = row._count.id;
    });

    return {
      total,
      by_status: byStatus,
      entregues: byStatus[PackageStatus.ENTREGUE] ?? 0,
      em_transito: (byStatus[PackageStatus.EM_TRANSITO] ?? 0) +
        (byStatus[PackageStatus.SAIU_PARA_ENTREGA] ?? 0) +
        (byStatus[PackageStatus.EM_SEPARACAO] ?? 0) +
        (byStatus[PackageStatus.COLETADO] ?? 0),
      aguardando: byStatus[PackageStatus.AGUARDANDO_COLETA] ?? 0,
      problemas: (byStatus[PackageStatus.TENTATIVA_ENTREGA] ?? 0) +
        (byStatus[PackageStatus.DEVOLVIDO] ?? 0) +
        (byStatus[PackageStatus.EXTRAVIADO] ?? 0),
      recent_activity: recentHistory,
      monthly_volume: monthlyData,
    };
  }

  private async getMonthlyVolume() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const packages = await this.prisma.package.findMany({
      where: { created_at: { gte: sixMonthsAgo } },
      select: { created_at: true, status_atual: true },
    });

    const monthMap: Record<string, { criados: number; entregues: number }> = {};
    packages.forEach((pkg) => {
      const key = pkg.created_at.toISOString().slice(0, 7);
      if (!monthMap[key]) monthMap[key] = { criados: 0, entregues: 0 };
      monthMap[key].criados++;
      if (pkg.status_atual === PackageStatus.ENTREGUE) monthMap[key].entregues++;
    });

    return Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([mes, counts]) => ({ mes, ...counts }));
  }
}
