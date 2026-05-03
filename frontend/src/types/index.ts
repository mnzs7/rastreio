export type Role = 'ADMIN' | 'CLIENTE';

export type PackageStatus =
  | 'AGUARDANDO_COLETA'
  | 'COLETADO'
  | 'EM_TRANSITO'
  | 'EM_SEPARACAO'
  | 'SAIU_PARA_ENTREGA'
  | 'ENTREGUE'
  | 'TENTATIVA_ENTREGA'
  | 'DEVOLVIDO'
  | 'EXTRAVIADO'
  | 'CANCELADO';

export interface User {
  id: string;
  nome: string;
  email: string;
  role: Role;
  created_at: string;
}

export interface Endereco {
  id: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string;
  created_at: string;
}

export interface StatusHistory {
  id: string;
  package_id: string;
  status: PackageStatus;
  status_anterior?: PackageStatus | null;
  localizacao: string | null;
  observacao: string | null;
  latitude?: number | null;
  longitude?: number | null;
  data_atualizacao: string;
  atualizado_por?: Pick<User, 'id' | 'nome'> | null;
}

export interface Package {
  id: string;
  codigo_rastreio: string;
  remetente: string;
  remetente_email?: string | null;
  remetente_telefone?: string | null;
  endereco_origem_id?: string;
  endereco_origem?: Endereco;
  destinatario: string;
  destinatario_email?: string | null;
  destinatario_telefone?: string | null;
  endereco_destino_id?: string;
  endereco_destino?: Endereco;
  status_atual: PackageStatus;
  descricao: string | null;
  peso: number | null;
  data_envio: string;
  data_entrega_prevista: string | null;
  data_entrega_real: string | null;
  created_at: string;
  updated_at: string;
  criado_por_id: string;
  criado_por?: Pick<User, 'id' | 'nome' | 'email'>;
  historico?: StatusHistory[];
  _count?: { historico: number };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface DashboardStats {
  total: number;
  by_status: Record<PackageStatus, number>;
  entregues: number;
  em_transito: number;
  aguardando: number;
  problemas: number;
  recent_activity: Array<{
    id: string;
    status: PackageStatus;
    data_atualizacao: string;
    package: { codigo_rastreio: string; destinatario: string };
    atualizado_por: { nome: string } | null;
  }>;
  monthly_volume: Array<{ mes: string; criados: number; entregues: number }>;
}

export const STATUS_LABELS: Record<PackageStatus, string> = {
  AGUARDANDO_COLETA: 'Aguardando Coleta',
  COLETADO: 'Coletado',
  EM_TRANSITO: 'Em Trânsito',
  EM_SEPARACAO: 'Em Separação',
  SAIU_PARA_ENTREGA: 'Saiu para Entrega',
  ENTREGUE: 'Entregue',
  TENTATIVA_ENTREGA: 'Tentativa de Entrega',
  DEVOLVIDO: 'Devolvido',
  EXTRAVIADO: 'Extraviado',
  CANCELADO: 'Cancelado',
};

export const STATUS_COLORS: Record<PackageStatus, string> = {
  AGUARDANDO_COLETA: 'bg-gray-100 text-gray-700',
  COLETADO: 'bg-blue-100 text-blue-700',
  EM_TRANSITO: 'bg-yellow-100 text-yellow-700',
  EM_SEPARACAO: 'bg-purple-100 text-purple-700',
  SAIU_PARA_ENTREGA: 'bg-orange-100 text-orange-700',
  ENTREGUE: 'bg-green-100 text-green-700',
  TENTATIVA_ENTREGA: 'bg-amber-100 text-amber-700',
  DEVOLVIDO: 'bg-red-100 text-red-700',
  EXTRAVIADO: 'bg-red-200 text-red-800',
  CANCELADO: 'bg-gray-200 text-gray-500',
};

export const STATUS_ORDER: PackageStatus[] = [
  'AGUARDANDO_COLETA',
  'COLETADO',
  'EM_TRANSITO',
  'EM_SEPARACAO',
  'SAIU_PARA_ENTREGA',
  'ENTREGUE',
];

export function getValidTransitions(current: PackageStatus): PackageStatus[] {
  const TERMINAL: PackageStatus[] = ['ENTREGUE', 'DEVOLVIDO', 'EXTRAVIADO', 'CANCELADO'];
  const EXCEPTIONS: PackageStatus[] = ['TENTATIVA_ENTREGA', 'DEVOLVIDO', 'EXTRAVIADO', 'CANCELADO'];
  const NORMAL_FLOW: PackageStatus[] = [
    'AGUARDANDO_COLETA', 'COLETADO', 'EM_TRANSITO',
    'EM_SEPARACAO', 'SAIU_PARA_ENTREGA', 'ENTREGUE',
  ];

  if (TERMINAL.includes(current)) return [];

  const result = new Set<PackageStatus>(EXCEPTIONS);

  if (current === 'TENTATIVA_ENTREGA') {
    result.add('SAIU_PARA_ENTREGA');
    return Array.from(result);
  }

  const fi = NORMAL_FLOW.indexOf(current);
  if (fi !== -1) {
    for (let i = fi + 1; i < NORMAL_FLOW.length; i++) {
      result.add(NORMAL_FLOW[i]);
    }
  }

  return Array.from(result);
}
