/**
 * Wipes CMS content tables (NOT subscribers, messages, reviews, customers, translations, media or admins)
 * and re-seeds them from src/lib/cms/defaults.ts. Use after changing the defaults.
 *   node scripts/reseed-content.cjs && npm run db:seed
 */
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();
(async () => {
  for (const m of ["setting", "announcement", "homeSection", "heroSlide", "menuItem", "footerLink", "footerColumn", "popup", "categoryPage", "promoBadge", "page", "store", "sizeGuide"]) {
    const r = await db[m].deleteMany();
    console.log(`cleared ${m}: ${r.count}`);
  }
  await db.$disconnect();
})();
