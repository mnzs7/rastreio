# RastreioApp — Sistema de Rastreamento de Encomendas

Sistema full-stack completo para rastreamento de encomendas, construído com NestJS, React, PostgreSQL e Prisma.

## Funcionalidades

- **Rastreamento público**: qualquer pessoa pode rastrear pelo código sem login
- **Painel Admin**: criação, atualização de status e gerenciamento de encomendas
- **Autenticação JWT**: rotas administrativas protegidas por token
- **Paginação e filtros**: busca por código, remetente, destinatário e status
- **Histórico completo**: todas as movimentações com data, localização e observações
- **Rate limiting**: proteção na rota pública de rastreio
- **Swagger UI**: documentação interativa da API

---

## Tecnologias

| Camada     | Tecnologia                                |
|------------|-------------------------------------------|
| Backend    | NestJS + TypeScript                       |
| Banco      | PostgreSQL + Prisma ORM                   |
| Auth       | JWT + Passport + bcryptjs                 |
| Frontend   | React 18 + TypeScript + Vite              |
| Estilo     | Tailwind CSS                              |
| HTTP       | Axios + React Query                       |
| Forms      | React Hook Form + Zod                     |
| Deploy     | Docker + docker-compose                   |
| Docs API   | Swagger / OpenAPI                         |

---

## Início Rápido (Docker — Recomendado)

### Pré-requisitos
- Docker e Docker Compose instalados

```bash
# Clone o repositório
git clone <url-do-repo>
cd rastreio

# Inicie tudo com um comando
docker-compose up --build

# Aguarde os serviços subirem (~1-2 min)
```

Acesse:
- Frontend: http://localhost
- API: http://localhost:3000
- Swagger: http://localhost:3000/api/docs

---

## Desenvolvimento Local

### Pré-requisitos
- Node.js 20+
- PostgreSQL 15+ (ou Docker para o banco)

### 1. Suba apenas o banco de dados

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 2. Configure o Backend

```bash
cd backend

# Instale dependências
npm install

# Crie o arquivo .env
cp .env.example .env
# Edite .env com suas configurações

# Execute as migrations
npm run prisma:migrate

# Popule o banco com dados de teste
npm run prisma:seed

# Inicie em modo desenvolvimento
npm run start:dev
```

### 3. Configure o Frontend

```bash
cd frontend

# Instale dependências
npm install

# Crie o arquivo .env
cp .env.example .env
# Edite VITE_API_URL se necessário

# Inicie em modo desenvolvimento
npm run dev
```

Acesse:
- Frontend: http://localhost:5173
- API: http://localhost:3000
- Swagger: http://localhost:3000/api/docs

---

## Variáveis de Ambiente

### Backend (`backend/.env`)

| Variável         | Descrição                        | Padrão                    |
|------------------|----------------------------------|---------------------------|
| `DATABASE_URL`   | URL de conexão PostgreSQL        | `postgresql://...`        |
| `JWT_SECRET`     | Chave secreta para JWT           | **mude em produção!**     |
| `JWT_EXPIRES_IN` | Expiração do token               | `7d`                      |
| `PORT`           | Porta do servidor                | `3000`                    |
| `NODE_ENV`       | Ambiente                         | `development`             |
| `THROTTLE_TTL`   | Janela rate limit (segundos)     | `60`                      |
| `THROTTLE_LIMIT` | Máximo de requests por janela    | `100`                     |

### Frontend (`frontend/.env`)

| Variável       | Descrição         | Padrão                    |
|----------------|-------------------|---------------------------|
| `VITE_API_URL` | URL da API        | `http://localhost:3000`   |

---

## Scripts Disponíveis

### Backend

```bash
npm run start:dev      # Desenvolvimento com hot-reload
npm run start:prod     # Produção
npm run build          # Compilar TypeScript
npm run test           # Testes unitários
npm run test:cov       # Cobertura de testes
npm run test:e2e       # Testes de integração
npm run prisma:migrate # Executar migrations (dev)
npm run prisma:seed    # Popular banco com dados de teste
npm run prisma:studio  # Interface visual do Prisma
npm run prisma:reset   # Resetar banco (cuidado!)
```

