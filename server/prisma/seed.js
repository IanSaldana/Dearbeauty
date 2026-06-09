require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 12);

  const manicurista = await prisma.manicurista.upsert({
    where: { email: 'admin@dearbeauty.com' },
    update: {},
    create: {
      nombre: 'Manicurista',
      email: 'admin@dearbeauty.com',
      password_hash: passwordHash,
    },
  });

  console.log('Manicurista creada:', manicurista.email);
  console.log('Password: admin123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
