/**
 * Default CMS content. Used to seed the database and as a fallback when the DB is empty.
 * Everything here is editable in /admin.
 */

export const SITE_ASSETS = "/images/placeholders";

export type MenuNode = {
  id?: string;
  label: string;
  href?: string;
  badgeText?: string;
  badgeColor?: string;
  textColor?: string;
  image?: string;
  children?: MenuNode[];
};

export const DEFAULT_SETTINGS = {
  siteName: "Merey",
  tagline: "Официальный интернет-магазин в Грузии",
  logo: "",
  legalEntity: "ООО «Мерей» · Тбилиси, Грузия · Идентификационный код: 000000000",
  region: "Грузия / ₾",
  language: "Русский",
  supportEmail: "support@merea.studio",
  supportPhone: "+995 32 200 00 00",
  socials: [
    { name: "Instagram", href: "https://instagram.com/merey", icon: "instagram" },
    { name: "Facebook", href: "https://facebook.com/merey", icon: "facebook" },
    { name: "TikTok", href: "https://tiktok.com/@merey", icon: "tiktok" },
  ],
  freeShippingFrom: 150,
  returnDays: 14,
  cartNotice: "Оплата проходит через защищенный Shopify Checkout",
  newsletterTitle: "Подпишись на нашу рассылку и узнавай первым о наших новинках и акциях!",
  storeFinderTitle: "Найти магазин",
  storeFinderPlaceholder: "Введи город или почтовый индекс",
  seoTitle: "Merey — женское нижнее белье, пижамы и одежда | Официальный интернет-магазин в Грузии",
  seoDescription: "Merey — бюстгальтеры, трусики, пижамы, одежда и купальники для женщин и девочек. Официальный интернет-магазин в Грузии: доставка по всей стране, возврат 14 дней.",
  headerTransparentOnHome: true,
  showGirlsMenu: true,
  yandexMetrikaId: "",
  shopify: { storeDomain: "", apiVersion: "2026-10" },
};
export type SiteSettings = typeof DEFAULT_SETTINGS;

export const DEFAULT_ANNOUNCEMENTS = [
  { text: "РАСПРОДАЖА: Скидки до -70%", href: "/sale/women", sortOrder: 0 },
  { text: "Костюмы для спорта и отдыха", href: "/women/activewear", sortOrder: 1 },
  { text: "3=4 на одежду и нижнее бельё 💥", href: "/women/offers", sortOrder: 2 },
];

export const DEFAULT_HERO_SLIDES = [
  {
    title: "Бюстгальтеры с естественным эффектом",
    subtitle: "Коллекция бесшовных бюстгальтеров, которые обеспечивают бережную и уверенную поддержку и делают каждый образ невероятно комфортным!",
    ctaText: "Купить сейчас",
    ctaHref: "/collections/natural-lifting-bra",
    image: `${SITE_ASSETS}/banners/hero-1.svg`,
    imageMobile: `${SITE_ASSETS}/banners/hero-1-mobile.svg`,
    textTheme: "light",
    align: "left",
    sortOrder: 0,
  },
  {
    title: "Скидки ждут",
    subtitle: "Сезонные товары со скидками на сайте и в магазинах. Открой для себя их все!",
    note: "*акция действует на избранный ассортимент",
    ctaText: "К покупкам!",
    ctaHref: "/sale/women",
    image: "",
    imageMobile: "",
    textTheme: "light",
    align: "left",
    sortOrder: 1,
  },
];

/** Ordered home page blocks. `config` is JSON, shape depends on `type`. */
export const DEFAULT_HOME_SECTIONS = [
  { type: "hero", title: "Главный слайдер", config: {}, sortOrder: 0 },
  { type: "product_carousel", title: "Собери образ", subtitle: "С термоэффектом", config: { collection: "home-build-look", limit: 12, href: "/women/clothing" }, sortOrder: 1 },
  {
    type: "editorial", title: "Влюбляясь в бордовый", subtitle: "Поддайся своим чувствам к главному цвету сезона — глубокому и элегантному бордовому.",
    config: { image: `${SITE_ASSETS}/banners/editorial-burgundy.svg`, links: [{ label: "Бюстгальтеры", href: "/women/lingerie/bras" }, { label: "Трусики", href: "/women/lingerie/panties" }], collection: "home-burgundy", limit: 10 },
    sortOrder: 2,
  },
  {
    type: "promo_strip", title: "Акции",
    config: { items: [{ text: "3=4 на одежду и нижнее бельё", cta: "К акции", href: "/women/offers" }, { text: "Скидки до -70%", cta: "К распродаже", href: "/sale/women" }] },
    sortOrder: 3,
  },
  {
    type: "banner", title: "Пижамы для неё", subtitle: "Комплекты из хлопка, атласа и вискозы",
    config: { image: `${SITE_ASSETS}/banners/banner-pajamas.svg`, cta: "К покупкам!", href: "/women/sleepwear", collection: "home-pajamas", limit: 10, textTheme: "light" },
    sortOrder: 4,
  },
  {
    type: "category_tiles", title: "Категории",
    config: { items: [
      { label: "Бюстгальтеры", href: "/women/lingerie/bras", image: `${SITE_ASSETS}/tiles/allbras.svg` },
      { label: "Трусики", href: "/women/lingerie/panties", image: `${SITE_ASSETS}/tiles/brazilian.svg` },
      { label: "Пижамы", href: "/women/sleepwear", image: `${SITE_ASSETS}/tiles/pajamas.svg` },
      { label: "Одежда", href: "/women/clothing", image: `${SITE_ASSETS}/tiles/clothing.svg` },
      { label: "Носки и колготки", href: "/women/socks-tights", image: `${SITE_ASSETS}/tiles/socks.svg` },
      { label: "Девочкам", href: "/girls", image: `${SITE_ASSETS}/tiles/girls.svg` },
    ] },
    sortOrder: 5,
  },
  { type: "product_carousel", title: "Новые поступления", subtitle: "Новинки для неё", config: { collection: "women-new", limit: 12, href: "/collections/new-in-women" }, sortOrder: 6 },
];

