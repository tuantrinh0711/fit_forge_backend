#!/usr/bin/env bash
set -euo pipefail

# Load environment variables from .env (simple parser)
if [ -f ".env" ]; then
  export $(grep -v '^#' .env | xargs)
fi

echo "Seeding exercises from prisma/seeds/exercise_templates_100.csv"
# psql does not accept the Prisma-style ?schema=... query param; strip it if present
CONN="${DATABASE_URL%%\?*}"
# Stream CSV skipping header and COPY into table (pipe-delimited)
tail -n +2 prisma/seeds/exercise_templates_100.csv | awk -F'|' '!seen[$1]++' | psql "$CONN" -c "\copy exercises (name, tags) FROM STDIN WITH (FORMAT text, DELIMITER '|')"

echo "Done."
