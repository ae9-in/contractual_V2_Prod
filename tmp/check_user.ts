import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'fazil9113201968@gmail.com';
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (user) {
    console.log('User found:');
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('Has Password Hash:', !!user.passwordHash);
  } else {
    console.log('User not found.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
