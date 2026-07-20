CREATE TABLE "produtos_shop" (
  "id" TEXT NOT NULL,
  "nome" TEXT NOT NULL,
  "descricao" TEXT,
  "precoEstimado" DOUBLE PRECISION,
  "moeda" TEXT NOT NULL DEFAULT 'BRL',
  "imagemUrl" TEXT,
  "urlProduto" TEXT,
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "ordem" INTEGER NOT NULL DEFAULT 0,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "produtos_shop_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "pedidos_compra_itens" ADD COLUMN "produtoShopId" TEXT;

CREATE INDEX "produtos_shop_ativo_ordem_idx" ON "produtos_shop"("ativo", "ordem");
CREATE INDEX "pedidos_compra_itens_produtoShopId_idx" ON "pedidos_compra_itens"("produtoShopId");

ALTER TABLE "pedidos_compra_itens"
  ADD CONSTRAINT "pedidos_compra_itens_produtoShopId_fkey"
  FOREIGN KEY ("produtoShopId") REFERENCES "produtos_shop"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
