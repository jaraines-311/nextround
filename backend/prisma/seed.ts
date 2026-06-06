import { PrismaClient, Role, BillingOverride, Industry, PlanTier } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@nextround.ai';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const adminHash = await bcrypt.hash(adminPassword, 12);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: adminHash,
        firstName: 'Admin',
        lastName: 'NextRound',
        role: Role.ADMIN,
        billingOverride: BillingOverride.FREE_FOREVER,
        targetIndustry: Industry.SOFTWARE_ENGINEERING,
        candidateProfile: { create: { targetIndustry: Industry.SOFTWARE_ENGINEERING } },
        subscription: { create: { stripeCustomerId: 'admin_placeholder', plan: PlanTier.PREMIUM } },
      },
    });
    await prisma.creditBalance.create({
      data: { userId: admin.id, subscriptionCredits: 999999, lifetimeGranted: 999999 },
    });
    console.log(`Created admin: ${adminEmail}`);
  }

  // Free-forever demo user
  const freeEmail = 'demo@nextround.ai';
  const existingFree = await prisma.user.findUnique({ where: { email: freeEmail } });
  if (!existingFree) {
    const freeHash = await bcrypt.hash('Demo123!', 12);
    const freeUser = await prisma.user.create({
      data: {
        email: freeEmail,
        passwordHash: freeHash,
        firstName: 'Demo',
        lastName: 'User',
        role: Role.USER,
        billingOverride: BillingOverride.FREE_FOREVER,
        targetIndustry: Industry.SOFTWARE_ENGINEERING,
        candidateProfile: {
          create: {
            targetIndustry: Industry.SOFTWARE_ENGINEERING,
            skills: ['Python', 'TypeScript', 'React', 'PostgreSQL', 'Docker'],
            summary: 'Full-stack engineer with 4 years of experience building SaaS products.',
            yearsOfExperience: 4,
            targetRoles: ['Senior Software Engineer', 'Full-Stack Engineer'],
          },
        },
        subscription: { create: { stripeCustomerId: 'demo_placeholder', plan: PlanTier.PREMIUM } },
      },
    });
    await prisma.creditBalance.create({
      data: { userId: freeUser.id, subscriptionCredits: 999999, lifetimeGranted: 999999 },
    });
    console.log(`Created demo user: ${freeEmail}`);
  }

  // Seed prompt templates
  const templates = [
    {
      key: 'interview_question',
      name: 'Interview Question Generator',
      description: 'Generates contextual interview questions',
      template: 'Generate a {{interviewType}} question for a {{industry}} role.',
      variables: ['interviewType', 'industry'],
    },
    {
      key: 'feedback_report',
      name: 'Interview Feedback Report',
      description: 'Generates detailed feedback from interview transcript',
      template: 'Evaluate this interview transcript: {{transcript}}',
      variables: ['transcript'],
    },
  ];

  for (const t of templates) {
    await prisma.promptTemplate.upsert({
      where: { key: t.key },
      create: t,
      update: t,
    });
  }

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
