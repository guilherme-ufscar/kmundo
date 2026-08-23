-- AlterEnum
ALTER TYPE "StatusPedidoCompra" ADD VALUE 'AGUARDANDO_CONFIRMACAO';
-- AlterTable
ALTER TABLE "pedidos_compra" ADD COLUMN     "comprovanteCompraUrl" TEXT,
ADD COLUMN     "comprovanteConfirmadoEm" TIMESTAMP(3),
ADD COLUMN     "comprovanteEnviadoEm" TIMESTAMP(3),
ADD COLUMN     "comprovantePagamentoUrl" TEXT;
-- CreateTable
CREATE TABLE "pedido_config" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL DEFAULT 'Pedidos de Compra',
    "subtitulo" TEXT,
    "introducaoHtml" TEXT,
    "comoFuncionaHtml" TEXT,
    "passoAPassoHtml" TEXT,
    "podeNaoPodeHtml" TEXT,
    "etapasHtml" TEXT,
    "regrasHtml" TEXT,
    "posPedidoHtml" TEXT,
    "regrasAdicionaisHtml" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "pedido_config_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "frete_paises" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "moeda" TEXT NOT NULL DEFAULT 'BRL',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "frete_paises_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "frete_caixas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "comprimento" DOUBLE PRECISION,
    "largura" DOUBLE PRECISION,
    "altura" DOUBLE PRECISION,
    "pesoMax" DOUBLE PRECISION,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "frete_caixas_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "frete_tarifas" (
    "id" TEXT NOT NULL,
    "paisId" TEXT NOT NULL,
    "caixaTipoId" TEXT,
    "pesoMin" DOUBLE PRECISION NOT NULL,
    "pesoMax" DOUBLE PRECISION NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "moeda" TEXT NOT NULL DEFAULT 'BRL',
    "taxaServico" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "frete_tarifas_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "frete_config" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL DEFAULT 'Calculadora de Frete',
    "subtitulo" TEXT,
    "introducaoHtml" TEXT,
    "comoFuncionaHtml" TEXT,
    "avisoEstimativaHtml" TEXT,
    "comoPesoHtml" TEXT,
    "comoPaisHtml" TEXT,
    "comoCaixasHtml" TEXT,
    "taxasServicoHtml" TEXT,
    "diferencasValorHtml" TEXT,
    "regrasAdicionaisHtml" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "frete_config_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE UNIQUE INDEX "frete_paises_codigo_key" ON "frete_paises"("codigo");
-- CreateIndex
CREATE INDEX "frete_paises_ativo_ordem_idx" ON "frete_paises"("ativo", "ordem");
-- CreateIndex
CREATE INDEX "frete_caixas_ativo_ordem_idx" ON "frete_caixas"("ativo", "ordem");
-- CreateIndex
CREATE INDEX "frete_tarifas_paisId_caixaTipoId_ativo_idx" ON "frete_tarifas"("paisId", "caixaTipoId", "ativo");
-- CreateIndex
CREATE INDEX "frete_tarifas_paisId_pesoMin_pesoMax_idx" ON "frete_tarifas"("paisId", "pesoMin", "pesoMax");
-- AddForeignKey
ALTER TABLE "frete_tarifas" ADD CONSTRAINT "frete_tarifas_paisId_fkey" FOREIGN KEY ("paisId") REFERENCES "frete_paises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "frete_tarifas" ADD CONSTRAINT "frete_tarifas_caixaTipoId_fkey" FOREIGN KEY ("caixaTipoId") REFERENCES "frete_caixas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
