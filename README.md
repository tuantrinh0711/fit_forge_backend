# Fit Forge Backend

NestJS backend for workout, nutrition, goal, progress, reporting, and AI workout plan flows.

## Setup

```bash
npm install
npm run db:generate
npm run db:migrate -- --name init
npm run start:dev
```

The API defaults to `http://localhost:3000/api`.

## AWS Lambda staging

The staging deployment uses AWS Lambda with an API Gateway HTTP API and keeps PostgreSQL on Supabase. Use the Supabase shared pooler because it is IPv4-compatible on the Free plan:

```env
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@[POOLER-HOST]:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@[POOLER-HOST]:5432/postgres?sslmode=require"
```

Install the AWS SAM CLI and AWS CLI, then configure AWS credentials. Store the staging URLs in SSM Parameter Store:

```bash
aws ssm put-parameter \
  --name /fit-forge/staging/DATABASE_URL \
  --type SecureString \
  --value "$DATABASE_URL" \
  --overwrite

aws ssm put-parameter \
  --name /fit-forge/staging/DIRECT_URL \
  --type SecureString \
  --value "$DIRECT_URL" \
  --overwrite
```

Build and deploy from the repository root:

```bash
npm run db:generate
npm run build
npx prisma migrate deploy
sam build
sam deploy --guided
```

During the guided deployment, use `fit-forge-staging` as the stack name, keep the default SSM parameter path, and set `CorsOrigins` to the frontend staging URL. Do not attach the Lambda function to a VPC unless it must access private AWS resources; a VPC-connected Lambda needs a NAT gateway for outbound access to Supabase.

## Vercel deployment

Set the `DATABASE_URL` environment variable in Vercel to your Supabase Postgres URL:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.cxjzpmotrlzsupkbqxqe.supabase.co:5432/postgres?sslmode=require"
```

Replace `[YOUR-PASSWORD]` with the real Supabase password. The app now runs Prisma migrations before startup, so the server will not boot until the database schema is ready.

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

Seeding helpers (exercise templates):

```bash
# seed from the SQL file or CSV (main script uses the 100-row CSV)
npm run db:seed:exercises-templates
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
