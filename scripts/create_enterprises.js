const { PrismaClient } = require('@prisma/client');
const { randomBytes, scryptSync } = require('node:crypto');

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(String(password), salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function parseArgs(argv) {
  const args = {
    count: 5,
    password: 'Enterprise123!',
    slugPrefix: 'enterprise-',
    namePrefix: 'Entreprise ',
    emailDomain: 'local.test',
  };

  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    const next = argv[i + 1];
    if (a === '--count' && next) {
      args.count = Number(next);
      i += 1;
      continue;
    }
    if (a === '--password' && next) {
      args.password = String(next);
      i += 1;
      continue;
    }
    if (a === '--slug-prefix' && next) {
      args.slugPrefix = String(next);
      i += 1;
      continue;
    }
    if (a === '--name-prefix' && next) {
      args.namePrefix = String(next);
      i += 1;
      continue;
    }
    if (a === '--email-domain' && next) {
      args.emailDomain = String(next);
      i += 1;
      continue;
    }
  }

  if (!Number.isFinite(args.count) || args.count <= 0) {
    throw new Error('--count must be a positive number');
  }

  return args;
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

async function main() {
  const args = parseArgs(process.argv);
  const passwordHash = hashPassword(args.password);

  let created = 0;
  let existed = 0;

  for (let i = 1; i <= args.count; i += 1) {
    const slug = `${args.slugPrefix}${pad2(i)}`;
    const name = `${args.namePrefix}${i}`;
    const email = `${slug}@${args.emailDomain}`;

    const existing = await prisma.enterprise.findUnique({ where: { slug } });
    if (existing) {
      existed += 1;
      continue;
    }

    await prisma.enterprise.create({
      data: {
        slug,
        name,
        email,
        passwordHash,
        sector: null,
      },
    });

    created += 1;
  }

  console.log(`Enterprises: created ${created}; already present ${existed}.`);
  console.log(`Default password used (for new ones): ${args.password}`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  try {
    await prisma.$disconnect();
  } catch {}
  process.exit(1);
});