export const DEFAULT_MENUS: Record<string, MenuNode[]> = {
  women: [
    { label: "Бюстгальтеры с естественным эффектом", href: "/collections/natural-lifting-bra", badgeText: "НОВИНКИ", badgeColor: "#000000" },
    { label: "Распродажа", href: "/sale/women", badgeText: "СКИДКИ ДО -70%", badgeColor: "#9C5D57", textColor: "#9C5D57" },
    { label: "Новые поступления", href: "/collections/new-in-women" },
    {
      label: "Нижнее белье", href: "/women/lingerie",
      children: [
        { label: "‣ По степени поддержки", href: "/women/lingerie/bras", badgeText: "НОВИНКА", badgeColor: "#000000" },
        { label: "‣ По цветам", href: "/women/lingerie", badgeText: "НОВИНКА", badgeColor: "#000000" },
        {
          label: "Бюстгальтеры", href: "/women/lingerie/bras",
          children: [
            { label: "Балконет", href: "/women/lingerie/bras/balconette" },
            { label: "Пуш-ап", href: "/women/lingerie/bras/push-up" },
            { label: "Треугольник", href: "/women/lingerie/bras/triangle" },
            { label: "Бандо и без бретелей", href: "/women/lingerie/bras/bandeau" },
            { label: "Бралетт и брасьер", href: "/women/lingerie/bras/bralette" },
            { label: "Посмотреть все", href: "/women/lingerie/bras" },
          ],
        },
        {
          label: "Трусики", href: "/women/lingerie/panties",
          children: [
            { label: "Бразильяно", href: "/women/lingerie/panties/brazilian" },
            { label: "Слипы", href: "/women/lingerie/panties/briefs" },
            { label: "Стринги", href: "/women/lingerie/panties/thongs" },
            { label: "Кюлоты", href: "/women/lingerie/panties/culottes" },
            { label: "Посмотреть все", href: "/women/lingerie/panties" },
          ],
        },
        { label: "Комплекты", href: "/women/lingerie/sets" },
        { label: "Женское белье", href: "/women/lingerie" },
        { label: "Невидимое белье", href: "/women/lingerie/invisible" },
        { label: "Моделирующее нижнее белье", href: "/women/lingerie/shapewear" },
        { label: "Свадебное белье", href: "/women/lingerie/bridal" },
        { label: "Аксессуары", href: "/women/lingerie/accessories" },
        { label: "Посмотреть все", href: "/women/lingerie" },
      ],
    },
    {
      label: "Одежда", href: "/women/clothing",
      children: [
        { label: "Майки", href: "/women/clothing/tank-tops" },
        { label: "Рубашки", href: "/women/clothing/shirts" },
        { label: "Топы", href: "/women/clothing/tops" },
        { label: "Джемперы", href: "/women/clothing/knitwear" },
        { label: "Худи и толстовки", href: "/women/clothing/sweatshirts" },
        { label: "Брюки", href: "/women/clothing/trousers" },
        { label: "Джинсы", href: "/women/clothing/jeans" },
        { label: "Платья", href: "/women/clothing/dresses" },
        { label: "Комплекты и двойки", href: "/women/clothing/co-ords" },
        { label: "Посмотреть все", href: "/women/clothing" },
      ],
    },
    { label: "Купальники и Пляжная одежда", href: "/women/swimwear" },
    {
      label: "Пижамы и Одежда для сна", href: "/women/sleepwear",
      children: [
        { label: "Длинные пижамы", href: "/women/sleepwear/long-pajamas" },
        { label: "Короткие пижамы", href: "/women/sleepwear/short-pajamas" },
        { label: "На пуговицах", href: "/women/sleepwear/button-up" },
        { label: "Пижамные комплекты", href: "/women/sleepwear/pajama-sets" },
        { label: "Ночные сорочки и Халаты", href: "/women/sleepwear/nightgowns-robes" },
        { label: "Посмотреть все", href: "/women/sleepwear" },
      ],
    },
    { label: "Спортивная одежда", href: "/women/activewear" },
    { label: "Носки и Колготки", href: "/women/socks-tights" },
    { label: "Термоодежда", href: "/women/thermal" },
    { label: "Акции", href: "/women/offers" },
    { label: "В тренде", href: "/women/trending" },
  ],
  girls: [
    { label: "Новинки для девочек", href: "/collections/new-in-girls", badgeText: "НОВИНКИ", badgeColor: "#000000" },
    { label: "Распродажа", href: "/sale/girls", badgeText: "СКИДКИ ДО -70%", badgeColor: "#9C5D57", textColor: "#9C5D57" },
    {
      label: "Нижнее белье", href: "/girls/lingerie",
      children: [
        { label: "Бюстгальтеры", href: "/girls/lingerie/bras" },
        { label: "Трусики", href: "/girls/lingerie/panties" },
        { label: "Майки", href: "/girls/lingerie/tank-tops" },
        { label: "Посмотреть все", href: "/girls/lingerie" },
      ],
    },
    { label: "Одежда", href: "/girls/clothing" },
    { label: "Пижамы", href: "/girls/pajamas" },
    { label: "Носки и Колготки", href: "/girls/socks-tights" },
    { label: "Купальники и аксессуары", href: "/girls/kupalniki-i-accessories" },
  ],
  service: [
    { label: "Избранное", href: "/wishlist" },
    { label: "Отследить заказ", href: "/orderstatus" },
    { label: "Найти магазин", href: "/stores" },
    { label: "НУЖНА ПОМОЩЬ?", href: "/contactform" },
  ],
};

