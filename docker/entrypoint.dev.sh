#!/bin/sh
set -e

echo "⏳ Aguardando banco de dados..."
until npx prisma db execute --stdin 2>/dev/null <<EOF
SELECT 1
EOF
do
  sleep 2
done

echo "🔄 Rodando db push..."
npx prisma db push --accept-data-loss

echo "🌱 Rodando seed..."
npx prisma db seed || echo "⚠️  Seed já executado ou falhou (ignorando)"

echo "🚀 Iniciando aplicação (dev)..."
exec npm run dev
