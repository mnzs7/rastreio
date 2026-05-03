import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Package } from 'lucide-react';
import { packagesApi } from '../../services/api';
import toast from 'react-hot-toast';

const schema = z.object({
  remetente: z.string().min(2, 'Mínimo 2 caracteres'),
  destinatario: z.string().min(2, 'Mínimo 2 caracteres'),
  descricao: z.string().optional(),
  peso: z.string().optional().transform((v) => (v ? parseFloat(v) : undefined)),
  data_entrega_prevista: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function CreatePackagePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (data: any) => packagesApi.create(data),
    onSuccess: (pkg: any) => {
      toast.success(`Encomenda ${pkg.codigo_rastreio} criada!`);
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['packages-stats'] });
      navigate(`/admin/packages/${pkg.id}`);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const onSubmit = (data: FormData) => mutation.mutate(data);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-gray-700">Nova Encomenda</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-2.5 rounded-lg">
            <Package className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Criar Nova Encomenda</h1>
            <p className="text-sm text-gray-500">O código de rastreio será gerado automaticamente</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Remetente *
              </label>
              <input
                {...register('remetente')}
                type="text"
                placeholder="Nome do remetente"
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.remetente && (
                <p className="mt-1 text-xs text-red-600">{errors.remetente.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Destinatário *
              </label>
              <input
                {...register('destinatario')}
                type="text"
                placeholder="Nome e endereço do destinatário"
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.destinatario && (
                <p className="mt-1 text-xs text-red-600">{errors.destinatario.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Descrição
            </label>
            <input
              {...register('descricao')}
              type="text"
              placeholder="Ex: Notebook Dell Inspiron"
              className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Peso (kg)
              </label>
              <input
                {...register('peso')}
                type="number"
                step="0.1"
                min="0"
                placeholder="Ex: 2.5"
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Data de Entrega Prevista
              </label>
              <input
                {...register('data_entrega_prevista')}
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting || mutation.isPending}
              className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {mutation.isPending ? 'Criando...' : 'Criar Encomenda'}
            </button>
            <Link
              to="/admin"
              className="px-6 py-3 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
