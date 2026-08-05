-- Fluxo de caixas registradas pelo próprio cliente:
-- 1. fotoEtiquetaUrl passa a ser opcional (a foto da etiqueta é adicionada pela
--    equipe quando a caixa chega ao armazém e o recebimento é confirmado)
-- 2. status da caixa: PENDENTE (registrada pelo cliente, aguardando chegada)
--    ou RECEBIDA (confirmada no armazém pela equipe)
-- 3. recebidoEm vira a data de confirmação de recebimento (nullable)

ALTER TABLE "caixas_recebidas" ALTER COLUMN "fotoEtiquetaUrl" DROP NOT NULL;
ALTER TABLE "caixas_recebidas" ALTER COLUMN "recebidoEm" DROP NOT NULL;

CREATE TYPE "StatusCaixa" AS ENUM ('PENDENTE', 'RECEBIDA');
ALTER TABLE "caixas_recebidas" ADD COLUMN "status" "StatusCaixa" NOT NULL DEFAULT 'PENDENTE';

-- Caixas existentes que já possuem foto da etiqueta são consideradas recebidas
UPDATE "caixas_recebidas"
SET "status" = 'RECEBIDA', "recebidoEm" = "criadoEm"
WHERE "fotoEtiquetaUrl" IS NOT NULL AND "fotoEtiquetaUrl" <> '';

CREATE INDEX "caixas_recebidas_status_idx" ON "caixas_recebidas"("status");
CREATE INDEX "caixas_recebidas_clienteId_criadoEm_idx" ON "caixas_recebidas"("clienteId", "criadoEm" DESC);
DROP INDEX IF EXISTS "caixas_recebidas_clienteId_recebidoEm_idx";
