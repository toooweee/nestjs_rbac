import { PrismaClient } from 'generated/prisma';

export async function seedRoles() {
  const prismaService = new PrismaClient();

  const roles = ['USER', 'ADMIN', 'MANAGER'];

  await prismaService.role.deleteMany();

  for (const role of roles) {
    await prismaService.role.create({
      data: {
        name: role,
      },
    });
  }
}
