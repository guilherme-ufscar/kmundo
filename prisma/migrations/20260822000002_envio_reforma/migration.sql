-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.
ALTER TYPE "StatusEnvio" ADD VALUE 'AGUARDANDO_PAGAMENTO';
ALTER TYPE "StatusEnvio" ADD VALUE 'AGUARDANDO_CONFIRMACAO_PAGAMENTO';
ALTER TYPE "StatusEnvio" ADD VALUE 'PAGAMENTO_FEITO';
ALTER TYPE "StatusEnvio" ADD VALUE 'CAIXA_RECEBIDA';
-- AlterTable
ALTER TABLE "envios" ADD COLUMN     "aceitouTermos" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "aceitouTermosEm" TIMESTAMP(3),
ADD COLUMN     "caixaRecebidaConfirmadaPor" TEXT,
ADD COLUMN     "caixaRecebidaEm" TIMESTAMP(3),
ADD COLUMN     "comprovanteFreteEnviadoEm" TIMESTAMP(3),
ADD COLUMN     "comprovanteFreteUrl" TEXT,
ADD COLUMN     "enderecoCompleto" TEXT,
ADD COLUMN     "enderecoCoreano" TEXT,
ADD COLUMN     "fotosRecebimento" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "telefoneCoreano" TEXT,
ADD COLUMN     "usarEnderecoCoreano" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "valorDeclaradoTexto" TEXT;
-- CreateTable
CREATE TABLE "envio_config" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL DEFAULT 'Envios',
    "subtitulo" TEXT,
    "introducaoHtml" TEXT,
    "termosUsoHtml" TEXT,
    "avisoValorDeclaradoHtml" TEXT,
    "avisoEnderecoHtml" TEXT,
    "avisoEnderecoCoreanoHtml" TEXT,
    "painelInfoHtml" TEXT,
    "statusAguardandoConfirmacaoHtml" TEXT,
    "statusAguardandoPagamentoHtml" TEXT,
    "statusAguardandoConfirmacaoPagamentoHtml" TEXT,
    "statusPagamentoFeitoHtml" TEXT,
    "statusEnviadoHtml" TEXT,
    "statusCaixaRecebidaHtml" TEXT,
    "prazosHtml" TEXT,
    "pagamentoHtml" TEXT,
    "comprovanteHtml" TEXT,
    "envioHtml" TEXT,
    "recebimentoHtml" TEXT,
    "regrasAdicionaisHtml" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "envio_config_pkey" PRIMARY KEY ("id")
);
