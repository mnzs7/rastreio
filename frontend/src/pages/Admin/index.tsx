import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  Package, CheckCircle, Clock, AlertTriangle, Plus, ArrowRight,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { adminDashboardApi } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { DashboardStats, PackageStatus } from '../../types';

const BG: Record<string, string> = {
  blue: 'bg-blue-50',
  orange: 'bg-orange-50',
  green: 'bg-green-50',
  red: 'bg-red-50',
};

function StatCard({
  icon, label, value, loading, color = 'blue',
}: {
  icon: React.ReactNode; label: string; value: number; loading: boolean; color?: string;
}) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${BG[color] ?? BG.blue}`}>{icon}</div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          {loading ? (
            <div className="h-7 w-10 bg-gray-100 rounded animate-pulse mt-0.5" />
          ) : (
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function AdminPage() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['admin-dashboard-stats'],
    queryFn: () => adminDashboardApi.stats(),
    refetchInterval: 30_000,
  });

  const monthlyData =
    stats?.monthly_volume.map((m) => ({
      ...m,
      label: format(parseISO(m.mes + '-01'), 'MMM/yy', { locale: ptBR }),
    })) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Visão geral do sistema de rastreamento</p>
        </div>
        <Link
          to="/admin/encomendas/nova"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Nova Encomenda
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          icon={<Package className="h-5 w-5 text-blue-600" />}
          label="Total" value={stats?.total ?? 0} loading={isLoading}
        />
        <StatCard
          icon={<Clock className="h-5 w-5 text-orange-500" />}
          label="Em Trânsito" value={stats?.em_transito ?? 0} loading={isLoading} color="orange"
        />
        <StatCard
          icon={<CheckCircle className="h-5 w-5 text-green-600" />}
          label="Entregues" value={stats?.entregues ?? 0} loading={isLoading} color="green"
        />
        <StatCard
          icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
          label="Problemas" value={stats?.problemas ?? 0} loading={isLoading} color="red"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-800 mb-4">Volume Mensal</h2>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Legend iconType="circle" iconSize={8} />
              <Bar dataKey="criados" name="Criadas" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="entregues" name="Entregues" fill="#22c55e" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-60 flex items-center justify-center text-gray-400 text-sm">
            {isLoading ? 'Carregando...' : 'Dados insuficientes para exibir gráfico'}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Atividade Recente</h2>
            <Link
              to="/admin/encomendas"
              className="text-blue-600 text-sm flex items-center gap-1 hover:underline"
            >
              Ver todas <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {stats?.recent_activity.length ? (
            <div className="space-y-3">
              {stats.recent_activity.map((item) => (
                <div key={item.id} className="flex items-center gap-3 text-sm">
                  <StatusBadge status={item.status} size="sm" />
                  <div className="flex-1 min-w-0">
                    <span className="font-mono text-blue-700 text-xs">{item.package.codigo_rastreio}</span>
                    <span className="text-gray-400 mx-1">—</span>
                    <span className="text-gray-600 truncate">{item.package.destinatario}</span>
                  </div>
                  <span className="text-gray-400 text-xs flex-shrink-0">
                    {format(new Date(item.data_atualizacao), 'dd/MM HH:mm')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-6">
              {isLoading ? 'Carregando...' : 'Nenhuma atividade recente'}
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Por Status</h2>
          {stats ? (
            <div className="space-y-2">
              {(Object.entries(stats.by_status) as [PackageStatus, number][])
                .filter(([, v]) => v > 0)
                .sort(([, a], [, b]) => b - a)
                .map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between text-sm">
                    <StatusBadge status={status} size="sm" />
                    <span className="font-semibold text-gray-800">{count}</span>
                  </div>
                ))}
            </div>
          ) : (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-6 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
