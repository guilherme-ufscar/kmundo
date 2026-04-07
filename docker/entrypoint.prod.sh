#!/bin/sh
set -e

echo "⏳ Aguardando banco de dados..."
until npx prisma db execute --stdin 2>/dev/null <<EOF
SELECT 1
EOF
do
  sleep 2
done

echo "🔄 Verificando histórico de migrations..."
# Se o banco já foi criado via prisma db push (sem histórico de migrations),
# marca a migration inicial como já aplicada para evitar conflito
npx prisma migrate resolve --applied "20260406000001_initial" 2>/dev/null || true

echo "🔄 Rodando migrations..."
npx prisma migrate deploy

echo "🌱 Rodando seed..."
npx prisma db seed || echo "⚠️  Seed já executado ou falhou (ignorando)"

echo "🚀 Iniciando aplicação (produção)..."
exec node server.js
