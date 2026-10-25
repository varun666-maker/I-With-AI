const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { PrismaNeon } = require('@prisma/adapter-neon');
const { neonConfig } = require('@neondatabase/serverless');
require('dotenv').config();

if (!neonConfig.webSocketConstructor && typeof globalThis.WebSocket !== 'undefined') {
  neonConfig.webSocketConstructor = globalThis.WebSocket;
}

const neon = new PrismaNeon({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter: neon });

async function seedAptitude() {
  console.log("Loading seed.json...");
  const seedFile = path.join(__dirname, '../seed.json');
  const data = JSON.parse(fs.readFileSync(seedFile, 'utf8'));
  const questions = data.aptitudeQuestions;

  console.log(`Found ${questions.length} aptitude questions in seed.json.`);

  const existingCount = await prisma.aptitudeQuestion.count();
  console.log(`Current aptitude questions in DB: ${existingCount}`);

  if (existingCount >= questions.length) {
    console.log("Database already has all questions seeded. Skipping.");
    await prisma.$disconnect();
    return;
  }

  const batchSize = 50;
  let inserted = 0;

  for (let i = 0; i < questions.length; i += batchSize) {
    const batch = questions.slice(i, i + batchSize).map((q) => ({
      category: q.category,
      subTopic: q.subTopic || null,
      difficulty: (q.difficulty || "medium").toLowerCase(),
      questionText: q.text,
      options: [q.optionA, q.optionB, q.optionC, q.optionD],
      correctOption: q.correct.toUpperCase(),
      explanation: q.explanation || null,
      status: "published",
    }));

    await prisma.aptitudeQuestion.createMany({
      data: batch,
      skipDuplicates: true,
    });

    inserted += batch.length;
    process.stdout.write(`\rSeeded ${inserted}/${questions.length} questions...`);
  }

  console.log("\nFinished seeding aptitude questions!");
  const total = await prisma.aptitudeQuestion.count();
  console.log(`Total questions in DB now: ${total}`);
  await prisma.$disconnect();
}

seedAptitude().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
