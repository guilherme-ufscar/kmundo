-- CreateTable
CREATE TABLE "shop_categorias" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "shop_categorias_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE UNIQUE INDEX "shop_categorias_nome_key" ON "shop_categorias"("nome");
-- CreateIndex
CREATE INDEX "shop_categorias_ativo_ordem_idx" ON "shop_categorias"("ativo", "ordem");
