import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // Configuração padrão
  const configuracao = await prisma.configuracao.upsert({
    where: { id: 'config-default' },
    update: {},
    create: {
      id: 'config-default',
      diasGratuitos: 30,
      taxaDiariaArmazem: 0,
      moedaTaxa: 'USD',
      nomeEmpresa: 'KMundo Warehouse',
      emailContato: process.env.ADMIN_EMAIL ?? 'contato@kmundowarehouse.com',
    },
  })
  console.log('✅ Configuração criada:', configuracao.nomeEmpresa)

  // Admin
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@kmundowarehouse.com'
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin@123'
  const adminHash = await hash(adminPassword, 12)

  const admin = await prisma.usuario.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      senha: adminHash,
      role: 'ADMIN',
    },
  })
  console.log('✅ Admin criado:', admin.email)

  // 5 clientes com dados realistas
  const clientes = [
    {
      email: 'ana.souza@gmail.com',
      senha: 'Cliente@123',
      nome: 'Ana Luiza Souza',
      telefone: '+55 11 99234-5678',
      pais: 'Brazil',
      cidade: 'São Paulo',
      cep: '01310-100',
      endereco: 'Av. Paulista, 1000, Apto 42',
      suite: 1,
    },
    {
      email: 'beatriz.lima@gmail.com',
      senha: 'Cliente@123',
      nome: 'Beatriz Lima Ferreira',
      telefone: '+55 21 98765-4321',
      pais: 'Brazil',
      cidade: 'Rio de Janeiro',
      cep: '22460-040',
      endereco: 'Rua Garcia d\'Ávila, 56',
      suite: 2,
    },
    {
      email: 'carolina.m@hotmail.com',
      senha: 'Cliente@123',
      nome: 'Carolina Mendes',
      telefone: '+55 31 97654-3210',
      pais: 'Brazil',
      cidade: 'Belo Horizonte',
      cep: '30140-110',
      endereco: 'Av. Afonso Pena, 500',
      suite: 3,
    },
    {
      email: 'daniela.costa@gmail.com',
      senha: 'Cliente@123',
      nome: 'Daniela Costa Rodrigues',
      telefone: '+351 91 234-5678',
      pais: 'Portugal',
      cidade: 'Lisboa',
      cep: '1200-109',
      endereco: 'Rua Augusta, 150',
      suite: 4,
    },
    {
      email: 'fernanda.park@gmail.com',
      senha: 'Cliente@123',
      nome: 'Fernanda Park',
      telefone: '+55 48 99876-5432',
      pais: 'Brazil',
      cidade: 'Florianópolis',
      cep: '88010-000',
      endereco: 'Rua Felipe Schmidt, 200',
      suite: 5,
    },
  ]

  const clienteIds: string[] = []

  for (const c of clientes) {
    const senhaHash = await hash(c.senha, 12)
    const usuario = await prisma.usuario.upsert({
      where: { email: c.email },
      update: {},
      create: {
        email: c.email,
        senha: senhaHash,
        role: 'CLIENTE',
        cliente: {
          create: {
            numeroDeSuite: c.suite,
            nomeCompleto: c.nome,
            telefone: c.telefone,
            pais: c.pais,
            cidade: c.cidade,
            cep: c.cep,
            endereco: c.endereco,
            status: 'ATIVA',
          },
        },
      },
      include: { cliente: true },
    })
    if (usuario.cliente) {
      clienteIds.push(usuario.cliente.id)
      console.log(`✅ Cliente Suite #${String(c.suite).padStart(3, '0')}: ${c.nome}`)
    }
  }

  // Buscar IDs dos clientes reais
  const clientesDb = await prisma.cliente.findMany({
    where: { numeroDeSuite: { in: [1, 2, 3, 4, 5] } },
    orderBy: { numeroDeSuite: 'asc' },
  })

  const idBySuite = Object.fromEntries(clientesDb.map((c) => [c.numeroDeSuite, c.id]))

  // Itens distribuídos com status e datas variados
  const agora = new Date()
  const diasAtras = (n: number) => new Date(agora.getTime() - n * 24 * 60 * 60 * 1000)

  const itens = [
    // Suite 1 — Ana Luiza
    {
      clienteId: idBySuite[1],
      descricao: 'COSRX Advanced Snail 96 Mucin Power Essence',
      lojaOrigem: 'Olive Young',
      trackingLoja: 'OY2024001234',
      peso: 0.35,
      valorDeclarado: 35000,
      moeda: 'KRW',
      status: 'EM_ARMAZEM' as const,
      dataEntrada: diasAtras(45),
    },
    {
      clienteId: idBySuite[1],
      descricao: 'Laneige Lip Sleeping Mask Berry 20g',
      lojaOrigem: 'Olive Young',
      trackingLoja: 'OY2024001235',
      peso: 0.1,
      valorDeclarado: 12000,
      moeda: 'KRW',
      status: 'RECEBIDO' as const,
      dataEntrada: diasAtras(5),
    },
    // Suite 2 — Beatriz
    {
      clienteId: idBySuite[2],
      descricao: 'Some By Mi AHA BHA PHA 30 Days Miracle Toner',
      lojaOrigem: 'Coupang',
      trackingLoja: 'CP2024009876',
      peso: 0.25,
      valorDeclarado: 18000,
      moeda: 'KRW',
      status: 'ENVIADO' as const,
      dataEntrada: diasAtras(70),
      dataEnvio: diasAtras(10),
    },
    {
      clienteId: idBySuite[2],
      descricao: 'Etude House Soon Jung 2x Barrier Intensive Cream',
      lojaOrigem: 'Olive Young',
      trackingLoja: 'OY2024002111',
      peso: 0.15,
      valorDeclarado: 22000,
      moeda: 'KRW',
      status: 'RECEBIDO' as const,
      dataEntrada: diasAtras(3),
    },
    // Suite 3 — Carolina
    {
      clienteId: idBySuite[3],
      descricao: 'Sulwhasoo Concentrated Ginseng Renewing Serum',
      lojaOrigem: 'Sulwhasoo Official',
      trackingLoja: 'SW2024005500',
      peso: 0.08,
      valorDeclarado: 180000,
      moeda: 'KRW',
      status: 'ENTREGUE' as const,
      dataEntrada: diasAtras(95),
      dataEnvio: diasAtras(60),
      dataEntrega: diasAtras(45),
    },
    {
      clienteId: idBySuite[3],
      descricao: 'Innisfree Green Tea Seed Serum 80ml',
      lojaOrigem: 'Olive Young',
      trackingLoja: 'OY2024003300',
      peso: 0.12,
      valorDeclarado: 28000,
      moeda: 'KRW',
      status: 'EM_ARMAZEM' as const,
      dataEntrada: diasAtras(80),
    },
    {
      clienteId: idBySuite[3],
      descricao: 'Round Lab Birch Juice Moisturizing Toner',
      lojaOrigem: 'Olive Young',
      trackingLoja: 'OY2024003301',
      peso: 0.22,
      valorDeclarado: 19000,
      moeda: 'KRW',
      status: 'RECEBIDO' as const,
      dataEntrada: diasAtras(2),
    },
    // Suite 4 — Daniela
    {
      clienteId: idBySuite[4],
      descricao: 'Dr. Jart+ Cicapair Tiger Grass Cream',
      lojaOrigem: 'Coupang',
      trackingLoja: 'CP2024007700',
      peso: 0.06,
      valorDeclarado: 45000,
      moeda: 'KRW',
      status: 'EM_ENVIO' as const,
      dataEntrada: diasAtras(35),
      dataEnvio: diasAtras(2),
    },
    {
      clienteId: idBySuite[4],
      descricao: 'Missha Time Revolution Night Repair Ampoule',
      lojaOrigem: 'Olive Young',
      trackingLoja: 'OY2024004400',
      peso: 0.05,
      valorDeclarado: 55000,
      moeda: 'KRW',
      status: 'RECEBIDO' as const,
      dataEntrada: diasAtras(10),
    },
    // Suite 5 — Fernanda
    {
      clienteId: idBySuite[5],
      descricao: 'Klairs Supple Preparation Unscented Toner',
      lojaOrigem: 'Olive Young',
      trackingLoja: 'OY2024005500',
      peso: 0.2,
      valorDeclarado: 24000,
      moeda: 'KRW',
      status: 'ENTREGUE' as const,
      dataEntrada: diasAtras(65),
      dataEnvio: diasAtras(35),
      dataEntrega: diasAtras(20),
    },
    {
      clienteId: idBySuite[5],
      descricao: 'Purito Centella Green Level Unscented Sun SPF50',
      lojaOrigem: 'Coupang',
      trackingLoja: 'CP2024008800',
      peso: 0.07,
      valorDeclarado: 16000,
      moeda: 'KRW',
      status: 'EM_ARMAZEM' as const,
      dataEntrada: diasAtras(55),
    },
    {
      clienteId: idBySuite[5],
      descricao: 'Beauty of Joseon Relief Sun: Rice + Probiotics SPF50',
      lojaOrigem: 'Olive Young',
      trackingLoja: 'OY2024005501',
      peso: 0.09,
      valorDeclarado: 15000,
      moeda: 'KRW',
      status: 'RECEBIDO' as const,
      dataEntrada: diasAtras(7),
    },
  ]

  for (const item of itens) {
    if (!item.clienteId) continue
    await prisma.item.create({
      data: {
        clienteId: item.clienteId,
        descricao: item.descricao,
        lojaOrigem: item.lojaOrigem,
        trackingLoja: item.trackingLoja,
        peso: item.peso,
        valorDeclarado: item.valorDeclarado,
        moeda: item.moeda,
        status: item.status,
        dataEntrada: item.dataEntrada,
        dataEnvio: 'dataEnvio' in item ? item.dataEnvio : undefined,
        dataEntrega: 'dataEntrega' in item ? item.dataEntrega : undefined,
      },
    })
  }
  console.log(`✅ ${itens.length} itens criados com status e datas variados`)

  console.log('\n🎉 Seed concluído!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`Admin:    ${adminEmail} / ${adminPassword}`)
  console.log('Clientes: ana.souza@gmail.com / Cliente@123 (Suite #001)')
  console.log('          beatriz.lima@gmail.com / Cliente@123 (Suite #002)')
  console.log('          carolina.m@hotmail.com / Cliente@123 (Suite #003)')
  console.log('          daniela.costa@gmail.com / Cliente@123 (Suite #004)')
  console.log('          fernanda.park@gmail.com / Cliente@123 (Suite #005)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
