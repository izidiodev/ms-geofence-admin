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
# Rodar migrations (users, types, campaigns, item_campaign)
yarn migration:run

# Popular tipos (enter, dwell, exit) - idempotente
yarn seed:run
```

**TypeORM:** entidades e migrations são listadas explicitamente em `src/shared/infra/database/register-entities.ts` e `register-migrations.ts` (sem glob `src/` vs `dist/`, compatível com produção). Ao criar **nova entidade** ou **nova migration**, importe e adicione ao array correspondente.

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
| GET | /api/campaigns/delivery-stats | JWT | Top 10 campanhas por delivery_count (id, name, delivery_count) |
| GET | /api/campaigns/available | **Não** | Campanhas ativas para o app (público) |
| GET | /api/campaigns/:id | JWT | Campanha + itens (enter/dwell/exit; null se ainda não cadastrados) |
| POST | /api/campaigns | JWT | Criar campanha (só cabeçalho: name, exp_date, city_uf, enabled) |
| POST | /api/campaigns/:id/items | JWT | Adicionar um item (enter, dwell ou exit via type_id) |
| PUT | /api/campaigns/:id | JWT | Atualizar campanha e/ou itens existentes (parcial) |
| DELETE | /api/campaigns/:id | JWT | Soft delete |

Respostas: sucesso `{ success: true, data?, message? }`; erro `{ success: false, error }` ou `{ success: false, errors: string[] }` (validação).

## Modelo de campanhas

- **`campaigns`**: dados da campanha — `name`, `exp_date`, `city_uf`, `enabled`, `is_deleted`, timestamps.
- **`item_campaign`**: entrada / permanência / saída — `title`, `description`, `type_id` (enter/dwell/exit), `lat`, `long`, `radius`, FK `campaign_id`.

**1) POST /api/campaigns** — criar campanha (`name`, `exp_date` e `city_uf` obrigatórios):

```json
{
  "name": "Campanha Verão",
  "exp_date": "2026-12-31",
  "city_uf": "São Paulo/SP",
  "enabled": true
}
```

**2) POST /api/campaigns/:id/items** — cadastrar cada geofence (uma requisição por tipo; `type_id` deve ser o UUID de **enter**, **dwell** ou **exit** do seed):

```json
{
  "title": "Entrada",
  "description": "opcional",
  "type_id": "<uuid enter>",
  "lat": -23.55,
  "long": -46.63,
  "radius": 500
}
```

Não é permitido dois itens do mesmo tipo na mesma campanha (409 se repetir enter/dwell/exit).

Listagens retornam só o resumo; **GET /api/campaigns/:id** retorna `enter`, `dwell` e `exit` (`null` até serem cadastrados).

**Contador `delivery_count`:** em cada resposta de **GET /api/campaigns/available**, o contador da campanha é incrementado no banco (uma vez por campanha retornada na página). O JSON já traz o valor **após** o incremento. Use **GET /api/campaigns** (admin) ou **GET /api/campaigns/:id** para ver o total acumulado no painel.

**`search` em `/available`:** filtra por **`city_uf` com igualdade exata** (após normalizar: trim, minúsculas, sem acento). O app deve enviar o **mesmo texto** cadastrado em `city_uf` (ex.: `São Paulo/SP` ≠ `São Bernardo do Campo/SP`), para não misturar geofences entre cidades. Sem `search`, retorna campanhas ativas de todas as cidades (paginado).
