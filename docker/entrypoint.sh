#!/bin/sh
set -e

echo "⏳ Aguardando banco de dados..."
until echo "SELECT 1" | npx prisma db execute --stdin 2>/dev/null; do
  sleep 2
done

echo "🔄 Rodando migrations..."
npx prisma migrate deploy

echo "🌱 Rodando seed..."
npx prisma db seed || echo "⚠️  Seed já executado ou falhou (ignorando)"

echo "🚀 Iniciando aplicação..."
exec npm run dev
