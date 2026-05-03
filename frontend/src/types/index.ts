export type Role = 'ADMIN' | 'CLIENTE';

export type PackageStatus =
  | 'AGUARDANDO_COLETA'
  | 'COLETADO'
  | 'EM_TRANSITO'
  | 'EM_SEPARACAO'
  | 'SAIU_PARA_ENTREGA'
  | 'ENTREGUE'
  | 'DEVOLVIDO'
  | 'EXTRAVIADO';

export interface User {
  id: string;
  nome: string;
  email: string;
  role: Role;
  created_at: string;
}

export interface StatusHistory {
  id: string;
  encomenda_id: string;
  status: PackageStatus;
  localizacao: string | null;
  observacao: string | null;
  data_atualizacao: string;
}

export interface Package {
  id: string;
  codigo_rastreio: string;
  remetente: string;
  destinatario: string;
  status_atual: PackageStatus;
  descricao: string | null;
  peso: number | null;
  data_envio: string;
  data_entrega_prevista: string | null;
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
    pagina: number;
    por_pagina: number;
    total_paginas: number;
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

export const STATUS_LABELS: Record<PackageStatus, string> = {
  AGUARDANDO_COLETA: 'Aguardando Coleta',
  COLETADO: 'Coletado',
  EM_TRANSITO: 'Em Trânsito',
  EM_SEPARACAO: 'Em Separação',
  SAIU_PARA_ENTREGA: 'Saiu para Entrega',
  ENTREGUE: 'Entregue',
  DEVOLVIDO: 'Devolvido',
  EXTRAVIADO: 'Extraviado',
};

export const STATUS_COLORS: Record<PackageStatus, string> = {
  AGUARDANDO_COLETA: 'bg-gray-100 text-gray-700',
  COLETADO: 'bg-blue-100 text-blue-700',
  EM_TRANSITO: 'bg-yellow-100 text-yellow-700',
  EM_SEPARACAO: 'bg-purple-100 text-purple-700',
  SAIU_PARA_ENTREGA: 'bg-orange-100 text-orange-700',
  ENTREGUE: 'bg-green-100 text-green-700',
  DEVOLVIDO: 'bg-red-100 text-red-700',
  EXTRAVIADO: 'bg-red-200 text-red-800',
};

export const STATUS_ORDER: PackageStatus[] = [
  'AGUARDANDO_COLETA',
  'COLETADO',
  'EM_TRANSITO',
  'EM_SEPARACAO',
  'SAIU_PARA_ENTREGA',
  'ENTREGUE',
];
