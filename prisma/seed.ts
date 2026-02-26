// prisma/seed.ts
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Sheba12345', 10);

  await prisma.user.upsert({
    where: { email: 'Sheba77uu@example.com' },
    update: {},
    create: {
      email: 'Sheba77uu@example.com',
      name: 'Sheba',
      passwordHash,
      role: UserRole.ADMIN, // فقط هنا يمكنك وضع ADMIN
    },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());