export const DEFAULT_FOOTER = [
  {
    title: "ЖЕНЩИНАМ",
    links: [
      { label: "Купальники и Пляжная одежда", href: "/women/swimwear" },
      { label: "Нижнее белье", href: "/women/lingerie" },
      { label: "Бюстгальтеры", href: "/women/lingerie/bras" },
      { label: "Трусики", href: "/women/lingerie/panties" },
      { label: "Свадебное белье", href: "/women/lingerie/bridal" },
      { label: "Одежда", href: "/women/clothing" },
      { label: "Пижамы и Одежда для сна", href: "/women/sleepwear" },
      { label: "Носки и Колготки", href: "/women/socks-tights" },
    ],
  },
  {
    title: "ДЕВОЧКАМ",
    links: [
      { label: "Купальники и Пляжная одежда", href: "/girls/kupalniki-i-accessories" },
      { label: "Нижнее белье", href: "/girls/lingerie" },
      { label: "Бюстгальтеры", href: "/girls/lingerie/bras" },
      { label: "Трусики", href: "/girls/lingerie/panties" },
      { label: "Одежда", href: "/girls/clothing" },
      { label: "Пижамы", href: "/girls/pajamas" },
      { label: "Носки и Колготки", href: "/girls/socks-tights" },
    ],
  },
  {
    title: "Служба поддержки клиентов",
    links: [
      { label: "Отследить заказ/возврат", href: "/orderstatus" },
      { label: "Часто задаваемые вопросы", href: "/pages/faq" },
      { label: "Заказы", href: "/pages/orders" },
      { label: "Доставка", href: "/pages/delivery" },
      { label: "Оплата", href: "/pages/payment" },
      { label: "Возврат", href: "/pages/returns" },
      { label: "Связаться с нами", href: "/contactform" },
    ],
  },
  {
    title: "Гид по товарам",
    links: [
      { label: "Гид по бюстгальтерам", href: "/pages/bra-guide" },
      { label: "Гид по размерам", href: "/pages/size-guide" },
      { label: "Гид по стилю", href: "/pages/style-guide" },
    ],
  },
  {
    title: "О нас",
    links: [
      { label: "Программа лояльности", href: "/bonuses" },
      { label: "Подарочные карты", href: "/pages/gift-cards" },
      { label: "Магазины", href: "/stores" },
      { label: "Вакансии", href: "/pages/careers" },
    ],
  },
  {
    title: "Юридическая информация",
    links: [
      { label: "Политика конфиденциальности", href: "/policy/privacy-policy" },
      { label: "Политика в отношении файлов куки", href: "/policy/cookie-policy" },
      { label: "Условия использования сайта", href: "/policy/terms" },
      { label: "Правила продажи", href: "/policy/sales-rules" },
      { label: "Правила использования подарочных карт", href: "/policy/gift-card-rules" },
      { label: "Правила и условия акций", href: "/policy/promo-rules" },
      { label: "Правила программы лояльности", href: "/policy/loyalty-rules" },
    ],
  },
];

