import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Plus, Search, Filter, Package, Eye, Trash2,
  ChevronLeft, ChevronRight, TrendingUp, Loader2,
} from 'lucide-react';
import { packagesApi } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { PackageStatus, STATUS_LABELS } from '../../types';
import toast from 'react-hot-toast';

const ALL_STATUSES: PackageStatus[] = [
  'AGUARDANDO_COLETA', 'COLETADO', 'EM_TRANSITO',
  'EM_SEPARACAO', 'SAIU_PARA_ENTREGA', 'ENTREGUE', 'DEVOLVIDO', 'EXTRAVIADO',
];

export function AdminPage() {
  const queryClient = useQueryClient();
  const [pagina, setPagina] = useState(1);
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<PackageStatus | ''>('');
  const [buscaInput, setBuscaInput] = useState('');

  const { data: stats } = useQuery({
    queryKey: ['packages-stats'],
    queryFn: () => packagesApi.stats(),
  });

  const { data: packages, isLoading } = useQuery({
    queryKey: ['packages', pagina, busca, statusFiltro],
    queryFn: () =>
      packagesApi.list({
        pagina,
        por_pagina: 10,
        busca: busca || undefined,
        status: statusFiltro || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => packagesApi.remove(id),
    onSuccess: () => {
      toast.success('Encomenda removida');
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['packages-stats'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setBusca(buscaInput);
    setPagina(1);
  };

  const handleDelete = (id: string, codigo: string) => {
    if (confirm(`Remover encomenda ${codigo}?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie todas as encomendas do sistema</p>
        </div>
        <Link
          to="/admin/packages/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Nova Encomenda
        </Link>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          {['EM_TRANSITO', 'SAIU_PARA_ENTREGA', 'ENTREGUE'].map((status) => (
            <div key={status} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div>
                <p className="text-xs text-gray-500">{STATUS_LABELS[status as PackageStatus]}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.por_status[status] || 0}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={buscaInput}
                onChange={(e) => setBuscaInput(e.target.value)}
                placeholder="Buscar por código, remetente ou destinatário..."
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button type="submit" className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
              Buscar
            </button>
          </form>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <select
              value={statusFiltro}
              onChange={(e) => { setStatusFiltro(e.target.value as PackageStatus | ''); setPagina(1); }}
              className="py-2.5 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os status</option>
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
          </div>
        ) : packages?.data.length === 0 ? (
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
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Data Envio</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {packages?.data.map((pkg: any) => (
                    <tr key={pkg.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-medium text-blue-700">{pkg.codigo_rastreio}</td>
                      <td className="px-4 py-3.5 text-gray-700 max-w-[150px] truncate">{pkg.remetente}</td>
                      <td className="px-4 py-3.5 text-gray-700 max-w-[150px] truncate">{pkg.destinatario}</td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={pkg.status_atual} size="sm" />
                      </td>
                      <td className="px-4 py-3.5 text-gray-500">
                        {format(new Date(pkg.data_envio), 'dd/MM/yyyy', { locale: ptBR })}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/admin/packages/${pkg.id}`}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Ver detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(pkg.id, pkg.codigo_rastreio)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                            title="Remover"
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

            {packages?.meta && packages.meta.total_paginas > 1 && (
              <div className="px-4 py-3.5 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  {packages.meta.total} encomendas • Página {packages.meta.pagina} de {packages.meta.total_paginas}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagina((p) => Math.max(1, p - 1))}
                    disabled={pagina === 1}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPagina((p) => Math.min(packages.meta.total_paginas, p + 1))}
                    disabled={pagina === packages.meta.total_paginas}
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
