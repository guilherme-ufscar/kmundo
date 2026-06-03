#!/bin/bash
# Script para corrigir problema de cache no AApanel para Next.js
# Uso: ./fix-nginx-cache.sh

set -e

CONFIG_FILE="/www/server/panel/vhost/nginx/kmundowarehouse.com.conf"

echo "=== Corrigindo cache do nginx para Next.js ==="

# 1. Remover cache do proxy_cache_path (comenta a linha)
echo "Removendo configuração de proxy_cache..."
sed -i 's/^proxy_cache_path/#proxy_cache_path/' "$CONFIG_FILE"

# 2. Adicionar headers para evitar cache de HTML
# Verifica se já existe o location /_next
if grep -q "location /_next/static/" "$CONFIG_FILE"; then
    echo "Location /_next/static já existe"
else
    echo "Adicionando location para arquivos estáticos..."
    # Insere antes do location ^~ / {
    sed -i '/location \^\~ \/ {/i\
    # Next.js static files - bypass cache\
    location /_next/static/ {\
        proxy_pass http://127.0.0.1:8300;\
        proxy_cache_bypass 1;\
        add_header Cache-Control "public, max-age=31536000, immutable";\
    }\
\
    # Next.js static chunks\
    location /_next/chunks/ {\
        proxy_pass http://127.0.0.1:8300;\
        proxy_cache_bypass 1;\
        add_header Cache-Control "public, max-age=31536000, immutable";\
    }\
' "$CONFIG_FILE"
fi

# 3. Adicionar headers no location principal para evitar cache de HTML
echo "Adicionando headers anti-cache..."

# Verifica se já tem os headers
if ! grep -q "Cache-Control.*no-cache" "$CONFIG_FILE"; then
    sed -i '/location \^\~ \/ {/a\
\
    # Disable caching for HTML pages\
    proxy_cache_bypass 1;\
    expires off;\
    add_header Cache-Control "no-cache, no-store, must-revalidate";\
    add_header Pragma "no-cache";' "$CONFIG_FILE"
fi

# 4. Limpar cache existente
echo "Limpando cache antigo..."
rm -rf /www/wwwroot/kmundowarehouse.com/proxy_cache_dir/* 2>/dev/null || true

# 5. Testar e reload nginx
echo "Testando configuração do nginx..."
nginx -t

echo "Reload do nginx..."
nginx -s reload

echo ""
echo "=== Feito! ==="
echo "O cache foi desabilitado e os headers anti-cache foram adicionados."
echo "Tente acessar o site agora."