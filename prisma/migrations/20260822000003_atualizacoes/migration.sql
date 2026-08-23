-- CreateTable
CREATE TABLE "atualizacoes" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "publicadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "arquivada" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "atualizacoes_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "leituras_atualizacao" (
    "id" TEXT NOT NULL,
    "atualizacaoId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "confirmadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "leituras_atualizacao_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE INDEX "atualizacoes_arquivada_publicadaEm_idx" ON "atualizacoes"("arquivada", "publicadaEm" DESC);
-- CreateIndex
CREATE INDEX "leituras_atualizacao_atualizacaoId_confirmadoEm_idx" ON "leituras_atualizacao"("atualizacaoId", "confirmadoEm");
-- CreateIndex
CREATE INDEX "leituras_atualizacao_clienteId_confirmadoEm_idx" ON "leituras_atualizacao"("clienteId", "confirmadoEm" DESC);
-- CreateIndex
CREATE UNIQUE INDEX "leituras_atualizacao_atualizacaoId_clienteId_key" ON "leituras_atualizacao"("atualizacaoId", "clienteId");
-- AddForeignKey
ALTER TABLE "leituras_atualizacao" ADD CONSTRAINT "leituras_atualizacao_atualizacaoId_fkey" FOREIGN KEY ("atualizacaoId") REFERENCES "atualizacoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "leituras_atualizacao" ADD CONSTRAINT "leituras_atualizacao_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
