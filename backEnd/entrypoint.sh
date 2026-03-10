#!/bin/sh
# O 'set -e' garante que o script pare se algum comando falhar.
set -e

echo "Applying database migrations..."
npx prisma migrate deploy
echo "Migrations applied successfully."

echo "Starting the application..."
# O comando 'exec "$@"' executa o comando principal do contêiner (o CMD do Dockerfile).
exec "$@"