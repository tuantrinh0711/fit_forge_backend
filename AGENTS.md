# AGENTS.md

## Dev environment tips

- This is a NestJS backend using Prisma and PostgreSQL.
- Install dependencies with `npm install`.
- Generate the Prisma client after installing dependencies or changing the Prisma schema:

```bash
npm run db:generate
```

- Start the development server with:

```bash
npm run start:dev
```

- The API defaults to `http://localhost:3000/api`.
- The local PostgreSQL default from the README is:

```env
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5433/fit_forge?schema=public"
```

- If Docker is available, start the included database with:

```bash
docker compose up -d postgres
```

- Apply database migrations during local setup with:

```bash
npm run db:migrate -- --name init
```

- Useful Prisma commands:

```bash
npm run db:generate
npm run db:migrate -- --name init
npm run db:push
npm run db:studio
```

## Testing instructions

- Run unit tests with:

```bash
npm test
```

- Run e2e tests with:

```bash
npm run test:e2e
```

- Build the project before opening a PR:

```bash
npm run build
```

- Lint and format TypeScript files with:

```bash
npm run lint
npm run format
```

Note: `npm run lint` is configured with `--fix`, so it may modify files.

## PR instructions

- Keep PRs focused on one feature, fix, or refactor.
- Include a short summary of the behavior change and any affected endpoints.
- Mention database changes explicitly, including Prisma schema or migration updates.
- Run the relevant checks before requesting review:

```bash
npm run build
npm test
npm run test:e2e
```

- If Swagger DTOs, controllers, or route behavior changed, verify the API documentation still reflects the implementation.
- Do not commit local secrets or environment-specific `.env` values.

## API documentation

- Start the server:

```bash
npm run start:dev
```

- Swagger UI:

```text
http://localhost:3000/api/docs
```

- OpenAPI JSON:

```text
http://localhost:3000/api/docs-json
```

- The Swagger setup is configured in `src/main.ts`.
- Main documented endpoints include:

```text
GET  /api/health
POST /api/workouts
POST /api/workouts/:id/exercises
POST /api/workouts/:id/exercises/:exerciseId/sets
POST /api/nutrition/meals
POST /api/nutrition/meals/:id/foods
POST /api/goals
POST /api/progress/weights
GET  /api/reports/weekly
POST /api/ai-plans
```
