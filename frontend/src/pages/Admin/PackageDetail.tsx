import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, Package, Calendar, Weight, RefreshCw, PlusCircle, Loader2 } from 'lucide-react';
import { packagesApi, trackingApi } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { TrackingTimeline } from '../../components/TrackingTimeline';
import { PackageStatus, STATUS_LABELS } from '../../types';
import toast from 'react-hot-toast';

const ALL_STATUSES: PackageStatus[] = [
  'AGUARDANDO_COLETA', 'COLETADO', 'EM_TRANSITO',
  'EM_SEPARACAO', 'SAIU_PARA_ENTREGA', 'ENTREGUE', 'DEVOLVIDO', 'EXTRAVIADO',
];

export function PackageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [novoStatus, setNovoStatus] = useState<PackageStatus>('EM_TRANSITO');
  const [localizacao, setLocalizacao] = useState('');
  const [observacao, setObservacao] = useState('');

  const { data: pkg, isLoading } = useQuery({
    queryKey: ['package', id],
    queryFn: () => packagesApi.get(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => packagesApi.updateStatus(id!, data),
    onSuccess: () => {
      toast.success('Status atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['package', id] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      setShowUpdateForm(false);
      setLocalizacao('');
      setObservacao('');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      status: novoStatus,
      localizacao: localizacao || undefined,
      observacao: observacao || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!pkg) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-gray-700 font-mono">{pkg.codigo_rastreio}</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2.5 rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Código de Rastreio</p>
              <p className="text-xl font-bold font-mono text-gray-900">{pkg.codigo_rastreio}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={pkg.status_atual} size="lg" />
            <button
              onClick={() => setShowUpdateForm(!showUpdateForm)}
              className="flex items-center gap-1.5 text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Atualizar Status
            </button>
          </div>
        </div>

        {showUpdateForm && (
          <form onSubmit={handleUpdate} className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-4">
            <h3 className="font-semibold text-blue-900 flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Nova Movimentação
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Novo Status *</label>
                <select
                  value={novoStatus}
                  onChange={(e) => setNovoStatus(e.target.value as PackageStatus)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Localização</label>
                <input
                  type="text"
                  value={localizacao}
                  onChange={(e) => setLocalizacao(e.target.value)}
                  placeholder="Ex: São Paulo, SP"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Observação</label>
                <input
                  type="text"
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  placeholder="Ex: Saiu para entrega"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {updateMutation.isPending ? 'Salvando...' : 'Salvar Movimentação'}
              </button>
              <button
                type="button"
                onClick={() => setShowUpdateForm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Remetente</p>
            <p className="text-sm font-medium text-gray-800">{pkg.remetente}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Destinatário</p>
            <p className="text-sm font-medium text-gray-800">{pkg.destinatario}</p>
          </div>
          {pkg.descricao && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Descrição</p>
              <p className="text-sm text-gray-700">{pkg.descricao}</p>
            </div>
          )}
          {pkg.peso && (
            <div className="flex items-center gap-2">
              <Weight className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Peso</p>
                <p className="text-sm text-gray-700">{pkg.peso} kg</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Data de Envio</p>
              <p className="text-sm text-gray-700">
                {format(new Date(pkg.data_envio), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
          {pkg.data_entrega_prevista && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Entrega Prevista</p>
                <p className="text-sm text-gray-700">
                  {format(new Date(pkg.data_entrega_prevista), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
          )}
          {pkg.criado_por && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Criado por</p>
              <p className="text-sm text-gray-700">{pkg.criado_por.nome}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-6">
          Histórico de Movimentações ({pkg.historico?.length || 0})
        </h2>
        <TrackingTimeline history={pkg.historico || []} />
      </div>
    </div>
  );
}
