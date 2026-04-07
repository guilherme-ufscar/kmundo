-- AlterTable: remover campos de Item que migram para Envio
ALTER TABLE "itens" DROP COLUMN IF EXISTS "peso";
ALTER TABLE "itens" DROP COLUMN IF EXISTS "largura";
ALTER TABLE "itens" DROP COLUMN IF EXISTS "altura";
ALTER TABLE "itens" DROP COLUMN IF EXISTS "comprimento";
ALTER TABLE "itens" DROP COLUMN IF EXISTS "valorDeclarado";
ALTER TABLE "itens" DROP COLUMN IF EXISTS "moeda";

-- CreateEnum
CREATE TYPE "MetodoEnvio" AS ENUM ('FEDEX', 'EMS', 'ENVIO_EM_GRUPO');

-- CreateEnum
CREATE TYPE "StatusEnvio" AS ENUM ('AGUARDANDO_CONFIRMACAO', 'CONFIRMADO', 'PAGO', 'ENVIADO', 'ENTREGUE');

-- CreateTable
CREATE TABLE "envios" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "metodoEnvio" "MetodoEnvio" NOT NULL,
    "status" "StatusEnvio" NOT NULL DEFAULT 'AGUARDANDO_CONFIRMACAO',
    "peso" DOUBLE PRECISION,
    "largura" DOUBLE PRECISION,
    "altura" DOUBLE PRECISION,
    "comprimento" DOUBLE PRECISION,
    "valorDeclarado" DOUBLE PRECISION,
    "moeda" TEXT DEFAULT 'KRW',
    "fotos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "videoUrl" TEXT,
    "trackingEnvio" TEXT,
    "dataLimitePagamento" TIMESTAMP(3),
    "observacoes" TEXT,
    "confirmadoCliente" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "envios_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "envios" ADD CONSTRAINT "envios_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "itens_envio" (
    "id" TEXT NOT NULL,
    "envioId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,

    CONSTRAINT "itens_envio_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "itens_envio" ADD CONSTRAINT "itens_envio_envioId_fkey" FOREIGN KEY ("envioId") REFERENCES "envios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_envio" ADD CONSTRAINT "itens_envio_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "itens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
