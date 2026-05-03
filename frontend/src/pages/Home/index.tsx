import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, Truck, MapPin, CheckCircle } from 'lucide-react';

export function HomePage() {
  const [codigo, setCodigo] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = codigo.trim().toUpperCase();
    if (trimmed) {
      navigate(`/track/${trimmed}`);
    }
  };

  return (
    <div>
      <div className="text-center py-16 px-4">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-4 rounded-2xl">
            <Truck className="h-12 w-12 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Rastreie sua Encomenda
        </h1>
        <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto">
          Acompanhe o status da sua encomenda em tempo real. Digite o código de rastreio abaixo.
        </p>

        <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                placeholder="Ex: BR123456789BR"
                className="w-full pl-11 pr-4 py-3.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                maxLength={30}
              />
            </div>
            <button
              type="submit"
              disabled={!codigo.trim()}
              className="px-6 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              Rastrear
            </button>
          </div>
        </form>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {['BR123456789BR', 'BR987654321BR', 'BR555444333BR'].map((code) => (
            <button
              key={code}
              onClick={() => navigate(`/track/${code}`)}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full transition-colors"
            >
              Testar: {code}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto px-4">
        {[
          {
            icon: <Search className="h-6 w-6 text-blue-600" />,
            title: 'Busca Rápida',
            desc: 'Encontre sua encomenda instantaneamente usando o código de rastreio.',
          },
          {
            icon: <MapPin className="h-6 w-6 text-blue-600" />,
            title: 'Rastreio em Tempo Real',
            desc: 'Acompanhe cada etapa do percurso da sua encomenda.',
          },
          {
            icon: <CheckCircle className="h-6 w-6 text-blue-600" />,
            title: 'Histórico Completo',
            desc: 'Visualize todo o histórico de movimentações com datas e localizações.',
          },
        ].map((item) => (
          <div key={item.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="flex justify-center mb-3">
              <div className="bg-blue-50 p-2.5 rounded-lg">{item.icon}</div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
            <p className="text-sm text-gray-500">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
