-- AlterTable
ALTER TABLE "envios" ADD COLUMN "valorFrete" DOUBLE PRECISION;
ALTER TABLE "envios" ADD COLUMN "moedaFrete" TEXT DEFAULT 'BRL';
