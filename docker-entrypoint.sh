#!/bin/sh
set -eu

if [ "${NODE_ENV:-production}" = "production" ] && [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL is required in production." >&2
  exit 1
fi

if [ -n "${DATABASE_URL:-}" ]; then
  echo "Running Prisma migrations..."
  npm run db:migrate:deploy
fi

echo "Starting backend..."
exec npm run start
