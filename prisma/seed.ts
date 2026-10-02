/**
 * Seeds the CMS database with the default content and creates the first admin user.
 * Idempotent: content tables are only filled when empty; the admin user is upserted.
 *   npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  DEFAULT_ANNOUNCEMENTS, DEFAULT_BADGES, DEFAULT_CATEGORIES, DEFAULT_FOOTER, DEFAULT_HERO_SLIDES, DEFAULT_HOME_SECTIONS, DEFAULT_MENUS, DEFAULT_PAGES,
  DEFAULT_POPUPS, DEFAULT_SETTINGS, DEFAULT_SIZE_GUIDES, DEFAULT_STORES, type MenuNode,
} from "../src/lib/cms/defaults";

const db = new PrismaClient();

async function seedMenu(menu: string, nodes: MenuNode[], parentId: string | null = null) {
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    const row = await db.menuItem.create({
      data: { menu, parentId, label: n.label, href: n.href, badgeText: n.badgeText, badgeColor: n.badgeColor, textColor: n.textColor, image: n.image, sortOrder: i },
    });
    if (n.children?.length) await seedMenu(menu, n.children, row.id);
  }
}

async function main() {
  // ---- Admin user ----
  const email = (process.env.ADMIN_EMAIL ?? "admin@merea.local").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await bcrypt.hash(password, 12);
  await db.adminUser.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, name: "Owner", role: "owner" },
  });
  console.log(`✔ admin user: ${email}`);

  // ---- Settings ----
  if ((await db.setting.count()) === 0) {
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      await db.setting.create({ data: { key, value: JSON.stringify(value) } });
    }
    console.log("✔ settings");
  }

  if ((await db.announcement.count()) === 0) {
    for (const a of DEFAULT_ANNOUNCEMENTS) await db.announcement.create({ data: a });
    console.log("✔ announcements");
  }

  if ((await db.heroSlide.count()) === 0) {
    for (const s of DEFAULT_HERO_SLIDES) await db.heroSlide.create({ data: s });
    console.log("✔ hero slides");
  }

  if ((await db.homeSection.count()) === 0) {
    for (const s of DEFAULT_HOME_SECTIONS) await db.homeSection.create({ data: { ...s, config: JSON.stringify(s.config) } });
    console.log("✔ home sections");
  }

  if ((await db.menuItem.count()) === 0) {
    for (const [menu, nodes] of Object.entries(DEFAULT_MENUS)) await seedMenu(menu, nodes);
    console.log("✔ menus");
  }

  if ((await db.footerColumn.count()) === 0) {
    for (let i = 0; i < DEFAULT_FOOTER.length; i++) {
      const col = DEFAULT_FOOTER[i];
      await db.footerColumn.create({ data: { title: col.title, sortOrder: i, links: { create: col.links.map((l, j) => ({ ...l, sortOrder: j })) } } });
    }
    console.log("✔ footer");
  }

  if ((await db.popup.count()) === 0) {
    for (const p of DEFAULT_POPUPS) {
      const { config, excludePaths, ...rest } = p as typeof p & { excludePaths?: string[] };
      await db.popup.create({ data: { ...rest, config: JSON.stringify(config ?? {}), excludePaths: JSON.stringify(excludePaths ?? []), showOnPaths: "[]" } });
    }
    console.log("✔ popups");
  }

  if ((await db.categoryPage.count()) === 0) {
    for (const c of DEFAULT_CATEGORIES) await db.categoryPage.create({ data: { ...c, parentPath: c.parentPath ?? null } });
    console.log("✔ categories");
  }

  if ((await db.promoBadge.count()) === 0) {
    for (const b of DEFAULT_BADGES) await db.promoBadge.create({ data: b });
    console.log("✔ badges");
  }

  if ((await db.page.count()) === 0) {
    for (const p of DEFAULT_PAGES) await db.page.create({ data: p });
    console.log("✔ pages");
  }

  if ((await db.store.count()) === 0) {
    for (let i = 0; i < DEFAULT_STORES.length; i++) await db.store.create({ data: { ...DEFAULT_STORES[i], sortOrder: i } });
    console.log("✔ stores");
  }

  if ((await db.sizeGuide.count()) === 0) {
    for (let i = 0; i < DEFAULT_SIZE_GUIDES.length; i++) {
      const g = DEFAULT_SIZE_GUIDES[i];
      await db.sizeGuide.create({ data: { key: g.key, title: g.title, content: JSON.stringify(g.content), sortOrder: i } });
    }
    console.log("✔ size guides");
  }

  if ((await db.review.count()) === 0) {
    await db.review.createMany({
      data: [
        { productHandle: "byustgalter-treugolnik-s-neobrabotannymi-krayami-natural-lifting-1TI010V-1905", author: "Ирина", rating: 5, title: "Купила во всех цветах", body: "Обожаю этот бюстгальтер, очень удобный и бесшовный.", approved: true },
        { productHandle: "byustgalter-treugolnik-s-neobrabotannymi-krayami-natural-lifting-1TI010V-1905", author: "Ирина", rating: 5, title: "Лучший на каждый день", body: "Для ежедневного гардероба это просто лучший бюстгальтер! Тот самый, с которым больше нет чувства «наконец-то я его сняла» по вечерам.", approved: true },
        { productHandle: "leginsy-invisible-therm-1WP1569-581z", author: "Мария", rating: 5, title: "Теплые и тонкие", body: "Ношу под джинсы и платья — не видно совсем, при этом тепло даже в -10.", approved: true },
      ],
    });
    console.log("✔ reviews");
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
