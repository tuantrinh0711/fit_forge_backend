# Fit Forge Backend

NestJS backend for workout, nutrition, goal, progress, reporting, and AI workout plan flows.

## Setup

```bash
npm install
npm run db:generate
npm run start:dev
```

The API defaults to `http://localhost:3000/api`.

## API Documentation

Start the server and open the interactive Swagger UI:

```bash
npm run start:dev
```

- Swagger UI: `http://localhost:3000/api/docs`
- OpenAPI JSON: `http://localhost:3000/api/docs-json`

## Database

This project uses PostgreSQL with Prisma. The local default is configured in `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5433/fit_forge?schema=public"
```

Port `5433` is used so it does not conflict with an existing local PostgreSQL server on `5432`.

If Docker is installed, start the included database:

```bash
docker compose up -d postgres
npm run db:migrate -- --name init
```

If you want to use your existing PostgreSQL on `5432`, update `.env` with the real password first:

```env
DATABASE_URL="postgresql://postgres:YOUR_REAL_PASSWORD@127.0.0.1:5432/fit_forge?schema=public"
```

Then create the database and apply the schema:

```bash
createdb -h 127.0.0.1 -U postgres fit_forge
npm run db:migrate -- --name init
```

Useful Prisma commands:

```bash
npm run db:generate
npm run db:migrate -- --name init
npm run db:push
npm run db:studio
```

## Main Endpoints

- `GET /api/health`
- `POST /api/workouts`
- `POST /api/workouts/:id/exercises`
- `POST /api/workouts/:id/exercises/:exerciseId/sets`
- `POST /api/nutrition/meals`
- `POST /api/nutrition/meals/:id/foods`
- `POST /api/goals`
- `POST /api/progress/weights`
- `GET /api/reports/weekly`
- `POST /api/ai-plans`