export const DEFAULT_POPUPS = [
  {
    key: "cookie",
    name: "Куки и персонализация",
    enabled: true,
    title: "Файлы cookie",
    body: "Мы используем файлы cookie, чтобы сайт работал корректно и чтобы показывать тебе персональные предложения. Продолжая пользоваться сайтом, ты соглашаешься с нашей",
    ctaText: "Принять",
    ctaHref: "/policy/cookie-policy",
    secondaryText: "Политикой использования файлов cookie",
    delaySeconds: 1,
    frequencyDays: 365,
    config: {},
  },
  {
    key: "newsletter",
    name: "Скидка за регистрацию",
    enabled: true,
    title: "-10% на первый заказ за регистрацию на сайте 😍",
    body: "Оставь свою электронную почту, и мы пришлем тебе промокод на скидку!",
    image: `${SITE_ASSETS}/banners/popup-newsletter.svg`,
    ctaText: "Зарегистрироваться",
    ctaHref: "/myprofile/register",
    delaySeconds: 12,
    scrollPercent: 0,
    frequencyDays: 7,
    excludePaths: ["/cart", "/checkout", "/myprofile", "/admin"],
    config: {
      placeholder: "Электронная почта",
      discountCode: "WELCOME10",
      consentPrivacy: "Для получения промокода необходимо стать участником Программы лояльности и принять условия ее реализации. Нажимая «Зарегистрироваться», соглашаюсь с условиями",
      consentPrivacyLink: "/policy/loyalty-rules",
      consentMarketing: "Даю своё согласие на получение рекламной рассылки",
      consentMarketingLink: "/policy/privacy-policy",
      successTitle: "Спасибо!",
      successText: "Промокод WELCOME10 на -10% уже ждет тебя в корзине.",
    },
  },
];

export const DEFAULT_BADGES = [
  { tag: "3=4", label: "3=4", textColor: "#80251D", bgColor: "#FFFFFF", position: "bottom", sortOrder: 0 },
  { tag: "new", label: "НОВИНКА", textColor: "#000000", bgColor: "#FFFFFF", position: "bottom", sortOrder: 1 },
  { tag: "sale", label: "Распродажа", textColor: "#9C5D57", bgColor: "#FFFFFF", position: "bottom", sortOrder: 2 },
  { tag: "recycled-microfiber", label: "Переработанная микрофибра", textColor: "#FFFFFF", bgColor: "#9C5D57", position: "bottom", sortOrder: 3 },
  { tag: "organic-cotton", label: "Органический хлопок", textColor: "#FFFFFF", bgColor: "#5B6B4A", position: "bottom", sortOrder: 4 },
  { tag: "anna-pokrov", label: "ВЫБОР СТИЛИСТА", textColor: "#000000", bgColor: "#FFFFFF", position: "bottom", sortOrder: 5 },
];

const CAT = (path: string, title: string, collectionHandle: string, extra: Partial<{ navTitle: string; parentPath: string; image: string; seoTitle: string; seoDescription: string; seoText: string; showInTiles: boolean; sortOrder: number }> = {}) => ({
  path, title, collectionHandle, parentPath: path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : null, showInTiles: true, sortOrder: 0, ...extra,
});

const BRA_SEO = `<h2>Бюстгальтеры Merey</h2><p>Бюстгальтер — та самая деталь, с которой начинается комфортный образ. В Merey легко найти модель под свой ритм: для обычного дня, открытого топа, платья с вырезом или комплекта, который хочется носить просто для себя.</p><p>В коллекции есть женские бюстгальтеры разных форм, цветов и материалов, от базовых гладких моделей до кружева, бралеттов и пуш ап.</p><h3>Цвета и ткани</h3><p>Выбирай оттенок под одежду или настроение. Черный бюстгальтер легко вписывается в базовый гардероб, белый подходит к светлым вещам, бежевый удобно носить под тонкими и облегающими тканями.</p><p>Хлопковый бюстгальтер подойдет на каждый день, микрофибра — под гладкую одежду, кружево — когда хочется добавить больше акцента.</p>`;

