const { PrismaClient } = require('@prisma/client');
const { randomBytes, scryptSync } = require('node:crypto');
const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(String(password), salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function isPasswordHashFormat(value) {
  // Expected: 16-byte salt + 64-byte hash in hex => 32:128 hex chars.
  return /^[0-9a-f]{32}:[0-9a-f]{128}$/i.test(String(value ?? '').trim());
}

async function main() {
  const email = process.argv[2] || 'admin@admin.com';
  const passwordOrHash = process.argv[3];
  if (!passwordOrHash) {
    console.error('Usage: node create_admin.js <email> <password>');
    console.error('       node create_admin.js <email> <passwordHash(salt:hash)>');
    process.exit(2);
  }

  const passwordHash = isPasswordHashFormat(passwordOrHash) ? String(passwordOrHash).trim() : hashPassword(passwordOrHash);

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    console.log('Admin already exists:', existing.email);
    await prisma.$disconnect();
    return;
  }

  const admin = await prisma.admin.create({
    data: {
      email,
      passwordHash
    }
  });

  console.log('Created admin id', admin.id, admin.email);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
