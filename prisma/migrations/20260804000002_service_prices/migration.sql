-- Preços dos serviços solicitados pelo cliente (configuráveis no admin)
ALTER TABLE "configuracoes" ADD COLUMN "precoUnboxing" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "configuracoes" ADD COLUMN "precoFotoVideo" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "configuracoes" ADD COLUMN "precoMedicao" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "configuracoes" ADD COLUMN "precoReembalagem" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "configuracoes" ADD COLUMN "precoOutro" DOUBLE PRECISION NOT NULL DEFAULT 0;