export const DEFAULT_CATEGORIES = [
  CAT("women", "Женщинам", "women-all", { navTitle: "Женщинам", seoTitle: "Женское нижнее белье, одежда и пижамы Merey — купить" }),
  CAT("women/lingerie", "Женское нижнее белье", "women-lingerie", { navTitle: "Нижнее белье", seoTitle: "Женское нижнее белье Merey — купить", sortOrder: 0 }),
  CAT("women/lingerie/bras", "Женские бюстгальтеры", "women-bras", { navTitle: "Бюстгальтеры", image: `${SITE_ASSETS}/tiles/allbras.svg`, seoTitle: "Женские бюстгальтеры Merey — купить", seoText: BRA_SEO, sortOrder: 0 }),
  CAT("women/lingerie/bras/balconette", "Бюстгальтеры балконет", "women-bras-balconette", { navTitle: "Балконет", image: `${SITE_ASSETS}/tiles/balconette.svg`, sortOrder: 0 }),
  CAT("women/lingerie/bras/push-up", "Бюстгальтеры пуш-ап", "women-bras-pushup", { navTitle: "Пуш-ап", image: `${SITE_ASSETS}/tiles/pushup.svg`, sortOrder: 1 }),
  CAT("women/lingerie/bras/triangle", "Бюстгальтеры-треугольник", "women-bras-triangle", { navTitle: "Треугольник", image: `${SITE_ASSETS}/tiles/triangle.svg`, sortOrder: 2 }),
  CAT("women/lingerie/bras/bandeau", "Бюстгальтеры бандо и без бретелей", "women-bras-bandeau", { navTitle: "Бандо и без бретелей", image: `${SITE_ASSETS}/tiles/bandeau.svg`, sortOrder: 3 }),
  CAT("women/lingerie/bras/bralette", "Бралетт и брасьер", "women-bras-bralette", { navTitle: "Бралетт и брасьер", image: `${SITE_ASSETS}/tiles/bralette.svg`, sortOrder: 4 }),
  CAT("women/lingerie/panties", "Женские трусики", "women-panties", { navTitle: "Трусики", image: `${SITE_ASSETS}/tiles/brazilian.svg`, seoTitle: "Женские трусики Merey — купить", sortOrder: 1 }),
  CAT("women/lingerie/panties/brazilian", "Бразильяно", "women-panties-brazilian", { navTitle: "Бразильяно", image: `${SITE_ASSETS}/tiles/brazilian.svg`, sortOrder: 0 }),
  CAT("women/lingerie/panties/briefs", "Слипы", "women-panties-slips", { navTitle: "Слипы", image: `${SITE_ASSETS}/tiles/slip.svg`, sortOrder: 1 }),
  CAT("women/lingerie/panties/thongs", "Стринги", "women-panties-strings", { navTitle: "Стринги", image: `${SITE_ASSETS}/tiles/thong.svg`, sortOrder: 2 }),
  CAT("women/lingerie/panties/culottes", "Кюлоты", "women-panties-culottes", { navTitle: "Кюлоты", image: `${SITE_ASSETS}/tiles/culotte.svg`, sortOrder: 3 }),
  CAT("women/lingerie/sets", "Комплекты нижнего белья", "women-sets", { navTitle: "Комплекты", sortOrder: 2 }),
  CAT("women/lingerie/invisible", "Невидимое белье", "women-invisible", { navTitle: "Невидимое белье", sortOrder: 3 }),
  CAT("women/lingerie/shapewear", "Моделирующее нижнее белье", "women-shaping", { navTitle: "Моделирующее", sortOrder: 4 }),
  CAT("women/lingerie/bridal", "Свадебное белье", "women-bridal", { navTitle: "Свадебное белье", sortOrder: 5 }),
  CAT("women/lingerie/accessories", "Аксессуары для белья", "women-lingerie-accessories", { navTitle: "Аксессуары", sortOrder: 6 }),
  CAT("women/clothing", "Женская одежда", "women-clothing", { navTitle: "Одежда", seoTitle: "Женская одежда Merey — купить", sortOrder: 1 }),
  CAT("women/clothing/tank-tops", "Женские майки", "women-clothing-tops", { navTitle: "Майки", sortOrder: 0 }),
  CAT("women/clothing/shirts", "Женские рубашки", "women-clothing-shirts", { navTitle: "Рубашки", sortOrder: 1 }),
  CAT("women/clothing/tops", "Топы и кроп-топы", "women-clothing-tops", { navTitle: "Топы", sortOrder: 2 }),
  CAT("women/clothing/knitwear", "Кардиганы и джемперы", "women-clothing-knit", { navTitle: "Джемперы", sortOrder: 3 }),
  CAT("women/clothing/sweatshirts", "Худи и толстовки", "women-clothing-sweats", { navTitle: "Худи и толстовки", sortOrder: 4 }),
  CAT("women/clothing/trousers", "Женские брюки", "women-clothing-pants", { navTitle: "Брюки", sortOrder: 5 }),
  CAT("women/clothing/jeans", "Женские джинсы", "women-clothing-jeans", { navTitle: "Джинсы", sortOrder: 6 }),
  CAT("women/clothing/dresses", "Платья", "women-clothing-skirts", { navTitle: "Платья", sortOrder: 7 }),
  CAT("women/clothing/co-ords", "Комплекты и двойки", "women-clothing-sets", { navTitle: "Комплекты", sortOrder: 8 }),
  CAT("women/swimwear", "Купальники и пляжная одежда для женщин", "women-swimwear", { navTitle: "Купальники и Пляжная одежда", sortOrder: 2 }),
  CAT("women/sleepwear", "Женские пижамы и одежда для сна", "women-pajamas", { navTitle: "Пижамы и Одежда для сна", sortOrder: 3 }),
  CAT("women/sleepwear/long-pajamas", "Длинные пижамы", "women-pajamas-long", { navTitle: "Длинные пижамы", sortOrder: 0 }),
  CAT("women/sleepwear/short-pajamas", "Короткие пижамы", "women-pajamas-short", { navTitle: "Короткие пижамы", sortOrder: 1 }),
  CAT("women/sleepwear/button-up", "Пижамы на пуговицах", "women-pajamas-long", { navTitle: "На пуговицах", sortOrder: 2 }),
  CAT("women/sleepwear/pajama-sets", "Пижамные комплекты", "women-pajamas", { navTitle: "Пижамные комплекты", sortOrder: 3 }),
  CAT("women/sleepwear/nightgowns-robes", "Ночные сорочки и халаты", "women-pajamas-nightwear", { navTitle: "Ночные сорочки и Халаты", sortOrder: 4 }),
  CAT("women/activewear", "Женская спортивная одежда", "women-sport", { navTitle: "Спортивная одежда", sortOrder: 4 }),
  CAT("women/socks-tights", "Женские носки и колготки", "women-socks", { navTitle: "Носки и Колготки", sortOrder: 5 }),
  CAT("women/thermal", "Термоодежда", "women-thermal", { navTitle: "Термоодежда", sortOrder: 6 }),
  CAT("women/offers", "Акции", "women-all", { navTitle: "Акции", sortOrder: 7, showInTiles: false }),
  CAT("women/trending", "В тренде", "women-new", { navTitle: "В тренде", sortOrder: 8, showInTiles: false }),
  // collections / sale
  CAT("collections/natural-lifting-bra", "Бюстгальтеры с естественным эффектом", "natural-lifting-bra", { navTitle: "Natural Lifting", parentPath: "women" }),
  CAT("collections/new-in-women", "Новинки для неё", "women-new", { navTitle: "Новинки", parentPath: "women" }),
  CAT("collections/superior-softness", "Superior Softness", "superior-softness", { navTitle: "Superior Softness", parentPath: "women" }),
  CAT("collections/new-in-girls", "Новинки для девочек", "girls-new", { navTitle: "Новинки", parentPath: "girls" }),
  CAT("sale/women", "Распродажа для неё", "women-sale", { navTitle: "Распродажа", parentPath: "women", seoTitle: "Распродажа женского белья и одежды Merey — скидки до -70%" }),
  CAT("sale/girls", "Распродажа для девочек", "girls-sale", { navTitle: "Распродажа", parentPath: "girls" }),
  CAT("sale/all", "Распродажа", "sale-all", { navTitle: "Распродажа", parentPath: null as unknown as string }),
  // girls
  CAT("girls", "Девочкам", "girls-all", { navTitle: "Девочкам" }),
  CAT("girls/lingerie", "Нижнее белье для девочек", "girls-lingerie", { navTitle: "Нижнее белье", sortOrder: 0 }),
  CAT("girls/lingerie/bras", "Бюстгальтеры для девочек", "girls-bras", { navTitle: "Бюстгальтеры", image: `${SITE_ASSETS}/tiles/bralette.svg`, sortOrder: 0 }),
  CAT("girls/lingerie/panties", "Трусики для девочек", "girls-panties", { navTitle: "Трусики", image: `${SITE_ASSETS}/tiles/slip.svg`, sortOrder: 1 }),
  CAT("girls/lingerie/tank-tops", "Майки для девочек", "girls-tops", { navTitle: "Майки", sortOrder: 2 }),
  CAT("girls/clothing", "Одежда для девочек", "girls-clothing", { navTitle: "Одежда", sortOrder: 1 }),
  CAT("girls/pajamas", "Пижамы для девочек", "girls-pajamas", { navTitle: "Пижамы", sortOrder: 2 }),
  CAT("girls/socks-tights", "Носки и колготки для девочек", "girls-socks", { navTitle: "Носки и Колготки", sortOrder: 3 }),
  CAT("girls/kupalniki-i-accessories", "Купальники и аксессуары для девочек", "girls-swimwear", { navTitle: "Купальники и аксессуары", sortOrder: 4 }),
];

