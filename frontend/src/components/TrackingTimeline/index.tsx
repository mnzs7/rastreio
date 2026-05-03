import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MapPin, MessageSquare, CheckCircle, Circle } from 'lucide-react';
import { StatusHistory, STATUS_LABELS } from '../../types';
import { clsx } from 'clsx';

interface Props {
  history: StatusHistory[];
}

export function TrackingTimeline({ history }: Props) {
  if (history.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">Nenhuma movimentação registrada.</p>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {history.map((item, idx) => (
          <li key={item.id}>
            <div className="relative pb-8">
              {idx < history.length - 1 && (
                <span
                  className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex space-x-3">
                <div>
                  <span
                    className={clsx(
                      'h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white',
                      idx === 0 ? 'bg-blue-600' : 'bg-gray-300',
                    )}
                  >
                    {idx === 0 ? (
                      <CheckCircle className="h-5 w-5 text-white" />
                    ) : (
                      <Circle className="h-4 w-4 text-white" />
                    )}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className={clsx('text-sm font-medium', idx === 0 ? 'text-blue-700' : 'text-gray-900')}>
                      {STATUS_LABELS[item.status]}
                    </p>
                    {item.localizacao && (
                      <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="h-3.5 w-3.5" />
                        {item.localizacao}
                      </p>
                    )}
                    {item.observacao && (
                      <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-400 italic">
                        <MessageSquare className="h-3.5 w-3.5 flex-shrink-0" />
                        {item.observacao}
                      </p>
                    )}
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-gray-500">
                    {format(new Date(item.data_atualizacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
