# Merey — headless Shopify storefront + admin

Next.js 15 (App Router) storefront that reproduces the merea.ru experience (women's + girls' sections) on top of the
Shopify Storefront API, plus a built-in admin panel for every piece of site content.

## Quick start (local, no Shopify yet)

```bash
npm install
cp .env.example .env        # already done on first setup
npm run setup               # prisma generate + create SQLite DB + seed default content & admin user
npm run dev                 # http://localhost:3000
```

Admin panel: http://localhost:3000/admin
Default login comes from `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`). **Change the password after the first login** (Администраторы → владелец).

Without Shopify credentials the site runs on a built-in **demo catalog** (realistic products, colours, sizes, stock states)
so the design can be reviewed. Cart, wishlist, search, filters and popups all work in demo mode.

## Connecting Shopify

1. In Shopify admin: *Settings → Apps and sales channels → Develop apps → Create app* → enable the **Storefront API**
   with scopes: `unauthenticated_read_product_listings`, `unauthenticated_read_product_inventory`,
   `unauthenticated_read_product_tags`, `unauthenticated_write_checkouts`, `unauthenticated_read_checkouts`,
   `unauthenticated_write_customers`, `unauthenticated_read_customers`, `unauthenticated_read_content`.
2. Put the values in `.env`:
   ```
   SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
   SHOPIFY_STOREFRONT_ACCESS_TOKEN=xxxxxxxx
   SHOPIFY_API_VERSION=2026-10
   ```
3. Restart the server. The dashboard badge switches to «Подключено к Shopify».

### How the storefront maps to Shopify

| Site concept | Shopify |
| --- | --- |
| Category page URL (`/women/lingerie/bras`) | `CategoryPage.collectionHandle` in admin → a **collection** handle |
| Product page `/product/<handle>` | product handle |
| Sizes | variant option «Размер» (or «Size») |
| Colour of this product | metafield `custom.color_name` (fallback: option «Цвет») |
| Other colours of the same model | products tagged `model:<code>` + metafield `custom.model_code` (`custom.color_hex` for swatch colour) |
| «N цветов» counter | metafield `custom.colors_count` |
| Tile badges («3=4», «НОВИНКА», «Распродажа», materials) | product **tags** matched to admin → Бейджи (`3=4`, `new`, `sale`, `recycled-microfiber`, …). Any tag `badge:Текст` is also shown as-is |
| Composition / care / size-guide key | metafields `custom.composition`, `custom.care`, `custom.size_guide` |
| Low stock clock icon | `quantityAvailable` ≤ 3 |
| Checkout | Shopify Checkout (`cart.checkoutUrl`) |
| Customer accounts | classic customer access tokens (login / register / orders / recover) |
| Reviews | stored in this app's DB (moderated in admin); optional `reviews.rating` / `reviews.rating_count` metafields are read as a fallback |

Filters/sorting on category pages use Shopify's native collection filters (`?f.<key>=<json input>`), the mock catalog
emulates the same contract.

## Admin panel (`/admin`)

Everything on the site is editable without touching code:

- **Главная**: ordered sections (hero slider, product carousels by collection, editorial, banner, promo strip, category tiles, text).
- **Главный слайдер**: slides with desktop/mobile images, video, CTA, text colour.
- **Бегущая строка**: announcement marquee with scheduling.
- **Меню**: 3-level navigation tree for Женщинам / Девочкам + service links, badges and colours.
- **Футер**: columns and links.
- **Попапы и маркетинг**: cookie consent, «-10% за регистрацию» promo and any custom popup (delay, scroll %, frequency, path targeting, schedule).
- **Категории**: URL ↔ collection mapping, tiles, banners, SEO text.
- **Бейджи**, **Таблицы размеров**, **Текстовые страницы** (delivery, payment, returns, policies…), **Магазины**.
- **Входящие**: review moderation, subscribers, contact messages, back-in-stock requests.
- **Настройки сайта**: logo, contacts, socials, texts, SEO, analytics.
- **Администраторы** with roles (owner / admin / editor) and a full **audit log**.
- **Медиатека**: secure uploads (re-encoded with sharp, MIME allowlist, size cap).

Content changes invalidate the cache immediately (also available via «Обновить сайт» on the dashboard).

## Security

- Shopify tokens live only in server env; every Shopify call is proxied server-side (`/api/*`, server components, server actions).
- Strict CSP, HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy (`next.config.ts`).
- Admin: bcrypt (cost 12) passwords with strength policy, HS256 JWT in an `httpOnly` + `SameSite=Strict` cookie (8h), role-based access,
  login rate-limiting (5 tries / 15 min / IP), audit logging, `noindex` + `no-store` on `/admin` and `/api`.
- CSRF: same-origin check on every state-changing request in `middleware.ts` + SameSite cookies.
- All inputs validated with zod; honeypot on the contact form; per-IP rate limits on newsletter, reviews, notify, auth.
- Uploads: session required, allowlisted MIME types, 12 MB cap, random filenames, raster images re-encoded (strips metadata), SVG script check.
- Set a real `AUTH_SECRET` (32+ random chars) and use HTTPS in production.

## Production