const P = (slug: string, title: string, body: string) => ({ slug, title, body, published: true });
export const DEFAULT_PAGES = [
  P("delivery", "Доставка", `<p>Мы доставляем заказы по всей Грузии курьером и в пункты выдачи.</p><ul><li>Курьерская доставка по Тбилиси — 1–2 рабочих дня.</li><li>Доставка в регионы (Батуми, Кутаиси, Рустави и другие города) — 2–5 рабочих дней.</li><li>Бесплатная доставка при заказе от 150 ₾.</li></ul><p>Стоимость и сроки рассчитываются при оформлении заказа.</p>`),
  P("payment", "Оплата", `<p>Доступные способы оплаты: банковские карты Visa и Mastercard, Apple Pay и Google Pay, оплата при получении (для курьерской доставки).</p><p>Все платежи защищены: данные карты передаются по защищенному каналу и не хранятся на сайте.</p>`),
  P("returns", "Возврат", `<p>Вернуть товар надлежащего качества можно в течение 14 дней с момента получения заказа. Нижнее белье, купальники и чулочно-носочные изделия принимаются к возврату только в неповрежденной индивидуальной упаковке.</p><p>Оформить возврат можно в личном кабинете или в любом магазине Merey.</p>`),
  P("orders", "Заказы", `<p>Статус заказа можно отслеживать в разделе «Отследить заказ» или в личном кабинете. После отправки мы пришлем трек-номер на e-mail.</p>`),
  P("faq", "Часто задаваемые вопросы", `<h2>Как подобрать размер?</h2><p>Воспользуйся гидом по размерам на странице товара или в разделе «Гид по размерам».</p><h2>Как работает акция 3=4?</h2><p>Добавь в корзину 4 товара с пометкой 3=4 — самый дешевый из них будет бесплатным.</p><h2>Можно ли изменить заказ?</h2><p>Свяжись с нами через форму обратной связи до момента передачи заказа в доставку.</p>`),
  P("bra-guide", "Гид по бюстгальтерам", `<h2>Как выбрать бюстгальтер</h2><p><strong>Балконет</strong> — открытые чашки, горизонтальный вырез, подходит под декольте.</p><p><strong>Пуш-ап</strong> — уплотненные чашки, визуально увеличивает объем.</p><p><strong>Треугольник</strong> — мягкие чашки без косточек, максимально естественный силуэт.</p><p><strong>Бандо</strong> — без бретелей, под открытые плечи.</p><p><strong>Бралетт</strong> — кружевной, без косточек, носится и как топ.</p>`),
  P("size-guide", "Гид по размерам", `<h2>Бюстгальтеры</h2><p>Измерь обхват под грудью и обхват груди по самой выступающей точке. Разница между ними определяет чашку: 12–13 см — A, 14–15 см — B, 16–17 см — C, 18–19 см — D, 20–21 см — E.</p><h2>Одежда и трусики</h2><table><tr><th>Размер</th><th>XS</th><th>S</th><th>M</th><th>L</th><th>XL</th></tr><tr><td>Обхват бедер, см</td><td>86–90</td><td>90–94</td><td>94–98</td><td>98–104</td><td>104–110</td></tr><tr><td>Обхват талии, см</td><td>60–64</td><td>64–68</td><td>68–72</td><td>72–78</td><td>78–84</td></tr></table>`),
  P("style-guide", "Гид по стилю", `<p>Собирай образы с Merey: базовые лонгсливы и легинсы Invisible Therm на каждый день, атласные пижамы для дома и кружевные комплекты для особого настроения.</p>`),
  P("gift-cards", "Подарочные карты", `<p>Подарочная карта Merey — универсальный подарок. Номиналы от 50 до 500 ₾, действует во всех магазинах и онлайн.</p>`),
  P("careers", "Вакансии", `<p>Мы всегда ищем людей, которые любят моду и сервис. Присылай резюме на hr@merea.studio.</p>`),
  P("about", "О бренде", `<p>Merey — бренд нижнего белья, пижам и одежды. Доступная мода, яркие коллекции и комфорт на каждый день.</p>`),
  P("loyalty", "Программа лояльности", `<h2>Программа лояльности Merey</h2><p>Регистрируйся на сайте, копи бонусы с каждой покупки и оплачивай ими до 30% стоимости следующего заказа. Участникам — закрытые распродажи, подарок на день рождения и ранний доступ к новинкам.</p>`),
  P("privacy-policy", "Политика конфиденциальности", `<p>Настоящая политика определяет порядок обработки персональных данных пользователей сайта. Текст политики редактируется в панели администратора.</p>`),
  P("cookie-policy", "Политика в отношении файлов куки", `<p>Сайт использует файлы cookie и рекомендательные технологии для персонализации контента и аналитики. Продолжая использование сайта, вы соглашаетесь с их использованием.</p>`),
  P("terms", "Условия использования сайта", `<p>Используя сайт, вы принимаете настоящие условия. Текст редактируется в панели администратора.</p>`),
  P("sales-rules", "Правила продажи", `<p>Правила дистанционной продажи товаров. Текст редактируется в панели администратора.</p>`),
  P("gift-card-rules", "Правила использования подарочных карт", `<p>Правила использования подарочных карт. Текст редактируется в панели администратора.</p>`),
  P("promo-rules", "Правила и условия акций", `<p>Акция 3=4: при покупке четырех товаров, отмеченных знаком 3=4, самый дешевый товар предоставляется бесплатно. Акция не суммируется с другими скидками.</p>`),
  P("loyalty-rules", "Правила программы лояльности", `<p>Правила программы лояльности. Текст редактируется в панели администратора.</p>`),
];

