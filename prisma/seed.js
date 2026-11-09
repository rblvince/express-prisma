const prisma = require('../db/prisma');

const categories = ['Romanzo', 'Fantascienza', 'Saggistica', 'Fantasy', 'Giallo'];

async function main() {
  for (const name of categories) {
    await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
  }
  console.log(`Seed completato: ${categories.length} categorie`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
