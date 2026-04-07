# KMundo Warehouse — Sistema de Armazém Coreia

Sistema web SaaS para gerenciamento de armazém e redirecionamento de encomendas baseado na Coreia do Sul. Clientes internacionais recebem um número de suite único para identificar seus pacotes. O administrador recebe, armazena e despacha os itens. Design K-beauty, moderno e feminino.

---

## Stack Tecnológica

| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| Next.js | 14 (App Router) | Framework principal |
| TypeScript | strict | Linguagem |
| Tailwind CSS + shadcn/ui | 3.x | Estilização |
| Prisma | 5.x | ORM |
| PostgreSQL | 16 | Banco de dados |
| NextAuth.js | v5 beta | Autenticação |
| Zod | 4.x | Validação de esquemas |
| Sonner | 2.x | Notificações toast |
| Docker + Nginx | — | Infraestrutura |

---

## Pré-requisitos

- **Docker** 24+ e **Docker Compose** 2+
- **Node.js** 20+ (apenas para desenvolvimento local sem Docker)
- **npm** 10+

---

## Desenvolvimento Local

### 1. Clone e configure

```bash
git clone <url-do-repo>
cd suite-manager
cp .env.example .env
```

Edite `.env` com suas configurações. Para desenvolvimento local, suba apenas o postgres via Docker:

```bash
docker run -d \
  --name suite-pg \
  -e POSTGRES_DB=suite_manager \
  -e POSTGRES_USER=usuario \
  -e POSTGRES_PASSWORD=senha \
  -p 5432:5432 \
  postgres:16-alpine
```

Ajuste `DATABASE_URL` no `.env`:

```
DATABASE_URL="postgresql://usuario:senha@localhost:5432/suite_manager"
```

### 2. Instale dependências e execute migrations

```bash
npm install
npx prisma migrate dev --name init
npm run db:seed
```

### 3. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## Deploy com Docker Compose (Produção)

### 1. Configure variáveis de ambiente

```bash
cp .env.example .env
# Edite .env com valores reais de produção
```

### 2. Suba os containers

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

### 3. Execute migrations e seed

```bash
docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
docker-compose -f docker-compose.prod.yml exec app npm run db:seed
```

### 4. Acesse

- App: [http://localhost](http://localhost) (ou seu domínio)
- Admin: [http://localhost/admin/dashboard](http://localhost/admin/dashboard)

---

## Variáveis de Ambiente

Veja o arquivo `.env.example` para a lista completa. As principais:

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | URL de conexão PostgreSQL |
| `NEXTAUTH_SECRET` | Secret JWT (use `openssl rand -base64 32`) |
| `AUTH_SECRET` | Mesmo valor que `NEXTAUTH_SECRET` |
| `NEXTAUTH_URL` | URL base da aplicação (ex: `https://seudominio.com`) |
| `ADMIN_EMAIL` | Email do admin inicial |
| `ADMIN_PASSWORD` | Senha do admin inicial |
| `POSTGRES_DB` | Nome do banco (apenas prod Docker) |
| `POSTGRES_USER` | Usuário do banco (apenas prod Docker) |
| `POSTGRES_PASSWORD` | Senha do banco (apenas prod Docker) |

---

## Contas Padrão (Seed)

| Tipo | Email | Senha |
|------|-------|-------|
| Admin | `admin@kmundowarehouse.com` | `Admin@123` |
| Cliente Suite #001 | `ana.souza@gmail.com` | `Cliente@123` |
| Cliente Suite #002 | `beatriz.lima@gmail.com` | `Cliente@123` |
| Cliente Suite #003 | `carolina.m@hotmail.com` | `Cliente@123` |
| Cliente Suite #004 | `daniela.costa@gmail.com` | `Cliente@123` |
| Cliente Suite #005 | `fernanda.park@gmail.com` | `Cliente@123` |

---

## Rotas

| Rota | Descrição | Acesso |
|------|-----------|--------|
| `/login` | Login | Público |
| `/cadastro` | Cadastro + geração de suite | Público |
| `/dashboard` | Dashboard da cliente | Cliente |
| `/meus-itens` | Lista de itens | Cliente |
| `/perfil` | Perfil editável | Cliente |
| `/admin/dashboard` | Métricas do armazém | Admin |
| `/admin/clientes` | Lista de clientes | Admin |
| `/admin/itens` | Itens no armazém | Admin |
| `/admin/itens/novo` | Registrar novo item | Admin |
| `/admin/configuracoes` | Configurações do sistema | Admin |

---

## Estrutura do Projeto

```
suite-manager/
├── app/
│   ├── (cliente)/      # dashboard, meus-itens, perfil
│   ├── (admin)/        # admin/dashboard, clientes, itens, configuracoes
│   ├── login/          # página de login
│   ├── cadastro/       # página de cadastro
│   └── api/            # rotas de API (auth, clientes, itens)
├── components/
│   ├── ui/             # shadcn/ui
│   ├── cliente/        # SuiteCard, StorageBadge, PerfilForm
│   └── admin/          # AdminSidebar, forms, filtros, export
├── lib/
│   ├── auth.ts         # NextAuth config
│   ├── prisma.ts       # Prisma client singleton
│   ├── suite.ts        # Geração sequencial de suite
│   ├── utils.ts        # calcularDiasArmazenado, getCorArmazenagem
│   └── validations/    # Schemas Zod
├── prisma/
│   ├── schema.prisma
│   └── seed.ts         # Seed com dados realistas
├── docker/
│   └── nginx/          # nginx.conf
├── docker-compose.yml
├── docker-compose.prod.yml
├── Dockerfile
└── .env.example
```

---

## Regras de Negócio

1. **Suite imutável** — gerada no cadastro, nunca muda
2. **Suite sequencial** — `MAX + 1` com proteção de race condition via transaction
3. **dataEntrada** — sempre definida no servidor
4. **Armazenagem** — contador automático de dias com alertas visuais:
   - Verde: 0–30 dias
   - Amarelo: 31–60 dias
   - Laranja: 61–90 dias
   - Vermelho: +90 dias
5. **Fotos** — máximo 10 por item, 5MB por arquivo
6. **Status do item** — só avança, nunca volta (exceto admin com justificativa)

---

## Fases de Desenvolvimento

- [x] **Fase 1** — Setup infraestrutura (Next.js, Prisma, Docker, Auth)
- [x] **Fase 2** — Autenticação + Cadastro (design via Stitch)
- [x] **Fase 3** — Dashboard Cliente (SuiteCard, armazenagem)
- [x] **Fase 4** — Painel Admin (métricas, CRUD, registro de itens)
- [x] **Fase 5** — Polimento, loading states, toasts, seed realista, build prod