export const DEFAULT_STORES = [
  { name: "Merey Tbilisi Mall", city: "Тбилиси", address: "Тбилиси Молл, шоссе Давида Агмашенебели, 16-й км", hours: "10:00–22:00", phone: "+995 32 200 00 01", lat: 41.8129, lng: 44.7717 },
  { name: "Merey Galleria Tbilisi", city: "Тбилиси", address: "Galleria Tbilisi, проспект Руставели, 2/4", hours: "10:00–22:00", phone: "+995 32 200 00 02", lat: 41.6938, lng: 44.8015 },
  { name: "Merey East Point", city: "Тбилиси", address: "East Point, ул. Александра Тварчелидзе, 2", hours: "10:00–22:00", phone: "+995 32 200 00 03", lat: 41.6873, lng: 44.8887 },
  { name: "Merey Batumi Mall", city: "Батуми", address: "Batumi Mall, ул. Чавчавадзе, 5", hours: "10:00–22:00", phone: "+995 422 20 00 01", lat: 41.6461, lng: 41.6367 },
  { name: "Merey Kutaisi", city: "Кутаиси", address: "Grand Mall, ул. Автомшенебели, 88", hours: "10:00–21:00", phone: "+995 431 20 00 01", lat: 42.2488, lng: 42.6651 },
];

