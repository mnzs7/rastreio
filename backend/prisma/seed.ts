import { PrismaClient, PackageStatus, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@rastreio.com' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@rastreio.com',
      senha: adminPassword,
      role: Role.ADMIN,
    },
  });
  console.log('✅ Admin criado:', admin.email);

  const clientPassword = await bcrypt.hash('cliente123', 10);
  const cliente = await prisma.user.upsert({
    where: { email: 'cliente@rastreio.com' },
    update: {},
    create: {
      nome: 'Cliente Teste',
      email: 'cliente@rastreio.com',
      senha: clientPassword,
      role: Role.CLIENTE,
    },
  });
  console.log('✅ Cliente criado:', cliente.email);

  const packages = [
    {
      codigo_rastreio: 'BR123456789BR',
      remetente: 'Loja Online SA',
      destinatario: 'João Silva',
      descricao: 'Notebook Dell Inspiron',
      peso: 2.5,
      data_envio: new Date('2024-01-10'),
      data_entrega_prevista: new Date('2024-01-17'),
      status_atual: PackageStatus.ENTREGUE,
      historico: [
        { status: PackageStatus.AGUARDANDO_COLETA, localizacao: 'São Paulo, SP', observacao: 'Pedido gerado', data: new Date('2024-01-10T08:00:00') },
        { status: PackageStatus.COLETADO, localizacao: 'São Paulo, SP', observacao: 'Coletado pelo transportador', data: new Date('2024-01-10T14:00:00') },
        { status: PackageStatus.EM_TRANSITO, localizacao: 'Campinas, SP', observacao: 'Em trânsito para o destino', data: new Date('2024-01-11T09:00:00') },
        { status: PackageStatus.EM_SEPARACAO, localizacao: 'Rio de Janeiro, RJ', observacao: 'Em centro de distribuição', data: new Date('2024-01-13T11:00:00') },
        { status: PackageStatus.SAIU_PARA_ENTREGA, localizacao: 'Rio de Janeiro, RJ', observacao: 'Saiu para entrega', data: new Date('2024-01-14T07:30:00') },
        { status: PackageStatus.ENTREGUE, localizacao: 'Rio de Janeiro, RJ', observacao: 'Entregue ao destinatário', data: new Date('2024-01-14T15:45:00') },
      ],
    },
    {
      codigo_rastreio: 'BR987654321BR',
      remetente: 'Tech Store',
      destinatario: 'Maria Oliveira',
      descricao: 'Smartphone Samsung',
      peso: 0.3,
      data_envio: new Date(),
      data_entrega_prevista: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status_atual: PackageStatus.EM_TRANSITO,
      historico: [
        { status: PackageStatus.AGUARDANDO_COLETA, localizacao: 'Belo Horizonte, MG', observacao: 'Pedido confirmado', data: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        { status: PackageStatus.COLETADO, localizacao: 'Belo Horizonte, MG', observacao: 'Coletado', data: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
        { status: PackageStatus.EM_TRANSITO, localizacao: 'São Paulo, SP', observacao: 'Em trânsito', data: new Date(Date.now() - 12 * 60 * 60 * 1000) },
      ],
    },
    {
      codigo_rastreio: 'BR555444333BR',
      remetente: 'Supermercado Online',
      destinatario: 'Carlos Santos',
      descricao: 'Produtos alimentícios',
      peso: 5.0,
      data_envio: new Date(),
      data_entrega_prevista: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status_atual: PackageStatus.AGUARDANDO_COLETA,
      historico: [
        { status: PackageStatus.AGUARDANDO_COLETA, localizacao: 'Porto Alegre, RS', observacao: 'Pedido em processamento', data: new Date() },
      ],
    },
  ];

  for (const pkg of packages) {
    const { historico, ...packageData } = pkg;

    const existingPackage = await prisma.package.findUnique({
      where: { codigo_rastreio: pkg.codigo_rastreio },
    });

    if (!existingPackage) {
      const createdPackage = await prisma.package.create({
        data: {
          ...packageData,
          criado_por_id: admin.id,
        },
      });

      for (const hist of historico) {
        await prisma.statusHistory.create({
          data: {
            encomenda_id: createdPackage.id,
            status: hist.status,
            localizacao: hist.localizacao,
            observacao: hist.observacao,
            data_atualizacao: hist.data,
          },
        });
      }

      console.log(`✅ Pacote criado: ${pkg.codigo_rastreio}`);
    } else {
      console.log(`⚠️  Pacote já existe: ${pkg.codigo_rastreio}`);
    }
  }

  console.log('🎉 Seed concluído com sucesso!');
  console.log('\n📋 Credenciais de acesso:');
  console.log('  Admin: admin@rastreio.com / admin123');
  console.log('  Cliente: cliente@rastreio.com / cliente123');
  console.log('\n📦 Códigos de rastreio para teste:');
  console.log('  BR123456789BR (Entregue)');
  console.log('  BR987654321BR (Em Trânsito)');
  console.log('  BR555444333BR (Aguardando Coleta)');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
