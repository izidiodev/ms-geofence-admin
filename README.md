# ms-geofence-admin

Backend para administração de geofences e campanhas. Stack: TypeScript, Express, TypeORM, PostgreSQL, bcrypt, JWT.

## Pré-requisitos

- Node.js >= 20
- PostgreSQL
- Yarn ou npm

## Instalação

```bash
yarn install
cp .env.example .env
# Ajuste .env (DB_*, JWT_SECRET, etc.)
```

## Banco de dados

```bash
# Rodar migrations (cria tabelas users, types, campaigns)
yarn migration:run

# Popular tipos (enter, dwell, exit) - idempotente
yarn seed:run
```

## Desenvolvimento

```bash
yarn dev
```

Servidor em `http://localhost:3000` (ou `PORT` do .env). API em `/api`.

## Build e produção

```bash
yarn build
yarn start
```

## Testes

```bash
yarn test
yarn test:coverage
```

## Endpoints

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | /api/auth/login | Não | Login (email, password) → token + user |
| GET | /api/users | JWT | Listagem paginada (search, is_deleted) |
| GET | /api/users/:id | JWT | Usuário por ID (retorna 200 mesmo se is_deleted) |
| POST | /api/users | JWT | Criar usuário |
| PUT | /api/users/:id | JWT | Atualizar usuário |
| DELETE | /api/users/:id | JWT | Soft delete |
| GET | /api/types | JWT | Listagem paginada de tipos |
| GET | /api/campaigns | JWT | Listagem paginada (search, is_deleted, enabled) |
| GET | /api/campaigns/available | **Não** | Campanhas ativas para o app (público) |
| GET | /api/campaigns/:id | JWT | Campanha por ID (200 mesmo se is_deleted) |
| POST | /api/campaigns | JWT | Criar campanha |
| PUT | /api/campaigns/:id | JWT | Atualizar campanha |
| DELETE | /api/campaigns/:id | JWT | Soft delete |

Respostas: sucesso `{ success: true, data?, message? }`; erro `{ success: false, error }` ou `{ success: false, errors: string[] }` (validação).

## Especificação

Ver [GEOFENCE_ADMIN_SPEC.md](./GEOFENCE_ADMIN_SPEC.md).
