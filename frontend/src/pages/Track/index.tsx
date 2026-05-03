import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Package, ArrowLeft, Calendar, Weight, Search, AlertCircle, Loader2 } from 'lucide-react';
import { trackingApi } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { TrackingTimeline } from '../../components/TrackingTimeline';

export function TrackPage() {
  const { codigo } = useParams<{ codigo: string }>();
  const navigate = useNavigate();
  const [searchCodigo, setSearchCodigo] = useState(codigo || '');

  const { data: pkg, isLoading, error } = useQuery({
    queryKey: ['tracking', codigo],
    queryFn: () => trackingApi.track(codigo!),
    enabled: !!codigo,
    retry: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchCodigo.trim().toUpperCase();
    if (trimmed) {
      navigate(`/track/${trimmed}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchCodigo}
            onChange={(e) => setSearchCodigo(e.target.value.toUpperCase())}
            placeholder="Digite outro código"
            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Rastrear
        </button>
      </form>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-500">Buscando encomenda...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
          <h3 className="font-semibold text-red-800 mb-1">Encomenda não encontrada</h3>
          <p className="text-sm text-red-600">
            Nenhuma encomenda encontrada com o código <strong>{codigo}</strong>.
            Verifique o código e tente novamente.
          </p>
        </div>
      )}

      {pkg && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2.5 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Código de Rastreio</p>
                  <p className="text-xl font-bold text-gray-900 font-mono">{pkg.codigo_rastreio}</p>
                </div>
              </div>
              <StatusBadge status={pkg.status_atual} size="lg" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
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
                <div className="flex items-center gap-1.5">
                  <Weight className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Peso</p>
                    <p className="text-sm text-gray-700">{pkg.peso} kg</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Data de Envio</p>
                  <p className="text-sm text-gray-700">
                    {format(new Date(pkg.data_envio), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>
              {pkg.data_entrega_prevista && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Entrega Prevista</p>
                    <p className="text-sm text-gray-700">
                      {format(new Date(pkg.data_entrega_prevista), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-6">Histórico de Movimentações</h2>
            <TrackingTimeline history={pkg.historico || []} />
          </div>
        </div>
      )}
    </div>
  );
}
