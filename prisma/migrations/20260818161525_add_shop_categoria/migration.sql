-- AlterTable
ALTER TABLE "caixas_recebidas" ALTER COLUMN "recebidoEm" DROP DEFAULT;

-- AlterTable
ALTER TABLE "produtos_shop" ADD COLUMN     "categoria" TEXT;