- Switch Prisma to Postgres: change `provider = "postgresql"` in `prisma/schema.prisma`, set `DATABASE_URL`, run `npx prisma db push && npm run db:seed`.
- Set `NEXT_PUBLIC_SITE_URL`, `AUTH_SECRET`, Shopify vars, then `npm run build && npm start` (or deploy to Vercel / any Node host).
- Images: with Shopify connected, `next/image` optimization is on for `cdn.shopify.com`.

## Project layout

```
src/app/(storefront)   pages: home, catalog ([...slug]), product, cart, wishlist, search, account, stores, contact, policies
src/app/admin          admin panel (generic CRUD generated from src/lib/admin/registry.ts)
src/app/api            cart, search, newsletter, notify, contact, reviews, auth, admin login/upload
src/components         layout (header, marquee, drawers, footer), home sections, product, plp, cart, popups, admin
src/lib/catalog        provider interface + mock catalog;  src/lib/shopify  Storefront API client/queries/provider
src/lib/cms            CMS defaults + cached content loaders;  prisma/  schema + seed
```

## Account area (logged-in pages)

`/myprofile` overview (bonus balance, last order, default address), `/myprofile/personal` (profile, password, newsletter toggle,
account deletion request), `/myprofile/addresses` (address book with default address), `/orders` + `/orders/<id>` (status timeline,
tracking, items), `/returns` (return request wizard, also available to guests by order number + e-mail), `/bonuses` (loyalty card,
tier progress, history), `/myprofile/gift-cards`, `/wishlist`.

In demo mode accounts are stored in the local DB (`DemoCustomer`) with two sample orders created at registration. With Shopify
connected the same pages use Shopify customer accounts (`customerUpdate`, address mutations, orders). Return requests are stored in
this app's DB and moderated in admin → Возвраты.

## Placeholder artwork

All demo product photos, banners and category tiles are generated locally by `node scripts/generate-placeholders.mjs`
into `public/images/placeholders`. Replace them with real photos through the admin (image fields support upload).

## Going live with Shopify — checklist

1. Create the Storefront API token (scopes listed above) and put it in `.env`.
2. `npm run shopify:check` — verifies shop, products, collections, filters, search, cart and customer API access.
3. Admin → **Shopify**: shows the connection status and lets you link every category page to a Shopify collection
   («Сопоставить автоматически» matches by handle / title, the rest is a dropdown per category).
4. Products: add tags `3=4`, `new`, `sale`, `model:<code>` and metafields `custom.color_name`, `custom.color_hex`,
   `custom.model_code`, `custom.colors_count`, `custom.composition`, `custom.care`, `custom.size_guide` (bras|panties|clothing|girls|socks|swim).
5. Webhooks (optional, instant cache refresh): Shopify admin → Settings → Notifications → Webhooks →
   products/create|update|delete, collections/create|update|delete, inventory_levels/update → `https://<site>/api/webhooks/shopify`,
   and set `SHOPIFY_WEBHOOK_SECRET`.
6. Markets: set `SHOPIFY_COUNTRY` / `SHOPIFY_LANGUAGE` to match the market you sell in (default RU/RU).
7. Checkout, payments, shipping, taxes and order e-mails are handled by Shopify Checkout.

## Deploying to Vercel

1. Push the repo to GitHub and import it in Vercel (framework: Next.js, auto-detected).
2. Vercel → Storage → create **Neon Postgres** (fills `DATABASE_URL`) and **Blob** (fills `BLOB_READ_WRITE_TOKEN`).
3. Project → Settings → Environment Variables: copy every key from `.env.example` (Shopify tokens, `AUTH_SECRET`,
   `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `NEXT_PUBLIC_SITE_URL=https://<your-domain>`).
4. First deploy runs `prisma generate` automatically. Then seed the content once from your machine against the production DB:
   `DATABASE_URL="<neon url>" npx prisma db push && DATABASE_URL="<neon url>" npm run db:seed`
   (or run it in a Vercel one-off job).
5. Add the custom domain (merea.ru) in Vercel → Domains; HSTS/CSP headers are already configured.
6. Shopify → Settings → Notifications → Webhooks → point product/collection/inventory webhooks at
   `https://<domain>/api/webhooks/shopify` with `SHOPIFY_WEBHOOK_SECRET`.

Local development keeps SQLite: `npm run db:sqlite` (regenerates the client from `prisma/schema.sqlite.prisma`).
Production uses `prisma/schema.prisma` (PostgreSQL).

## Importing the catalog into Shopify

`npm run shopify:import-catalog` creates all collections used by the site and every product (model × colour, sizes as variants,
tags, metafields, placeholder images) through the Admin API `productSet`. Needs a custom-app Admin token with
`write_products`, `write_inventory`, `read_products`. Add `--dry` to preview. Afterwards set stock in Shopify and run
«Сопоставить автоматически» in Admin → Shopify.

## Database on Supabase (free tier)

Supabase Dashboard → your project → **Connect** →
- *Transaction pooler* URI (port 6543) → `DATABASE_URL=postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true`
- *Direct connection* URI (port 5432) → `DIRECT_URL=postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres`

Then: `npx prisma db push && npm run db:seed`. Add both variables to Vercel as well. To keep the Merey tables apart from
other apps in the same project, append `&schema=merea` to `DATABASE_URL` and `?schema=merea` to `DIRECT_URL`.

_Deployed on Vercel · database on Supabase · commerce on Shopify._
