import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Check, Loader2, Search } from 'lucide-react';
import { adminEncomendasApi, adminEnderecosApi } from '../../../services/api';
import toast from 'react-hot-toast';

interface EnderecoForm {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
}

interface FormData {
  remetente_nome: string;
  remetente_email: string;
  remetente_telefone: string;
  endereco_origem: EnderecoForm;
  destinatario_nome: string;
  destinatario_email: string;
  destinatario_telefone: string;
  endereco_destino: EnderecoForm;
  descricao: string;
  peso: string;
  data_envio: string;
  data_entrega_prevista: string;
}

const emptyEndereco = (): EnderecoForm => ({
  cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '',
});

const initialData = (): FormData => ({
  remetente_nome: '', remetente_email: '', remetente_telefone: '',
  endereco_origem: emptyEndereco(),
  destinatario_nome: '', destinatario_email: '', destinatario_telefone: '',
  endereco_destino: emptyEndereco(),
  descricao: '', peso: '', data_envio: '', data_entrega_prevista: '',
});

const STEPS = ['Remetente', 'Destinatário', 'Encomenda', 'Confirmação'];

function FieldGroup({
  label, required, children,
}: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
      {...props}
    />
  );
}

function EnderecoFields({
  prefix,
  value,
  onChange,
}: {
  prefix: 'endereco_origem' | 'endereco_destino';
  value: EnderecoForm;
  onChange: (val: EnderecoForm) => void;
}) {
  const [loadingCep, setLoadingCep] = useState(false);

  const set = (field: keyof EnderecoForm, v: string) => onChange({ ...value, [field]: v });

  const lookupCep = async () => {
    const cep = value.cep.replace(/\D/g, '');
    if (cep.length !== 8) return;
    setLoadingCep(true);
    try {
      const data = await adminEnderecosApi.lookupCep(cep);
      onChange({
        ...value,
        logradouro: data.logradouro ?? value.logradouro,
        bairro: data.bairro ?? value.bairro,
        cidade: data.cidade ?? value.cidade,
        estado: data.estado ?? value.estado,
        cep: data.cep ?? value.cep,
      });
    } catch {
      toast.error('CEP não encontrado');
    } finally {
      setLoadingCep(false);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <FieldGroup label="CEP" required>
        <div className="flex gap-1.5">
          <Input
            value={value.cep}
            onChange={(e) => set('cep', e.target.value)}
            placeholder="00000-000"
            maxLength={9}
          />
          <button
            type="button"
            onClick={lookupCep}
            disabled={loadingCep}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors flex-shrink-0"
          >
            {loadingCep ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </button>
        </div>
      </FieldGroup>

      <div className="col-span-2">
        <FieldGroup label="Logradouro" required>
          <Input
            value={value.logradouro}
            onChange={(e) => set('logradouro', e.target.value)}
            placeholder="Rua, Avenida..."
          />
        </FieldGroup>
      </div>

      <FieldGroup label="Número" required>
        <Input value={value.numero} onChange={(e) => set('numero', e.target.value)} placeholder="123" />
      </FieldGroup>

      <FieldGroup label="Complemento">
        <Input value={value.complemento} onChange={(e) => set('complemento', e.target.value)} placeholder="Apto, Sala..." />
      </FieldGroup>

      <FieldGroup label="Bairro" required>
        <Input value={value.bairro} onChange={(e) => set('bairro', e.target.value)} placeholder="Centro" />
      </FieldGroup>

      <div className="col-span-2">
        <FieldGroup label="Cidade" required>
          <Input value={value.cidade} onChange={(e) => set('cidade', e.target.value)} placeholder="São Paulo" />
        </FieldGroup>
      </div>

      <FieldGroup label="Estado" required>
        <Input value={value.estado} onChange={(e) => set('estado', e.target.value)} placeholder="SP" maxLength={2} />
      </FieldGroup>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-gray-400 w-32 flex-shrink-0">{label}</span>
      <span className="text-gray-800 font-medium">{value}</span>
    </div>
  );
}

export function NovaEncomendaPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initialData);

  const mutation = useMutation({
    mutationFn: () =>
      adminEncomendasApi.create({
        remetente_nome: form.remetente_nome,
        remetente_email: form.remetente_email || undefined,
        remetente_telefone: form.remetente_telefone || undefined,
        endereco_origem: {
          cep: form.endereco_origem.cep,
          logradouro: form.endereco_origem.logradouro,
          numero: form.endereco_origem.numero,
          complemento: form.endereco_origem.complemento || undefined,
          bairro: form.endereco_origem.bairro,
          cidade: form.endereco_origem.cidade,
          estado: form.endereco_origem.estado,
        },
        destinatario_nome: form.destinatario_nome,
        destinatario_email: form.destinatario_email || undefined,
        destinatario_telefone: form.destinatario_telefone || undefined,
        endereco_destino: {
          cep: form.endereco_destino.cep,
          logradouro: form.endereco_destino.logradouro,
          numero: form.endereco_destino.numero,
          complemento: form.endereco_destino.complemento || undefined,
          bairro: form.endereco_destino.bairro,
          cidade: form.endereco_destino.cidade,
          estado: form.endereco_destino.estado,
        },
        descricao: form.descricao || undefined,
        peso: form.peso ? parseFloat(form.peso) : undefined,
        data_envio: form.data_envio || undefined,
        data_entrega_prevista: form.data_entrega_prevista || undefined,
      }),
    onSuccess: (data) => {
      toast.success('Encomenda criada com sucesso!');
      navigate(`/admin/encomendas/${data.id}`);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const setEndereco = (
    field: 'endereco_origem' | 'endereco_destino',
    val: EnderecoForm,
  ) => setForm((f) => ({ ...f, [field]: val }));

  const validateStep = (): boolean => {
    if (step === 0) {
      const e = form.endereco_origem;
      return !!(form.remetente_nome && e.cep && e.logradouro && e.numero && e.bairro && e.cidade && e.estado);
    }
    if (step === 1) {
      const e = form.endereco_destino;
      return !!(form.destinatario_nome && e.cep && e.logradouro && e.numero && e.bairro && e.cidade && e.estado);
    }
    return true;
  };

  const next = () => {
    if (!validateStep()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    setStep((s) => s + 1);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/admin/encomendas"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Encomendas
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-gray-700">Nova Encomenda</span>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={`flex items-center gap-2 ${i <= step ? 'text-blue-600' : 'text-gray-400'}`}>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                  i < step
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : i === step
                    ? 'border-blue-600 text-blue-600 bg-white'
                    : 'border-gray-300 text-gray-400 bg-white'
                }`}
              >
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className="text-xs font-medium hidden sm:block">{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-blue-600' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* Step 0: Remetente */}
        {step === 0 && (
          <div className="space-y-5">
            <h2 className="font-semibold text-gray-900">Dados do Remetente</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <FieldGroup label="Nome completo" required>
                  <Input
                    value={form.remetente_nome}
                    onChange={(e) => setForm((f) => ({ ...f, remetente_nome: e.target.value }))}
                    placeholder="Nome do remetente"
                  />
                </FieldGroup>
              </div>
              <FieldGroup label="E-mail">
                <Input
                  type="email"
                  value={form.remetente_email}
                  onChange={(e) => setForm((f) => ({ ...f, remetente_email: e.target.value }))}
                  placeholder="email@exemplo.com"
                />
              </FieldGroup>
              <FieldGroup label="Telefone">
                <Input
                  value={form.remetente_telefone}
                  onChange={(e) => setForm((f) => ({ ...f, remetente_telefone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                />
              </FieldGroup>
            </div>
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Endereço de Origem</h3>
              <EnderecoFields
                prefix="endereco_origem"
                value={form.endereco_origem}
                onChange={(v) => setEndereco('endereco_origem', v)}
              />
            </div>
          </div>
        )}

        {/* Step 1: Destinatário */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="font-semibold text-gray-900">Dados do Destinatário</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <FieldGroup label="Nome completo" required>
                  <Input
                    value={form.destinatario_nome}
                    onChange={(e) => setForm((f) => ({ ...f, destinatario_nome: e.target.value }))}
                    placeholder="Nome do destinatário"
                  />
                </FieldGroup>
              </div>
              <FieldGroup label="E-mail">
                <Input
                  type="email"
                  value={form.destinatario_email}
                  onChange={(e) => setForm((f) => ({ ...f, destinatario_email: e.target.value }))}
                  placeholder="email@exemplo.com"
                />
              </FieldGroup>
              <FieldGroup label="Telefone">
                <Input
                  value={form.destinatario_telefone}
                  onChange={(e) => setForm((f) => ({ ...f, destinatario_telefone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                />
              </FieldGroup>
            </div>
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Endereço de Destino</h3>
              <EnderecoFields
                prefix="endereco_destino"
                value={form.endereco_destino}
                onChange={(v) => setEndereco('endereco_destino', v)}
              />
            </div>
          </div>
        )}

        {/* Step 2: Encomenda */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="font-semibold text-gray-900">Dados da Encomenda</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <FieldGroup label="Descrição do conteúdo">
                  <Input
                    value={form.descricao}
                    onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                    placeholder="Ex: Eletrodoméstico, Roupas..."
                  />
                </FieldGroup>
              </div>
              <FieldGroup label="Peso (kg)">
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.peso}
                  onChange={(e) => setForm((f) => ({ ...f, peso: e.target.value }))}
                  placeholder="0.5"
                />
              </FieldGroup>
              <FieldGroup label="Data de envio">
                <Input
                  type="date"
                  value={form.data_envio}
                  onChange={(e) => setForm((f) => ({ ...f, data_envio: e.target.value }))}
                />
              </FieldGroup>
              <div className="sm:col-span-2">
                <FieldGroup label="Data prevista de entrega">
                  <Input
                    type="date"
                    value={form.data_entrega_prevista}
                    onChange={(e) => setForm((f) => ({ ...f, data_entrega_prevista: e.target.value }))}
                  />
                </FieldGroup>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirmação */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="font-semibold text-gray-900">Confirmar Dados</h2>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Remetente</p>
                <InfoRow label="Nome" value={form.remetente_nome} />
                <InfoRow label="E-mail" value={form.remetente_email} />
                <InfoRow label="Telefone" value={form.remetente_telefone} />
                <InfoRow
                  label="Endereço"
                  value={`${form.endereco_origem.logradouro}, ${form.endereco_origem.numero} — ${form.endereco_origem.cidade}/${form.endereco_origem.estado}`}
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Destinatário</p>
                <InfoRow label="Nome" value={form.destinatario_nome} />
                <InfoRow label="E-mail" value={form.destinatario_email} />
                <InfoRow label="Telefone" value={form.destinatario_telefone} />
                <InfoRow
                  label="Endereço"
                  value={`${form.endereco_destino.logradouro}, ${form.endereco_destino.numero} — ${form.endereco_destino.cidade}/${form.endereco_destino.estado}`}
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Encomenda</p>
                <InfoRow label="Descrição" value={form.descricao} />
                <InfoRow label="Peso" value={form.peso ? `${form.peso} kg` : ''} />
                <InfoRow label="Envio" value={form.data_envio} />
                <InfoRow label="Entrega prevista" value={form.data_entrega_prevista} />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Anterior
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={next}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Próximo
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-60 transition-colors"
            >
              {mutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Criando...</>
              ) : (
                <><Check className="h-4 w-4" /> Criar Encomenda</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
