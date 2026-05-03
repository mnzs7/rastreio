import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ArrowLeft, Package, Calendar, Weight, RefreshCw, Loader2,
  Mail, Phone, MapPin, User, X,
} from 'lucide-react';
import { adminEncomendasApi } from '../../../services/api';
import { StatusBadge } from '../../../components/StatusBadge';
import { TrackingTimeline } from '../../../components/TrackingTimeline';
import { PackageStatus, STATUS_LABELS, getValidTransitions } from '../../../types';
import toast from 'react-hot-toast';

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function formatAddr(e: any) {
  if (!e) return null;
  const compl = e.complemento ? ` ${e.complemento}` : '';
  return `${e.logradouro}, ${e.numero}${compl} — ${e.bairro}, ${e.cidade}/${e.estado} — CEP ${e.cep}`;
}

interface UpdateModalProps {
  currentStatus: PackageStatus;
  onClose: () => void;
  onSubmit: (data: { status: PackageStatus; localizacao_atual: string; observacao?: string }) => void;
  isPending: boolean;
}

function UpdateStatusModal({ currentStatus, onClose, onSubmit, isPending }: UpdateModalProps) {
  const options = getValidTransitions(currentStatus);
  const [status, setStatus] = useState<PackageStatus>(options[0] ?? currentStatus);
  const [localizacao, setLocalizacao] = useState('');
  const [observacao, setObservacao] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localizacao.trim()) {
      toast.error('Localização atual é obrigatória');
      return;
    }
    onSubmit({ status, localizacao_atual: localizacao, observacao: observacao || undefined });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Atualizar Status</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {options.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              Status atual é terminal — não é possível alterar.
            </p>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Novo status <span className="text-red-500">*</span>
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as PackageStatus)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {options.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Localização atual <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={localizacao}
                  onChange={(e) => setLocalizacao(e.target.value)}
                  placeholder="Ex: São Paulo, SP"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Observação</label>
                <textarea
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  placeholder="Informação adicional (opcional)"
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {isPending ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 border border-gray-300 text-sm text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

export function DetalheEncomendaPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  const { data: pkg, isLoading } = useQuery({
    queryKey: ['admin-encomenda', id],
    queryFn: () => adminEncomendasApi.get(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminEncomendasApi.updateStatus(id!, data),
    onSuccess: () => {
      toast.success('Status atualizado!');
      queryClient.invalidateQueries({ queryKey: ['admin-encomenda', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-encomendas'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      setShowModal(false);
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }
  if (!pkg) return null;

  const canUpdate = !['ENTREGUE', 'DEVOLVIDO', 'EXTRAVIADO', 'CANCELADO'].includes(pkg.status_atual);

  return (
    <>
      {showModal && (
        <UpdateStatusModal
          currentStatus={pkg.status_atual}
          onClose={() => setShowModal(false)}
          onSubmit={(data) => updateMutation.mutate(data)}
          isPending={updateMutation.isPending}
        />
      )}

      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/encomendas"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Encomendas
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-mono font-medium text-gray-700">{pkg.codigo_rastreio}</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
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
              {canUpdate && (
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-1.5 text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Atualizar Status
                </button>
              )}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 border-t border-gray-100">
            {pkg.peso && (
              <InfoItem icon={<Weight className="h-4 w-4" />} label="Peso" value={`${pkg.peso} kg`} />
            )}
            <InfoItem
              icon={<Calendar className="h-4 w-4" />}
              label="Data de envio"
              value={format(new Date(pkg.data_envio), 'dd/MM/yyyy', { locale: ptBR })}
            />
            {pkg.data_entrega_prevista && (
              <InfoItem
                icon={<Calendar className="h-4 w-4" />}
                label="Entrega prevista"
                value={format(new Date(pkg.data_entrega_prevista), 'dd/MM/yyyy', { locale: ptBR })}
              />
            )}
            {pkg.data_entrega_real && (
              <InfoItem
                icon={<Calendar className="h-4 w-4" />}
                label="Entrega real"
                value={format(new Date(pkg.data_entrega_real), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              />
            )}
            {pkg.criado_por && (
              <InfoItem icon={<User className="h-4 w-4" />} label="Criado por" value={pkg.criado_por.nome} />
            )}
          </div>
        </div>

        {/* Remetente / Destinatário */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Remetente</p>
            <div className="space-y-2.5">
              <InfoItem icon={<User className="h-4 w-4" />} label="Nome" value={pkg.remetente} />
              <InfoItem icon={<Mail className="h-4 w-4" />} label="E-mail" value={pkg.remetente_email} />
              <InfoItem icon={<Phone className="h-4 w-4" />} label="Telefone" value={pkg.remetente_telefone} />
              <InfoItem icon={<MapPin className="h-4 w-4" />} label="Endereço" value={formatAddr(pkg.endereco_origem)} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Destinatário</p>
            <div className="space-y-2.5">
              <InfoItem icon={<User className="h-4 w-4" />} label="Nome" value={pkg.destinatario} />
              <InfoItem icon={<Mail className="h-4 w-4" />} label="E-mail" value={pkg.destinatario_email} />
              <InfoItem icon={<Phone className="h-4 w-4" />} label="Telefone" value={pkg.destinatario_telefone} />
              <InfoItem icon={<MapPin className="h-4 w-4" />} label="Endereço" value={formatAddr(pkg.endereco_destino)} />
            </div>
          </div>
        </div>

        {/* Histórico */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-6">
            Histórico de Movimentações ({pkg.historico?.length ?? 0})
          </h2>
          <TrackingTimeline history={pkg.historico ?? []} />
        </div>
      </div>
    </>
  );
}
