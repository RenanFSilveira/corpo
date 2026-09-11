#!/bin/sh
set -e
node_modules/.bin/prisma db push
node prisma/migrate-workouts.mjs
exec "$@"
