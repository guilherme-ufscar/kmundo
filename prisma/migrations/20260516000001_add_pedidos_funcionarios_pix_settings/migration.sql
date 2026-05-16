-- CreateEnum
CREATE TYPE "StatusPedidoCompra" AS ENUM ('AGUARDANDO_REVISAO', 'AGUARDANDO_PAGAMENTO', 'PAGO', 'COMPRADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "FormaPagamentoPedido" AS ENUM ('PIX', 'CARTAO_WHATSAPP');

-- CreateEnum
CREATE TYPE "StatusFuncionario" AS ENUM ('ATIVO', 'INATIVO');

-- CreateEnum
CREATE TYPE "TipoLancamentoFuncionario" AS ENUM ('PAGAMENTO', 'HORA_EXTRA', 'ATESTADO', 'DESCONTO', 'OBSERVACAO');

-- AlterTable
ALTER TABLE "configuracoes"
  ADD COLUMN "whatsappRecepcao" TEXT,
  ADD COLUMN "chavePix" TEXT,
  ADD COLUMN "qrCodePix" TEXT,
  ADD COLUMN "instrucoesPix" TEXT;

-- CreateTable
CREATE TABLE "pedidos_compra" (
  "id" TEXT NOT NULL,
  "clienteId" TEXT NOT NULL,
  "status" "StatusPedidoCompra" NOT NULL DEFAULT 'AGUARDANDO_REVISAO',
  "valorTotal" DOUBLE PRECISION,
  "moeda" TEXT NOT NULL DEFAULT 'BRL',
  "chavePix" TEXT,
  "qrCodePix" TEXT,
  "instrucoesPix" TEXT,
  "linkCartao" TEXT,
  "whatsappRecepcao" TEXT,
  "observacoesCliente" TEXT,
  "observacoesAdmin" TEXT,
  "dataLimitePagamento" TIMESTAMP(3),
  "formaPagamentoCliente" "FormaPagamentoPedido",
  "pagoEm" TIMESTAMP(3),
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "pedidos_compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos_compra_itens" (
  "id" TEXT NOT NULL,
  "pedidoCompraId" TEXT NOT NULL,
  "nomeProduto" TEXT NOT NULL,
  "urlProduto" TEXT,
  "quantidade" INTEGER NOT NULL DEFAULT 1,
  "variacao" TEXT,
  "observacoes" TEXT,

  CONSTRAINT "pedidos_compra_itens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funcionarios" (
  "id" TEXT NOT NULL,
  "nomeCompleto" TEXT NOT NULL,
  "email" TEXT,
  "telefone" TEXT,
  "cargo" TEXT,
  "dataAdmissao" TIMESTAMP(3),
  "salarioBase" DOUBLE PRECISION,
  "status" "StatusFuncionario" NOT NULL DEFAULT 'ATIVO',
  "observacoes" TEXT,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "funcionarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lancamentos_funcionario" (
  "id" TEXT NOT NULL,
  "funcionarioId" TEXT NOT NULL,
  "tipo" "TipoLancamentoFuncionario" NOT NULL,
  "dataReferencia" TIMESTAMP(3) NOT NULL,
  "valor" DOUBLE PRECISION,
  "horas" DOUBLE PRECISION,
  "quantidadeDias" INTEGER,
  "arquivoAtestado" TEXT,
  "descricao" TEXT,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "lancamentos_funcionario_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pedidos_compra"
  ADD CONSTRAINT "pedidos_compra_clienteId_fkey"
  FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos_compra_itens"
  ADD CONSTRAINT "pedidos_compra_itens_pedidoCompraId_fkey"
  FOREIGN KEY ("pedidoCompraId") REFERENCES "pedidos_compra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamentos_funcionario"
  ADD CONSTRAINT "lancamentos_funcionario_funcionarioId_fkey"
  FOREIGN KEY ("funcionarioId") REFERENCES "funcionarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
