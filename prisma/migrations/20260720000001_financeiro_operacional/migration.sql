CREATE TYPE "TipoServico" AS ENUM ('UNBOXING', 'FOTO_VIDEO', 'MEDICAO', 'REEMBALAGEM', 'OUTRO');
CREATE TYPE "StatusServico" AS ENUM ('SOLICITADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO');
CREATE TYPE "StatusCobranca" AS ENUM ('PENDENTE', 'COMPROVANTE_ENVIADO', 'PAGO', 'CANCELADA');
CREATE TYPE "TipoNotaFiscal" AS ENUM ('NFE', 'NFSE');
CREATE TYPE "StatusNotaFiscal" AS ENUM ('PENDENTE', 'EMITIDA', 'ERRO', 'CANCELADA');

ALTER TABLE "envios" ADD COLUMN "declaracaoConteudo" TEXT;
ALTER TABLE "clientes" ADD COLUMN "documento" TEXT;

CREATE TABLE "caixas_recebidas" (
  "id" TEXT NOT NULL,
  "clienteId" TEXT NOT NULL,
  "itemId" TEXT,
  "tracking" TEXT NOT NULL,
  "lojaOrigem" TEXT,
  "comprovanteCompraUrl" TEXT NOT NULL,
  "fotoEtiquetaUrl" TEXT NOT NULL,
  "observacoes" TEXT,
  "recebidoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "caixas_recebidas_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "caixas_recebidas_itemId_key" ON "caixas_recebidas"("itemId");
CREATE UNIQUE INDEX "caixas_recebidas_clienteId_tracking_key" ON "caixas_recebidas"("clienteId", "tracking");
CREATE INDEX "caixas_recebidas_tracking_idx" ON "caixas_recebidas"("tracking");
CREATE INDEX "caixas_recebidas_clienteId_recebidoEm_idx" ON "caixas_recebidas"("clienteId", "recebidoEm" DESC);

CREATE TABLE "solicitacoes_servico" (
  "id" TEXT NOT NULL,
  "clienteId" TEXT NOT NULL,
  "caixaId" TEXT,
  "tipo" "TipoServico" NOT NULL,
  "status" "StatusServico" NOT NULL DEFAULT 'SOLICITADO',
  "descricao" TEXT,
  "fotoUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "videoUrl" TEXT,
  "peso" DOUBLE PRECISION,
  "largura" DOUBLE PRECISION,
  "altura" DOUBLE PRECISION,
  "comprimento" DOUBLE PRECISION,
  "concluidoEm" TIMESTAMP(3),
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "solicitacoes_servico_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "solicitacoes_servico_clienteId_criadoEm_idx" ON "solicitacoes_servico"("clienteId", "criadoEm" DESC);
CREATE INDEX "solicitacoes_servico_caixaId_idx" ON "solicitacoes_servico"("caixaId");

CREATE TABLE "cobrancas" (
  "id" TEXT NOT NULL,
  "clienteId" TEXT NOT NULL,
  "envioId" TEXT,
  "solicitacaoId" TEXT,
  "descricao" TEXT NOT NULL,
  "valor" DOUBLE PRECISION NOT NULL,
  "moeda" TEXT NOT NULL DEFAULT 'BRL',
  "status" "StatusCobranca" NOT NULL DEFAULT 'PENDENTE',
  "chavePix" TEXT,
  "copiaEColaPix" TEXT,
  "comprovanteUrl" TEXT,
  "pagoEm" TIMESTAMP(3),
  "confirmadoEm" TIMESTAMP(3),
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "cobrancas_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "cobrancas_clienteId_criadoEm_idx" ON "cobrancas"("clienteId", "criadoEm" DESC);
CREATE INDEX "cobrancas_status_idx" ON "cobrancas"("status");

CREATE TABLE "notas_fiscais" (
  "id" TEXT NOT NULL,
  "cobrancaId" TEXT NOT NULL,
  "tipo" "TipoNotaFiscal" NOT NULL,
  "status" "StatusNotaFiscal" NOT NULL DEFAULT 'PENDENTE',
  "numero" TEXT,
  "chaveAcesso" TEXT,
  "urlPdf" TEXT,
  "blingDocumentoId" TEXT,
  "erro" TEXT,
  "emitidaEm" TIMESTAMP(3),
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "notas_fiscais_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "notas_fiscais_cobrancaId_key" ON "notas_fiscais"("cobrancaId");
CREATE INDEX "notas_fiscais_status_idx" ON "notas_fiscais"("status");

CREATE TABLE "eventos_envio" (
  "id" TEXT NOT NULL,
  "envioId" TEXT NOT NULL,
  "titulo" TEXT NOT NULL,
  "descricao" TEXT,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "eventos_envio_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "eventos_envio_envioId_criadoEm_idx" ON "eventos_envio"("envioId", "criadoEm");

ALTER TABLE "caixas_recebidas" ADD CONSTRAINT "caixas_recebidas_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "caixas_recebidas" ADD CONSTRAINT "caixas_recebidas_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "itens"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "solicitacoes_servico" ADD CONSTRAINT "solicitacoes_servico_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "solicitacoes_servico" ADD CONSTRAINT "solicitacoes_servico_caixaId_fkey" FOREIGN KEY ("caixaId") REFERENCES "caixas_recebidas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "cobrancas" ADD CONSTRAINT "cobrancas_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "cobrancas" ADD CONSTRAINT "cobrancas_envioId_fkey" FOREIGN KEY ("envioId") REFERENCES "envios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "cobrancas" ADD CONSTRAINT "cobrancas_solicitacaoId_fkey" FOREIGN KEY ("solicitacaoId") REFERENCES "solicitacoes_servico"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "notas_fiscais" ADD CONSTRAINT "notas_fiscais_cobrancaId_fkey" FOREIGN KEY ("cobrancaId") REFERENCES "cobrancas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "eventos_envio" ADD CONSTRAINT "eventos_envio_envioId_fkey" FOREIGN KEY ("envioId") REFERENCES "envios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