export const DEFAULT_SIZE_GUIDES = [
  {
    key: "bras", title: "Бюстгальтеры",
    content: { note: "Измерь обхват под грудью (A) и обхват груди по самой выступающей точке (B).", columns: ["Размер", "Обхват под грудью, см", "Обхват груди, см"], rows: [["70B", "68–72", "84–86"], ["75B", "73–77", "89–91"], ["75C", "73–77", "91–93"], ["75D", "73–77", "93–95"], ["80B", "78–82", "94–96"], ["80C", "78–82", "96–98"], ["80D", "78–82", "98–100"], ["85B", "83–87", "99–101"], ["85C", "83–87", "101–103"], ["85D", "83–87", "103–105"], ["90B", "88–92", "104–106"], ["90C", "88–92", "106–108"]] },
  },
  {
    key: "panties", title: "Трусики",
    content: { columns: ["Размер", "Обхват бедер, см", "Обхват талии, см", "EU"], rows: [["XS", "86–90", "60–64", "34"], ["S", "90–94", "64–68", "36"], ["M", "94–98", "68–72", "38"], ["L", "98–104", "72–78", "40"], ["XL", "104–110", "78–84", "42"]] },
  },
  {
    key: "clothing", title: "Одежда",
    content: { columns: ["Размер", "Обхват груди, см", "Обхват талии, см", "Обхват бедер, см", "EU"], rows: [["XS", "80–84", "60–64", "86–90", "34"], ["S", "84–88", "64–68", "90–94", "36"], ["M", "88–92", "68–72", "94–98", "38"], ["L", "92–98", "72–78", "98–104", "40"], ["XL", "98–104", "78–84", "104–110", "42"]] },
  },
  {
    key: "girls", title: "Девочкам",
    content: { columns: ["Размер", "Рост, см", "Возраст"], rows: [["2-3", "92–98", "2–3 года"], ["4-5", "104–110", "4–5 лет"], ["6-7", "116–122", "6–7 лет"], ["8-9", "128–134", "8–9 лет"], ["10-11", "140–146", "10–11 лет"], ["12-13", "152–158", "12–13 лет"]] },
  },
  {
    key: "socks", title: "Носки и колготки",
    content: { columns: ["Размер", "Рост, см", "Размер обуви"], rows: [["S", "150–160", "35–37"], ["M", "160–170", "37–39"], ["L", "170–180", "39–41"], ["XL", "175–185", "41–43"]] },
  },
  {
    key: "swim", title: "Купальники",
    content: { columns: ["Размер лифа", "Обхват под грудью, см", "Обхват груди, см"], rows: [["70", "68–72", "84–88"], ["75", "73–77", "89–93"], ["80", "78–82", "94–98"], ["85", "83–87", "99–103"], ["90", "88–92", "104–108"]] },
  },
];
