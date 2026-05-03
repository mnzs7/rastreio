import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Plus, Search, Filter, Package, Eye, Trash2,
  ChevronLeft, ChevronRight, Loader2, CalendarDays, MapPin,
} from 'lucide-react';
import { adminEncomendasApi } from '../../../services/api';
import { StatusBadge } from '../../../components/StatusBadge';
import { PackageStatus, STATUS_LABELS } from '../../../types';
import toast from 'react-hot-toast';

const ALL_STATUSES: PackageStatus[] = [
  'AGUARDANDO_COLETA', 'COLETADO', 'EM_TRANSITO', 'EM_SEPARACAO',
  'SAIU_PARA_ENTREGA', 'ENTREGUE', 'TENTATIVA_ENTREGA', 'DEVOLVIDO',
  'EXTRAVIADO', 'CANCELADO',
];

export function EncomendasPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<PackageStatus | ''>('');
  const [cidadeOrigem, setCidadeOrigem] = useState('');
  const [cidadeDestino, setCidadeDestino] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-encomendas', page, search, statusFiltro, cidadeOrigem, cidadeDestino, dataInicio, dataFim],
    queryFn: () =>
      adminEncomendasApi.list({
        page,
        limit: 15,
        search: search || undefined,
        status: statusFiltro || undefined,
        cidade_origem: cidadeOrigem || undefined,
        cidade_destino: cidadeDestino || undefined,
        data_inicio: dataInicio || undefined,
        data_fim: dataFim || undefined,
      }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => adminEncomendasApi.remove(id),
    onSuccess: () => {
      toast.success('Encomenda cancelada');
      queryClient.invalidateQueries({ queryKey: ['admin-encomendas'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleCancel = (id: string, codigo: string) => {
    if (confirm(`Cancelar encomenda ${codigo}?`)) {
      cancelMutation.mutate(id);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSearchInput('');
    setStatusFiltro('');
    setCidadeOrigem('');
    setCidadeDestino('');
    setDataInicio('');
    setDataFim('');
    setPage(1);
  };

  const hasActiveFilters = search || statusFiltro || cidadeOrigem || cidadeDestino || dataInicio || dataFim;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Encomendas</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie todas as encomendas do sistema</p>
        </div>
        <Link
          to="/admin/encomendas/nova"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Nova Encomenda
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Buscar por código, remetente ou destinatário..."
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
              >
                Buscar
              </button>
            </form>

            <div className="flex items-center gap-2">
              <select
                value={statusFiltro}
                onChange={(e) => { setStatusFiltro(e.target.value as PackageStatus | ''); setPage(1); }}
                className="py-2.5 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os status</option>
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-3 py-2.5 border rounded-lg text-sm transition-colors ${
                  showFilters || hasActiveFilters
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Filter className="h-4 w-4" />
                Filtros
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  <MapPin className="h-3 w-3 inline mr-1" />
                  Cidade origem
                </label>
                <input
                  type="text"
                  value={cidadeOrigem}
                  onChange={(e) => { setCidadeOrigem(e.target.value); setPage(1); }}
                  placeholder="Ex: São Paulo"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  <MapPin className="h-3 w-3 inline mr-1" />
                  Cidade destino
                </label>
                <input
                  type="text"
                  value={cidadeDestino}
                  onChange={(e) => { setCidadeDestino(e.target.value); setPage(1); }}
                  placeholder="Ex: Rio de Janeiro"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  <CalendarDays className="h-3 w-3 inline mr-1" />
                  Data início
                </label>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => { setDataInicio(e.target.value); setPage(1); }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  <CalendarDays className="h-3 w-3 inline mr-1" />
                  Data fim
                </label>
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => { setDataFim(e.target.value); setPage(1); }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="col-span-full text-xs text-red-500 hover:underline text-left"
                >
                  Limpar todos os filtros
                </button>
              )}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Package className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">Nenhuma encomenda encontrada</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Código</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Remetente</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Destinatário</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Envio</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Movim.</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data?.data.map((pkg: any) => (
                    <tr key={pkg.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-medium text-blue-700 text-xs">
                        {pkg.codigo_rastreio}
                      </td>
                      <td className="px-4 py-3.5 text-gray-700 max-w-[130px]">
                        <div className="truncate">{pkg.remetente}</div>
                        {pkg.endereco_origem && (
                          <div className="text-xs text-gray-400 truncate">
                            {pkg.endereco_origem.cidade}, {pkg.endereco_origem.estado}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-gray-700 max-w-[130px]">
                        <div className="truncate">{pkg.destinatario}</div>
                        {pkg.endereco_destino && (
                          <div className="text-xs text-gray-400 truncate">
                            {pkg.endereco_destino.cidade}, {pkg.endereco_destino.estado}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={pkg.status_atual} size="sm" />
                      </td>
                      <td className="px-4 py-3.5 text-gray-500 text-xs">
                        {format(new Date(pkg.data_envio), 'dd/MM/yyyy', { locale: ptBR })}
                      </td>
                      <td className="px-4 py-3.5 text-gray-500 text-xs text-center">
                        {pkg._count?.historico ?? 0}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <Link
                            to={`/admin/encomendas/${pkg.id}`}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Ver detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleCancel(pkg.id, pkg.codigo_rastreio)}
                            disabled={['CANCELADO', 'ENTREGUE', 'DEVOLVIDO', 'EXTRAVIADO'].includes(pkg.status_atual)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Cancelar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data?.meta && data.meta.total_pages > 1 && (
              <div className="px-4 py-3.5 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  {data.meta.total} encomendas • Página {data.meta.page} de {data.meta.total_pages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(data.meta.total_pages, p + 1))}
                    disabled={page === data.meta.total_pages}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
