import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create test users
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: await bcryptjs.hash('password123', 10),
    },
  });

  console.log('Created/updated test user:', testUser.email);

  // Create another test user
  const anotherUser = await prisma.user.upsert({
    where: { email: 'another@example.com' },
    update: {},
    create: {
      email: 'another@example.com',
      password: await bcryptjs.hash('securepass456', 10),
    },
  });

  console.log('Created/updated second test user:', anotherUser.email);

  // Create sample files for test user
  const sampleFile = await prisma.file.create({
    data: {
      userId: testUser.id,
      originalName: 'sample-document.pdf',
      mimeType: 'application/pdf',
      storagePath: './uploads/sample-document.pdf',
      fileSize: 1024000,
    },
  });

  console.log('Created sample file:', sampleFile.originalName);

  // Create sample document with extracted data
  const sampleDocument = await prisma.uploadedDocument.create({
    data: {
      userId: testUser.id,
      fileId: sampleFile.id,
      extractedText: 'This is sample extracted text from a PDF document. It contains important information.',
      summary: 'This document contains important information about the project.',
      documentType: 'report',
    },
  });

  console.log('Created sample document with metadata');

  console.log('✅ Database seeding completed successfully!');
}

main()
  .catch((error) => {
    console.error('Error seeding database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
