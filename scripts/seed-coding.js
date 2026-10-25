const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { PrismaNeon } = require('@prisma/adapter-neon');
require('dotenv').config();

const neon = new PrismaNeon({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter: neon });

async function seedCoding() {
  console.log("Loading coding dataset...");
  const dataPath = path.join(__dirname, '../src/lib/coding-dataset.json');
  const problems = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  console.log(`Found ${problems.length} coding problems to seed.`);

  const existingCount = await prisma.codingProblem.count();
  console.log(`Current coding problems in DB: ${existingCount}`);

  if (existingCount >= problems.length) {
    console.log("Database already has coding problems seeded. Skipping.");
    await prisma.$disconnect();
    return;
  }

  const batchSize = 50;
  let inserted = 0;

  for (let i = 0; i < problems.length; i += batchSize) {
    const chunk = problems.slice(i, i + batchSize);
    const batch = chunk.map((p) => {
      // Deterministic UUID mapped to numeric ID
      const uuid = '00000000-0000-0000-0000-' + String(p.id).padStart(12, '0');
      const visible = (p.testCases || []).filter(tc => !tc.hidden);
      const hidden = (p.testCases || []).filter(tc => tc.hidden);

      return {
        id: uuid,
        version: 1,
        title: p.title,
        difficulty: (p.difficulty || "medium").toLowerCase(),
        problemType: "dsa",
        statementMarkdown: p.description || p.title,
        constraints: p.constraints || [],
        examples: p.examples || [],
        signatures: { functionSignature: p.functionSignature || "solution(input)" },
        starterCode: p.starterCode || {},
        visibleTests: visible,
        hiddenTests: hidden,
        timeLimitMs: p.timeLimit || 2000,
        memoryLimitKb: (p.memoryLimit || 256) * 1024,
        status: "published",
      };
    });

    await prisma.codingProblem.createMany({
      data: batch,
      skipDuplicates: true,
    });

    inserted += batch.length;
    process.stdout.write(`\rSeeded ${inserted}/${problems.length} problems...`);
  }

  console.log("\nFinished seeding coding problems!");
  const total = await prisma.codingProblem.count();
  console.log(`Total coding problems in DB now: ${total}`);
  await prisma.$disconnect();
}

seedCoding().catch(async (e) => {
  console.error("\nFailed to seed coding problems:", e);
  await prisma.$disconnect();
  process.exit(1);
});
