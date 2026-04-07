-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'CLIENTE');

-- CreateEnum
CREATE TYPE "StatusCliente" AS ENUM ('PENDENTE', 'ATIVA', 'SUSPENSA');

-- CreateEnum
CREATE TYPE "StatusItem" AS ENUM ('RECEBIDO', 'EM_ARMAZEM', 'EM_ENVIO', 'ENVIADO', 'ENTREGUE');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CLIENTE',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "numeroDeSuite" INTEGER NOT NULL,
    "nomeCompleto" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "pais" TEXT NOT NULL,
    "endereco" TEXT,
    "cidade" TEXT,
    "cep" TEXT,
    "fotoPerfil" TEXT,
    "status" "StatusCliente" NOT NULL DEFAULT 'ATIVA',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clientes_usuarioId_key" ON "clientes"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_numeroDeSuite_key" ON "clientes"("numeroDeSuite");

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "itens" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "lojaOrigem" TEXT,
    "trackingLoja" TEXT,
    "peso" DOUBLE PRECISION,
    "largura" DOUBLE PRECISION,
    "altura" DOUBLE PRECISION,
    "comprimento" DOUBLE PRECISION,
    "valorDeclarado" DOUBLE PRECISION,
    "moeda" TEXT DEFAULT 'KRW',
    "fotos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "observacoes" TEXT,
    "status" "StatusItem" NOT NULL DEFAULT 'RECEBIDO',
    "dataEntrada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataEnvio" TIMESTAMP(3),
    "dataEntrega" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itens_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "itens" ADD CONSTRAINT "itens_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "tokens_recuperacao" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokens_recuperacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tokens_recuperacao_token_key" ON "tokens_recuperacao"("token");

-- CreateTable
CREATE TABLE "convites_cliente" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "convites_cliente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "convites_cliente_token_key" ON "convites_cliente"("token");

-- CreateTable
CREATE TABLE "configuracoes" (
    "id" TEXT NOT NULL,
    "diasGratuitos" INTEGER NOT NULL DEFAULT 30,
    "taxaDiariaArmazem" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "moedaTaxa" TEXT NOT NULL DEFAULT 'USD',
    "nomeEmpresa" TEXT NOT NULL DEFAULT 'KMundo Warehouse',
    "emailContato" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracoes_pkey" PRIMARY KEY ("id")
);
