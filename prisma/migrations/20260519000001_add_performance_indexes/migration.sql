-- CreateIndex
CREATE INDEX "itens_clienteId_status_idx" ON "itens"("clienteId", "status");

-- CreateIndex
CREATE INDEX "itens_clienteId_dataEntrada_idx" ON "itens"("clienteId", "dataEntrada" DESC);

-- CreateIndex
CREATE INDEX "itens_status_dataEntrada_idx" ON "itens"("status", "dataEntrada");

-- CreateIndex
CREATE INDEX "itens_criadoEm_idx" ON "itens"("criadoEm");

-- CreateIndex
CREATE INDEX "envios_clienteId_criadoEm_idx" ON "envios"("clienteId", "criadoEm" DESC);

-- CreateIndex
CREATE INDEX "envios_clienteId_status_idx" ON "envios"("clienteId", "status");

-- CreateIndex
CREATE INDEX "pedidos_compra_clienteId_criadoEm_idx" ON "pedidos_compra"("clienteId", "criadoEm" DESC);

-- CreateIndex
CREATE INDEX "pedidos_compra_clienteId_status_idx" ON "pedidos_compra"("clienteId", "status");

-- CreateIndex
CREATE INDEX "clientes_status_idx" ON "clientes"("status");

-- CreateIndex
CREATE INDEX "itens_envio_envioId_idx" ON "itens_envio"("envioId");

-- CreateIndex
CREATE INDEX "itens_envio_itemId_idx" ON "itens_envio"("itemId");
