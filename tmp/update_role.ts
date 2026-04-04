import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'fazil9113201968@gmail.com';
  const updatedUser = await prisma.user.update({
    where: { email },
    data: { role: 'BUSINESS' },
  });

  console.log('Role updated successfully:');
  console.log('Email:', updatedUser.email);
  console.log('New Role:', updatedUser.role);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
