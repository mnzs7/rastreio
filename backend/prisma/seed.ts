import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const TEST_CODES = ['BR123456789BR', 'BR987654321BR', 'BR555444333BR'];
const TEST_EMAILS = ['cliente@rastreio.com'];

async function main() {
  console.log('🌱 Iniciando configuração do banco de dados...');

  // Remove dados de demonstração se ainda existirem
  for (const codigo of TEST_CODES) {
    const pkg = await prisma.package.findUnique({ where: { codigo_rastreio: codigo } });
    if (pkg) {
      await prisma.statusHistory.deleteMany({ where: { encomenda_id: pkg.id } });
      await prisma.package.delete({ where: { id: pkg.id } });
      console.log(`🗑️  Pacote de demonstração removido: ${codigo}`);
    }
  }

  for (const email of TEST_EMAILS) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.user.delete({ where: { email } });
      console.log(`🗑️  Usuário de demonstração removido: ${email}`);
    }
  }

  // Garante que o admin existe
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
  console.log('✅ Administrador configurado:', admin.email);

  console.log('🎉 Banco de dados pronto para uso!');
  console.log('\n⚠️  Lembre-se de alterar a senha do administrador após o primeiro acesso.');
}

main()
  .catch((e) => {
    console.error('❌ Erro na configuração:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
