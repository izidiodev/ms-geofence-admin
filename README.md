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
| POST | /api/campaigns | JWT | Criar campanha (só cabeçalho: name, exp_date, city, uf, enabled) |
| POST | /api/campaigns/:id/items | JWT | Adicionar um item (enter, dwell ou exit via type_id) |
| PUT | /api/campaigns/:id | JWT | Atualizar campanha e/ou itens existentes (parcial) |
| DELETE | /api/campaigns/:id | JWT | Soft delete |

Respostas: sucesso `{ success: true, data?, message? }`; erro `{ success: false, error }` ou `{ success: false, errors: string[] }` (validação).

## Modelo de campanhas

- **`campaigns`**: dados da campanha — `name`, `exp_date`, `city`, `uf`, **`lat`**, **`long`**, **`radius`** (uma geofence circular por campanha), `enabled`, `is_deleted`, `delivery_count`, timestamps.
- **`item_campaign`**: entrada / permanência / saída — `title`, `description`, `type_id` (enter/dwell/exit), FK `campaign_id`. **Sem** `lat`, `long` nem `radius`; a geofence é só no cabeçalho.

**1) POST /api/campaigns** — criar campanha (`name`, `exp_date`, `city`, `uf`, `lat`, `long` e **`radius`** obrigatórios; `radius` inteiro em metros, entre 1 e 100000):

```json
{
  "name": "Campanha Verão",
  "exp_date": "2026-12-31",
  "city": "São Paulo",
  "uf": "SP",
  "lat": -23.55,
  "long": -46.63,
  "radius": 500,
  "enabled": true
}
```

**2) POST /api/campaigns/:id/items** — cadastrar conteúdo por tipo (uma requisição por `type_id` enter/dwell/exit do seed). Body só texto/tipo; **sem** `lat`, `long` nem `radius`.

```json
{
  "title": "Entrada",
  "description": "opcional",
  "type_id": "<uuid enter>"
}
```

Não é permitido dois itens do mesmo tipo na mesma campanha (409 se repetir enter/dwell/exit).

Listagens retornam só o resumo; **GET /api/campaigns/:id** retorna `enter`, `dwell` e `exit` (`null` até serem cadastrados).

**Contador `delivery_count`:** em cada resposta de **GET /api/campaigns/available**, o contador da campanha é incrementado no banco (uma vez por campanha retornada na página). O JSON já traz o valor **após** o incremento. Use **GET /api/campaigns** (admin) ou **GET /api/campaigns/:id** para ver o total acumulado no painel.

**Filtro geográfico em `/available`:** query **`city`** e **`uf` juntos** (ex.: `?city=Barreiras&uf=BA`). A comparação é **igualdade exata** em cidade e UF (após normalizar: trim, minúsculas, sem acento na cidade; a UF na query é enviada em maiúsculas). Assim cidades homônimas em UFs diferentes não se misturam. Sem `city` e `uf`, retorna campanhas ativas de todos os locais (paginado). Informar só um dos dois retorna **400**.

**Listagem admin (`GET /api/campaigns`):** `search_in=city` pesquisa em `city`; `both` inclui também `name` e `uf`.