### Frontend

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run preview  # Prévia do build
npm run lint     # Verificar código
```

---

## Estrutura de Pastas

```
rastreio/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Modelos do banco
│   │   └── seed.ts             # Dados de teste
│   ├── src/
│   │   ├── auth/               # Autenticação JWT
│   │   │   ├── decorators/
│   │   │   ├── dto/
│   │   │   ├── guards/
│   │   │   └── strategies/
│   │   ├── packages/           # Módulo de encomendas (admin)
│   │   │   └── dto/
│   │   ├── tracking/           # Rastreamento público
│   │   │   └── dto/
│   │   ├── users/              # Gerenciamento de usuários
│   │   │   └── dto/
│   │   ├── prisma/             # Serviço do Prisma
│   │   ├── common/
│   │   │   ├── filters/        # Exception filter global
│   │   │   └── interceptors/   # Logging + Transform
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── test/                   # Testes E2E
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Layout/
│       │   ├── ProtectedRoute/
│       │   ├── StatusBadge/
│       │   └── TrackingTimeline/
│       ├── contexts/
│       │   └── AuthContext.tsx
│       ├── pages/
│       │   ├── Home/           # Página inicial com busca
│       │   ├── Track/          # Resultado do rastreio
│       │   ├── Login/          # Login admin
│       │   └── Admin/          # Dashboard + detalhe + criar
│       ├── services/
│       │   └── api.ts          # Axios + interceptors
│       └── types/
│           └── index.ts        # Tipos TypeScript
│
├── docker-compose.yml          # Produção
├── docker-compose.dev.yml      # Apenas banco (dev)
└── README.md
```

---

## Endpoints da API

### Autenticação
| Método | Rota              | Auth     | Descrição              |
|--------|-------------------|----------|------------------------|
| POST   | /auth/login       | Público  | Login                  |
| POST   | /auth/register    | Admin    | Registrar usuário      |
| GET    | /auth/me          | JWT      | Dados do usuário atual |

### Rastreamento (Público)
| Método | Rota                         | Auth     | Descrição                   |
|--------|------------------------------|----------|-----------------------------|
| GET    | /tracking/:codigo            | Público  | Rastrear por código         |
| POST   | /tracking/:id/history        | Admin    | Adicionar movimentação      |
| GET    | /tracking/:id/history        | Admin    | Listar histórico completo   |

### Encomendas (Admin)
| Método | Rota                         | Auth  | Descrição                      |
|--------|------------------------------|-------|--------------------------------|
| GET    | /packages                    | Admin | Listar com filtros/paginação   |
| POST   | /packages                    | Admin | Criar encomenda                |
| GET    | /packages/stats              | Admin | Estatísticas gerais            |
| GET    | /packages/:id                | Admin | Detalhes da encomenda          |
| PATCH  | /packages/:id/status         | Admin | Atualizar status               |
| DELETE | /packages/:id                | Admin | Remover encomenda              |

### Usuários (Admin)
| Método | Rota        | Auth  | Descrição           |
|--------|-------------|-------|---------------------|
| GET    | /users      | Admin | Listar usuários     |
| GET    | /users/:id  | Admin | Buscar usuário      |
| DELETE | /users/:id  | Admin | Remover usuário     |

> Todos os endpoints estão documentados no Swagger: `http://localhost:3000/api/docs`

---

## Dados de Teste (Seed)

Após rodar `npm run prisma:seed`, os seguintes dados estarão disponíveis:

**Usuários:**
| Email                    | Senha      | Role    |
|--------------------------|------------|---------|
| admin@rastreio.com       | admin123   | ADMIN   |
| cliente@rastreio.com     | cliente123 | CLIENTE |

**Encomendas:**
| Código           | Status             |
|------------------|--------------------|
| BR123456789BR    | Entregue           |
| BR987654321BR    | Em Trânsito        |
| BR555444333BR    | Aguardando Coleta  |

---

## Segurança

- Senhas com hash bcrypt (salt rounds: 10)
- JWT com expiração configurável
- Rate limiting global e específico na rota pública
- Helmet para headers HTTP seguros
- CORS configurável
- Validação e sanitização de todos os inputs
- Rotas administrativas com dupla guarda (JWT + Roles)

---

## Deploy em Produção

1. Configure as variáveis de ambiente com valores seguros
2. Altere `JWT_SECRET` para uma chave forte (mínimo 32 caracteres)
3. Use HTTPS com reverse proxy (nginx/caddy)
4. Configure `FRONTEND_URL` no backend para restringir CORS

```bash
# Build e deploy
docker-compose up --build -d

# Verificar logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## Testes

```bash
cd backend

# Testes unitários
npm run test

# Cobertura
npm run test:cov

# Testes E2E (requer banco rodando)
npm run test:e2e
```
