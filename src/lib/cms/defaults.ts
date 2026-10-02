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
  siteName: "Merea",
  tagline: "Официальный интернет-магазин в России",
  logo: "",
  legalEntity: "ООО «КАЛЦРУ»: 123112, город Москва, набережная Пресненская, дом 8 строение 1, помещение 4Н/15 - ИНН 5003046732",
  region: "Россия / ₽",
  language: "Русский",
  supportEmail: "support@merea.ru",
  supportPhone: "8 800 000-00-00",
  socials: [
    { name: "VK", href: "https://vk.com/merea", icon: "vk" },
    { name: "Telegram", href: "https://t.me/merea", icon: "telegram" },
    { name: "YouTube", href: "https://youtube.com/@merea", icon: "youtube" },
  ],
  freeShippingFrom: 3000,
  returnDays: 14,
  cartNotice: "При оформлении заказа рекомендуем не использовать VPN",
  newsletterTitle: "Подпишись на нашу рассылку и узнавай первым о наших новинках и акциях!",
  storeFinderTitle: "Найти магазин",
  storeFinderPlaceholder: "Введи город или почтовый индекс",
  seoTitle: "Женское нижнее белье, пижамы и одежда Merea — купить | Официальный интернет-магазин в России",
  seoDescription: "Merea — бюстгальтеры, трусики, пижамы, одежда и купальники для женщин и девочек. Официальный интернет-магазин в России: доставка по всей стране, возврат 14 дней.",
  headerTransparentOnHome: true,
  showGirlsMenu: true,
  yandexMetrikaId: "",
  shopify: { storeDomain: "", apiVersion: "2026-10" },
};
export type SiteSettings = typeof DEFAULT_SETTINGS;

export const DEFAULT_ANNOUNCEMENTS = [
  { text: "РАСПРОДАЖА: Скидки до -70%", href: "/rasprodazha/dlya-nee", sortOrder: 0 },
  { text: "Костюмы для спорта и отдыха", href: "/zhenschinam/sportivnaya-odezhda", sortOrder: 1 },
  { text: "3=4 на одежду и нижнее бельё 💥", href: "/zhenschinam/aktsii", sortOrder: 2 },
];

export const DEFAULT_HERO_SLIDES = [
  {
    title: "Бюстгальтеры с естественным эффектом",
    subtitle: "Аня Покров выбирает коллекцию бесшовных бюстгальтеров, которые обеспечивают бережную и уверенную поддержку и делают каждый образ невероятно комфортным!",
    ctaText: "Купить сейчас",
    ctaHref: "/kollektsiya/natural-lifting-bra",
    image: `${SITE_ASSETS}/banners/hero-1.svg`,
    imageMobile: `${SITE_ASSETS}/banners/hero-1-mobile.svg`,
    textTheme: "light",
    align: "left",
    sortOrder: 0,
  },
  {
    title: "Скидки ждут",
    subtitle: "Сезонные товары со скидками на сайте и в магазинах. Открой для себя их все!",
    note: "*акция действует на избранный ассортимент с 30.07",
    ctaText: "К покупкам!",
    ctaHref: "/rasprodazha/dlya-nee",
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
  { type: "product_carousel", title: "Собери образ", subtitle: "С термоэффектом", config: { collection: "home-build-look", limit: 12, href: "/zhenschinam/odezhda" }, sortOrder: 1 },
  {
    type: "editorial", title: "Влюбляясь в бордовый", subtitle: "Поддайся своим чувствам к главному цвету сезона — глубокому и элегантному бордовому.",
    config: { image: `${SITE_ASSETS}/banners/editorial-burgundy.svg`, links: [{ label: "Бюстгальтеры", href: "/zhenschinam/nizhnee-bele/byustgaltery" }, { label: "Трусики", href: "/zhenschinam/nizhnee-bele/trusiki" }], collection: "home-burgundy", limit: 10 },
    sortOrder: 2,
  },
  {
    type: "promo_strip", title: "Акции",
    config: { items: [{ text: "3=4 на одежду и нижнее бельё", cta: "К акции", href: "/zhenschinam/aktsii" }, { text: "Скидки до -70%", cta: "К распродаже", href: "/rasprodazha/dlya-nee" }] },
    sortOrder: 3,
  },
  {
    type: "banner", title: "Пижамы для неё", subtitle: "Комплекты из хлопка, атласа и вискозы",
    config: { image: `${SITE_ASSETS}/banners/banner-pajamas.svg`, cta: "К покупкам!", href: "/zhenschinam/pizhamy-i-odezhda-dlya-sna", collection: "home-pajamas", limit: 10, textTheme: "light" },
    sortOrder: 4,
  },
  {
    type: "category_tiles", title: "Категории",
    config: { items: [
      { label: "Бюстгальтеры", href: "/zhenschinam/nizhnee-bele/byustgaltery", image: `${SITE_ASSETS}/tiles/allbras.svg` },
      { label: "Трусики", href: "/zhenschinam/nizhnee-bele/trusiki", image: `${SITE_ASSETS}/tiles/brazilian.svg` },
      { label: "Пижамы", href: "/zhenschinam/pizhamy-i-odezhda-dlya-sna", image: `${SITE_ASSETS}/tiles/pajamas.svg` },
      { label: "Одежда", href: "/zhenschinam/odezhda", image: `${SITE_ASSETS}/tiles/clothing.svg` },
      { label: "Носки и колготки", href: "/zhenschinam/noski-i-kolgotki", image: `${SITE_ASSETS}/tiles/socks.svg` },
      { label: "Девочкам", href: "/devochkam", image: `${SITE_ASSETS}/tiles/girls.svg` },
    ] },
    sortOrder: 5,
  },
  { type: "product_carousel", title: "Новые поступления", subtitle: "Новинки для неё", config: { collection: "women-new", limit: 12, href: "/kollektsiya/novinki-dlya-nee" }, sortOrder: 6 },
];

export const DEFAULT_MENUS: Record<string, MenuNode[]> = {
  women: [
    { label: "Бюстгальтеры с естественным эффектом", href: "/kollektsiya/natural-lifting-bra", badgeText: "НОВИНКИ", badgeColor: "#000000" },
    { label: "Распродажа", href: "/rasprodazha/dlya-nee", badgeText: "СКИДКИ ДО -70%", badgeColor: "#9C5D57", textColor: "#9C5D57" },
    { label: "Новые поступления", href: "/kollektsiya/novinki-dlya-nee" },
    {
      label: "Нижнее белье", href: "/zhenschinam/nizhnee-bele",
      children: [
        { label: "‣ По степени поддержки", href: "/zhenschinam/nizhnee-bele/byustgaltery", badgeText: "НОВИНКА", badgeColor: "#000000" },
        { label: "‣ По цветам", href: "/zhenschinam/nizhnee-bele", badgeText: "НОВИНКА", badgeColor: "#000000" },
        {
          label: "Бюстгальтеры", href: "/zhenschinam/nizhnee-bele/byustgaltery",
          children: [
            { label: "Балконет", href: "/zhenschinam/nizhnee-bele/byustgaltery/balkonet" },
            { label: "Пуш-ап", href: "/zhenschinam/nizhnee-bele/byustgaltery/push-ap" },
            { label: "Треугольник", href: "/zhenschinam/nizhnee-bele/byustgaltery/treugolnik" },
            { label: "Бандо и без бретелей", href: "/zhenschinam/nizhnee-bele/byustgaltery/bando-i-bez-breteley" },
            { label: "Бралетт и брасьер", href: "/zhenschinam/nizhnee-bele/byustgaltery/bralett-i-braser" },
            { label: "Посмотреть все", href: "/zhenschinam/nizhnee-bele/byustgaltery" },
          ],
        },
        {
          label: "Трусики", href: "/zhenschinam/nizhnee-bele/trusiki",
          children: [
            { label: "Бразильяно", href: "/zhenschinam/nizhnee-bele/trusiki/brazilyano" },
            { label: "Слипы", href: "/zhenschinam/nizhnee-bele/trusiki/slipy" },
            { label: "Стринги", href: "/zhenschinam/nizhnee-bele/trusiki/stringi" },
            { label: "Кюлоты", href: "/zhenschinam/nizhnee-bele/trusiki/kyuloty" },
            { label: "Посмотреть все", href: "/zhenschinam/nizhnee-bele/trusiki" },
          ],
        },
        { label: "Комплекты", href: "/zhenschinam/nizhnee-bele/komplekty-nizhnego-belya" },
        { label: "Женское белье", href: "/zhenschinam/nizhnee-bele" },
        { label: "Невидимое белье", href: "/zhenschinam/nizhnee-bele/nevidimoe-bele" },
        { label: "Моделирующее нижнее белье", href: "/zhenschinam/nizhnee-bele/korrektiruyuschee-bele" },
        { label: "Свадебное белье", href: "/zhenschinam/nizhnee-bele/svadebnoe-bele" },
        { label: "Аксессуары", href: "/zhenschinam/nizhnee-bele/aksessuary" },
        { label: "Посмотреть все", href: "/zhenschinam/nizhnee-bele" },
      ],
    },
    {
      label: "Одежда", href: "/zhenschinam/odezhda",
      children: [
        { label: "Майки", href: "/zhenschinam/odezhda/mayki" },
        { label: "Рубашки", href: "/zhenschinam/odezhda/rubashki" },
        { label: "Топы", href: "/zhenschinam/odezhda/krop-topy-i-topy" },
        { label: "Джемперы", href: "/zhenschinam/odezhda/kardigany-i-dzhempery" },
        { label: "Худи и толстовки", href: "/zhenschinam/odezhda/tolstovki" },
        { label: "Брюки", href: "/zhenschinam/odezhda/bryuki" },
        { label: "Джинсы", href: "/zhenschinam/odezhda/dzhinsy" },
        { label: "Платья", href: "/zhenschinam/odezhda/platya" },
        { label: "Комплекты и двойки", href: "/zhenschinam/odezhda/komplekty-i-dvoyki" },
        { label: "Посмотреть все", href: "/zhenschinam/odezhda" },
      ],
    },
    { label: "Купальники и Пляжная одежда", href: "/zhenschinam/kupalniki-i-plyazhnaya-odezhda" },
    {
      label: "Пижамы и Одежда для сна", href: "/zhenschinam/pizhamy-i-odezhda-dlya-sna",
      children: [
        { label: "Длинные пижамы", href: "/zhenschinam/pizhamy-i-odezhda-dlya-sna/dlinnye-pizhamy" },
        { label: "Короткие пижамы", href: "/zhenschinam/pizhamy-i-odezhda-dlya-sna/korotkie-pizhamy" },
        { label: "На пуговицах", href: "/zhenschinam/pizhamy-i-odezhda-dlya-sna/na-pugovitsakh" },
        { label: "Пижамные комплекты", href: "/zhenschinam/pizhamy-i-odezhda-dlya-sna/pizhamnye-komplekty" },
        { label: "Ночные сорочки и Халаты", href: "/zhenschinam/pizhamy-i-odezhda-dlya-sna/nochnye-sorochki-i-khalaty" },
        { label: "Посмотреть все", href: "/zhenschinam/pizhamy-i-odezhda-dlya-sna" },
      ],
    },
    { label: "Спортивная одежда", href: "/zhenschinam/sportivnaya-odezhda" },
    { label: "Носки и Колготки", href: "/zhenschinam/noski-i-kolgotki" },
    { label: "Термоодежда", href: "/zhenschinam/termoodezhda" },
    { label: "Акции", href: "/zhenschinam/aktsii" },
    { label: "В тренде", href: "/zhenschinam/v-trende" },
  ],
  girls: [
    { label: "Новинки для девочек", href: "/kollektsiya/novinki-dlya-devochek", badgeText: "НОВИНКИ", badgeColor: "#000000" },
    { label: "Распродажа", href: "/rasprodazha/dlya-devochek", badgeText: "СКИДКИ ДО -70%", badgeColor: "#9C5D57", textColor: "#9C5D57" },
    {
      label: "Нижнее белье", href: "/devochkam/nizhnee-bele",
      children: [
        { label: "Бюстгальтеры", href: "/devochkam/nizhnee-bele/braser" },
        { label: "Трусики", href: "/devochkam/nizhnee-bele/shorty-i-trusiki" },
        { label: "Майки", href: "/devochkam/nizhnee-bele/mayki" },
        { label: "Посмотреть все", href: "/devochkam/nizhnee-bele" },
      ],
    },
    { label: "Одежда", href: "/devochkam/odezhda" },
    { label: "Пижамы", href: "/devochkam/pizhamy" },
    { label: "Носки и Колготки", href: "/devochkam/noski-i-kolgotki" },
    { label: "Купальники и аксессуары", href: "/devochkam/kupalniki-i-aksessuary" },
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
      { label: "Купальники и Пляжная одежда", href: "/zhenschinam/kupalniki-i-plyazhnaya-odezhda" },
      { label: "Нижнее белье", href: "/zhenschinam/nizhnee-bele" },
      { label: "Бюстгальтеры", href: "/zhenschinam/nizhnee-bele/byustgaltery" },
      { label: "Трусики", href: "/zhenschinam/nizhnee-bele/trusiki" },
      { label: "Свадебное белье", href: "/zhenschinam/nizhnee-bele/svadebnoe-bele" },
      { label: "Одежда", href: "/zhenschinam/odezhda" },
      { label: "Пижамы и Одежда для сна", href: "/zhenschinam/pizhamy-i-odezhda-dlya-sna" },
      { label: "Носки и Колготки", href: "/zhenschinam/noski-i-kolgotki" },
    ],
  },
  {
    title: "ДЕВОЧКАМ",
    links: [
      { label: "Купальники и Пляжная одежда", href: "/devochkam/kupalniki-i-aksessuary" },
      { label: "Нижнее белье", href: "/devochkam/nizhnee-bele" },
      { label: "Бюстгальтеры", href: "/devochkam/nizhnee-bele/braser" },
      { label: "Трусики", href: "/devochkam/nizhnee-bele/shorty-i-trusiki" },
      { label: "Одежда", href: "/devochkam/odezhda" },
      { label: "Пижамы", href: "/devochkam/pizhamy" },
      { label: "Носки и Колготки", href: "/devochkam/noski-i-kolgotki" },
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
    title: "Персонализированная навигация",
    body: "На информационном ресурсе применяются рекомендательные технологии. С помощью профилирующих куки-файлов мы можем предложить тебе персонализированную информацию и сообщения. Продолжая использование сайта, ты соглашаешься на использование куки-файлов. Ознакомиться с правилами и более подробную информацию можно найти в нашей",
    ctaText: "Принять",
    ctaHref: "/policy/cookie-policy",
    secondaryText: "Политике в отношении куки-файлов и рекомендательных технологий",
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
  { tag: "anna-pokrov", label: "ВЫБОР АНИ ПОКРОВ", textColor: "#000000", bgColor: "#FFFFFF", position: "bottom", sortOrder: 5 },
];

const CAT = (path: string, title: string, collectionHandle: string, extra: Partial<{ navTitle: string; parentPath: string; image: string; seoTitle: string; seoDescription: string; seoText: string; showInTiles: boolean; sortOrder: number }> = {}) => ({
  path, title, collectionHandle, parentPath: path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : null, showInTiles: true, sortOrder: 0, ...extra,
});

const BRA_SEO = `<h2>Бюстгальтеры Merea</h2><p>Бюстгальтер — та самая деталь, с которой начинается комфортный образ. В Merea легко найти модель под свой ритм: для обычного дня, открытого топа, платья с вырезом или комплекта, который хочется носить просто для себя.</p><p>В коллекции есть женские бюстгальтеры разных форм, цветов и материалов, от базовых гладких моделей до кружева, бралеттов и пуш ап.</p><h3>Цвета и ткани</h3><p>Выбирай оттенок под одежду или настроение. Черный бюстгальтер легко вписывается в базовый гардероб, белый подходит к светлым вещам, бежевый удобно носить под тонкими и облегающими тканями.</p><p>Хлопковый бюстгальтер подойдет на каждый день, микрофибра — под гладкую одежду, кружево — когда хочется добавить больше акцента.</p>`;

export const DEFAULT_CATEGORIES = [
  CAT("zhenschinam", "Женщинам", "women-all", { navTitle: "Женщинам", seoTitle: "Женское нижнее белье, одежда и пижамы Merea — купить" }),
  CAT("zhenschinam/nizhnee-bele", "Женское нижнее белье", "women-lingerie", { navTitle: "Нижнее белье", seoTitle: "Женское нижнее белье Merea — купить", sortOrder: 0 }),
  CAT("zhenschinam/nizhnee-bele/byustgaltery", "Женские бюстгальтеры", "women-bras", { navTitle: "Бюстгальтеры", image: `${SITE_ASSETS}/tiles/allbras.svg`, seoTitle: "Женские бюстгальтеры Merea — купить", seoText: BRA_SEO, sortOrder: 0 }),
  CAT("zhenschinam/nizhnee-bele/byustgaltery/balkonet", "Бюстгальтеры балконет", "women-bras-balconette", { navTitle: "Балконет", image: `${SITE_ASSETS}/tiles/balconette.svg`, sortOrder: 0 }),
  CAT("zhenschinam/nizhnee-bele/byustgaltery/push-ap", "Бюстгальтеры пуш-ап", "women-bras-pushup", { navTitle: "Пуш-ап", image: `${SITE_ASSETS}/tiles/pushup.svg`, sortOrder: 1 }),
  CAT("zhenschinam/nizhnee-bele/byustgaltery/treugolnik", "Бюстгальтеры-треугольник", "women-bras-triangle", { navTitle: "Треугольник", image: `${SITE_ASSETS}/tiles/triangle.svg`, sortOrder: 2 }),
  CAT("zhenschinam/nizhnee-bele/byustgaltery/bando-i-bez-breteley", "Бюстгальтеры бандо и без бретелей", "women-bras-bandeau", { navTitle: "Бандо и без бретелей", image: `${SITE_ASSETS}/tiles/bandeau.svg`, sortOrder: 3 }),
  CAT("zhenschinam/nizhnee-bele/byustgaltery/bralett-i-braser", "Бралетт и брасьер", "women-bras-bralette", { navTitle: "Бралетт и брасьер", image: `${SITE_ASSETS}/tiles/bralette.svg`, sortOrder: 4 }),
  CAT("zhenschinam/nizhnee-bele/trusiki", "Женские трусики", "women-panties", { navTitle: "Трусики", image: `${SITE_ASSETS}/tiles/brazilian.svg`, seoTitle: "Женские трусики Merea — купить", sortOrder: 1 }),
  CAT("zhenschinam/nizhnee-bele/trusiki/brazilyano", "Бразильяно", "women-panties-brazilian", { navTitle: "Бразильяно", image: `${SITE_ASSETS}/tiles/brazilian.svg`, sortOrder: 0 }),
  CAT("zhenschinam/nizhnee-bele/trusiki/slipy", "Слипы", "women-panties-slips", { navTitle: "Слипы", image: `${SITE_ASSETS}/tiles/slip.svg`, sortOrder: 1 }),
  CAT("zhenschinam/nizhnee-bele/trusiki/stringi", "Стринги", "women-panties-strings", { navTitle: "Стринги", image: `${SITE_ASSETS}/tiles/thong.svg`, sortOrder: 2 }),
  CAT("zhenschinam/nizhnee-bele/trusiki/kyuloty", "Кюлоты", "women-panties-culottes", { navTitle: "Кюлоты", image: `${SITE_ASSETS}/tiles/culotte.svg`, sortOrder: 3 }),
  CAT("zhenschinam/nizhnee-bele/komplekty-nizhnego-belya", "Комплекты нижнего белья", "women-sets", { navTitle: "Комплекты", sortOrder: 2 }),
  CAT("zhenschinam/nizhnee-bele/nevidimoe-bele", "Невидимое белье", "women-invisible", { navTitle: "Невидимое белье", sortOrder: 3 }),
  CAT("zhenschinam/nizhnee-bele/korrektiruyuschee-bele", "Моделирующее нижнее белье", "women-shaping", { navTitle: "Моделирующее", sortOrder: 4 }),
  CAT("zhenschinam/nizhnee-bele/svadebnoe-bele", "Свадебное белье", "women-bridal", { navTitle: "Свадебное белье", sortOrder: 5 }),
  CAT("zhenschinam/nizhnee-bele/aksessuary", "Аксессуары для белья", "women-lingerie-accessories", { navTitle: "Аксессуары", sortOrder: 6 }),
  CAT("zhenschinam/odezhda", "Женская одежда", "women-clothing", { navTitle: "Одежда", seoTitle: "Женская одежда Merea — купить", sortOrder: 1 }),
  CAT("zhenschinam/odezhda/mayki", "Женские майки", "women-clothing-tops", { navTitle: "Майки", sortOrder: 0 }),
  CAT("zhenschinam/odezhda/rubashki", "Женские рубашки", "women-clothing-shirts", { navTitle: "Рубашки", sortOrder: 1 }),
  CAT("zhenschinam/odezhda/krop-topy-i-topy", "Топы и кроп-топы", "women-clothing-tops", { navTitle: "Топы", sortOrder: 2 }),
  CAT("zhenschinam/odezhda/kardigany-i-dzhempery", "Кардиганы и джемперы", "women-clothing-knit", { navTitle: "Джемперы", sortOrder: 3 }),
  CAT("zhenschinam/odezhda/tolstovki", "Худи и толстовки", "women-clothing-sweats", { navTitle: "Худи и толстовки", sortOrder: 4 }),
  CAT("zhenschinam/odezhda/bryuki", "Женские брюки", "women-clothing-pants", { navTitle: "Брюки", sortOrder: 5 }),
  CAT("zhenschinam/odezhda/dzhinsy", "Женские джинсы", "women-clothing-jeans", { navTitle: "Джинсы", sortOrder: 6 }),
  CAT("zhenschinam/odezhda/platya", "Платья", "women-clothing-skirts", { navTitle: "Платья", sortOrder: 7 }),
  CAT("zhenschinam/odezhda/komplekty-i-dvoyki", "Комплекты и двойки", "women-clothing-sets", { navTitle: "Комплекты", sortOrder: 8 }),
  CAT("zhenschinam/kupalniki-i-plyazhnaya-odezhda", "Купальники и пляжная одежда для женщин", "women-swimwear", { navTitle: "Купальники и Пляжная одежда", sortOrder: 2 }),
  CAT("zhenschinam/pizhamy-i-odezhda-dlya-sna", "Женские пижамы и одежда для сна", "women-pajamas", { navTitle: "Пижамы и Одежда для сна", sortOrder: 3 }),
  CAT("zhenschinam/pizhamy-i-odezhda-dlya-sna/dlinnye-pizhamy", "Длинные пижамы", "women-pajamas-long", { navTitle: "Длинные пижамы", sortOrder: 0 }),
  CAT("zhenschinam/pizhamy-i-odezhda-dlya-sna/korotkie-pizhamy", "Короткие пижамы", "women-pajamas-short", { navTitle: "Короткие пижамы", sortOrder: 1 }),
  CAT("zhenschinam/pizhamy-i-odezhda-dlya-sna/na-pugovitsakh", "Пижамы на пуговицах", "women-pajamas-long", { navTitle: "На пуговицах", sortOrder: 2 }),
  CAT("zhenschinam/pizhamy-i-odezhda-dlya-sna/pizhamnye-komplekty", "Пижамные комплекты", "women-pajamas", { navTitle: "Пижамные комплекты", sortOrder: 3 }),
  CAT("zhenschinam/pizhamy-i-odezhda-dlya-sna/nochnye-sorochki-i-khalaty", "Ночные сорочки и халаты", "women-pajamas-nightwear", { navTitle: "Ночные сорочки и Халаты", sortOrder: 4 }),
  CAT("zhenschinam/sportivnaya-odezhda", "Женская спортивная одежда", "women-sport", { navTitle: "Спортивная одежда", sortOrder: 4 }),
  CAT("zhenschinam/noski-i-kolgotki", "Женские носки и колготки", "women-socks", { navTitle: "Носки и Колготки", sortOrder: 5 }),
  CAT("zhenschinam/termoodezhda", "Термоодежда", "women-thermal", { navTitle: "Термоодежда", sortOrder: 6 }),
  CAT("zhenschinam/aktsii", "Акции", "women-all", { navTitle: "Акции", sortOrder: 7, showInTiles: false }),
  CAT("zhenschinam/v-trende", "В тренде", "women-new", { navTitle: "В тренде", sortOrder: 8, showInTiles: false }),
  // collections / sale
  CAT("kollektsiya/natural-lifting-bra", "Бюстгальтеры с естественным эффектом", "natural-lifting-bra", { navTitle: "Natural Lifting", parentPath: "zhenschinam" }),
  CAT("kollektsiya/novinki-dlya-nee", "Новинки для неё", "women-new", { navTitle: "Новинки", parentPath: "zhenschinam" }),
  CAT("kollektsiya/superior-softness", "Superior Softness", "superior-softness", { navTitle: "Superior Softness", parentPath: "zhenschinam" }),
  CAT("kollektsiya/novinki-dlya-devochek", "Новинки для девочек", "girls-new", { navTitle: "Новинки", parentPath: "devochkam" }),
  CAT("rasprodazha/dlya-nee", "Распродажа для неё", "women-sale", { navTitle: "Распродажа", parentPath: "zhenschinam", seoTitle: "Распродажа женского белья и одежды Merea — скидки до -70%" }),
  CAT("rasprodazha/dlya-devochek", "Распродажа для девочек", "girls-sale", { navTitle: "Распродажа", parentPath: "devochkam" }),
  CAT("rasprodazha/dlya-vsekh", "Распродажа", "sale-all", { navTitle: "Распродажа", parentPath: null as unknown as string }),
  // girls
  CAT("devochkam", "Девочкам", "girls-all", { navTitle: "Девочкам" }),
  CAT("devochkam/nizhnee-bele", "Нижнее белье для девочек", "girls-lingerie", { navTitle: "Нижнее белье", sortOrder: 0 }),
  CAT("devochkam/nizhnee-bele/braser", "Бюстгальтеры для девочек", "girls-bras", { navTitle: "Бюстгальтеры", image: `${SITE_ASSETS}/tiles/bralette.svg`, sortOrder: 0 }),
  CAT("devochkam/nizhnee-bele/shorty-i-trusiki", "Трусики для девочек", "girls-panties", { navTitle: "Трусики", image: `${SITE_ASSETS}/tiles/slip.svg`, sortOrder: 1 }),
  CAT("devochkam/nizhnee-bele/mayki", "Майки для девочек", "girls-tops", { navTitle: "Майки", sortOrder: 2 }),
  CAT("devochkam/odezhda", "Одежда для девочек", "girls-clothing", { navTitle: "Одежда", sortOrder: 1 }),
  CAT("devochkam/pizhamy", "Пижамы для девочек", "girls-pajamas", { navTitle: "Пижамы", sortOrder: 2 }),
  CAT("devochkam/noski-i-kolgotki", "Носки и колготки для девочек", "girls-socks", { navTitle: "Носки и Колготки", sortOrder: 3 }),
  CAT("devochkam/kupalniki-i-aksessuary", "Купальники и аксессуары для девочек", "girls-swimwear", { navTitle: "Купальники и аксессуары", sortOrder: 4 }),
];

const P = (slug: string, title: string, body: string) => ({ slug, title, body, published: true });
export const DEFAULT_PAGES = [
  P("delivery", "Доставка", `<p>Мы доставляем заказы по всей России курьером, в пункты выдачи и постаматы.</p><ul><li>Курьерская доставка по Москве и Санкт-Петербургу — 1–2 дня.</li><li>Доставка в пункты выдачи — 2–7 дней в зависимости от региона.</li><li>Бесплатная доставка при заказе от 3 000 ₽.</li></ul><p>Стоимость и сроки рассчитываются при оформлении заказа.</p>`),
  P("payment", "Оплата", `<p>Доступные способы оплаты: банковские карты МИР, Visa, Mastercard, СБП, оплата при получении (для курьерской доставки).</p><p>Все платежи защищены: данные карты передаются по защищенному каналу и не хранятся на сайте.</p>`),
  P("returns", "Возврат", `<p>Вернуть товар надлежащего качества можно в течение 14 дней с момента получения заказа. Нижнее белье, купальники и носки возврату не подлежат согласно законодательству РФ, если сохранена гигиеническая упаковка.</p><p>Оформить возврат можно в личном кабинете или в любом магазине Merea.</p>`),
  P("orders", "Заказы", `<p>Статус заказа можно отслеживать в разделе «Отследить заказ» или в личном кабинете. После отправки мы пришлем трек-номер на e-mail.</p>`),
  P("faq", "Часто задаваемые вопросы", `<h2>Как подобрать размер?</h2><p>Воспользуйся гидом по размерам на странице товара или в разделе «Гид по размерам».</p><h2>Как работает акция 3=4?</h2><p>Добавь в корзину 4 товара с пометкой 3=4 — самый дешевый из них будет бесплатным.</p><h2>Можно ли изменить заказ?</h2><p>Свяжись с нами через форму обратной связи до момента передачи заказа в доставку.</p>`),
  P("bra-guide", "Гид по бюстгальтерам", `<h2>Как выбрать бюстгальтер</h2><p><strong>Балконет</strong> — открытые чашки, горизонтальный вырез, подходит под декольте.</p><p><strong>Пуш-ап</strong> — уплотненные чашки, визуально увеличивает объем.</p><p><strong>Треугольник</strong> — мягкие чашки без косточек, максимально естественный силуэт.</p><p><strong>Бандо</strong> — без бретелей, под открытые плечи.</p><p><strong>Бралетт</strong> — кружевной, без косточек, носится и как топ.</p>`),
  P("size-guide", "Гид по размерам", `<h2>Бюстгальтеры</h2><p>Измерь обхват под грудью и обхват груди по самой выступающей точке. Разница между ними определяет чашку: 12–13 см — A, 14–15 см — B, 16–17 см — C, 18–19 см — D, 20–21 см — E.</p><h2>Одежда и трусики</h2><table><tr><th>Размер</th><th>XS</th><th>S</th><th>M</th><th>L</th><th>XL</th></tr><tr><td>Обхват бедер, см</td><td>86–90</td><td>90–94</td><td>94–98</td><td>98–104</td><td>104–110</td></tr><tr><td>Обхват талии, см</td><td>60–64</td><td>64–68</td><td>68–72</td><td>72–78</td><td>78–84</td></tr></table>`),
  P("style-guide", "Гид по стилю", `<p>Собирай образы с Merea: базовые лонгсливы и легинсы Invisible Therm на каждый день, атласные пижамы для дома и кружевные комплекты для особого настроения.</p>`),
  P("gift-cards", "Подарочные карты", `<p>Подарочная карта Merea — универсальный подарок. Номиналы от 1 000 до 15 000 ₽, действует во всех магазинах и онлайн.</p>`),
  P("careers", "Вакансии", `<p>Мы всегда ищем людей, которые любят моду и сервис. Присылай резюме на hr@merea.ru.</p>`),
  P("about", "О бренде", `<p>Merea — итальянский бренд нижнего белья, пижам и одежды. Доступная мода, яркие коллекции и комфорт на каждый день.</p>`),
  P("loyalty", "Программа лояльности", `<h2>Программа лояльности Merea</h2><p>Регистрируйся на сайте, копи бонусы с каждой покупки и оплачивай ими до 30% стоимости следующего заказа. Участникам — закрытые распродажи, подарок на день рождения и ранний доступ к новинкам.</p>`),
  P("privacy-policy", "Политика конфиденциальности", `<p>Настоящая политика определяет порядок обработки персональных данных пользователей сайта. Текст политики редактируется в панели администратора.</p>`),
  P("cookie-policy", "Политика в отношении файлов куки", `<p>Сайт использует файлы cookie и рекомендательные технологии для персонализации контента и аналитики. Продолжая использование сайта, вы соглашаетесь с их использованием.</p>`),
  P("terms", "Условия использования сайта", `<p>Используя сайт, вы принимаете настоящие условия. Текст редактируется в панели администратора.</p>`),
  P("sales-rules", "Правила продажи", `<p>Правила дистанционной продажи товаров. Текст редактируется в панели администратора.</p>`),
  P("gift-card-rules", "Правила использования подарочных карт", `<p>Правила использования подарочных карт. Текст редактируется в панели администратора.</p>`),
  P("promo-rules", "Правила и условия акций", `<p>Акция 3=4: при покупке четырех товаров, отмеченных знаком 3=4, самый дешевый товар предоставляется бесплатно. Акция не суммируется с другими скидками.</p>`),
  P("loyalty-rules", "Правила программы лояльности", `<p>Правила программы лояльности. Текст редактируется в панели администратора.</p>`),
];

export const DEFAULT_STORES = [
  { name: "Merea Авиапарк", city: "Москва", address: "Ходынский бульвар, 4, ТРЦ «Авиапарк», 2 этаж", hours: "10:00–22:00", phone: "+7 (495) 000-00-01", lat: 55.7902, lng: 37.5305 },
  { name: "Merea Европейский", city: "Москва", address: "пл. Киевского Вокзала, 2, ТРЦ «Европейский», 1 этаж", hours: "10:00–22:00", phone: "+7 (495) 000-00-02", lat: 55.7444, lng: 37.5663 },
  { name: "Merea Метрополис", city: "Москва", address: "Ленинградское шоссе, 16А, стр. 4, ТРЦ «Метрополис»", hours: "10:00–22:00", phone: "+7 (495) 000-00-03", lat: 55.8257, lng: 37.4969 },
  { name: "Merea Галерея", city: "Санкт-Петербург", address: "Лиговский проспект, 30А, ТРЦ «Галерея», 2 этаж", hours: "10:00–22:00", phone: "+7 (812) 000-00-01", lat: 59.9276, lng: 30.3606 },
  { name: "Merea Мега Казань", city: "Казань", address: "просп. Победы, 141, ТЦ «Мега»", hours: "10:00–22:00", phone: "+7 (843) 000-00-01", lat: 55.7612, lng: 49.2271 },
  { name: "Merea Гринвич", city: "Екатеринбург", address: "ул. 8 Марта, 46, ТРЦ «Гринвич»", hours: "10:00–22:00", phone: "+7 (343) 000-00-01", lat: 56.8291, lng: 60.5987 },
];

export const DEFAULT_SIZE_GUIDES = [
  {
    key: "bras", title: "Бюстгальтеры",
    content: { note: "Измерь обхват под грудью (A) и обхват груди по самой выступающей точке (B).", columns: ["Размер", "Обхват под грудью, см", "Обхват груди, см"], rows: [["70B", "68–72", "84–86"], ["75B", "73–77", "89–91"], ["75C", "73–77", "91–93"], ["75D", "73–77", "93–95"], ["80B", "78–82", "94–96"], ["80C", "78–82", "96–98"], ["80D", "78–82", "98–100"], ["85B", "83–87", "99–101"], ["85C", "83–87", "101–103"], ["85D", "83–87", "103–105"], ["90B", "88–92", "104–106"], ["90C", "88–92", "106–108"]] },
  },
  {
    key: "panties", title: "Трусики",
    content: { columns: ["Размер", "Обхват бедер, см", "Обхват талии, см", "RU"], rows: [["XS", "86–90", "60–64", "40"], ["S", "90–94", "64–68", "42"], ["M", "94–98", "68–72", "44"], ["L", "98–104", "72–78", "46"], ["XL", "104–110", "78–84", "48"]] },
  },
  {
    key: "clothing", title: "Одежда",
    content: { columns: ["Размер", "Обхват груди, см", "Обхват талии, см", "Обхват бедер, см", "RU"], rows: [["XS", "80–84", "60–64", "86–90", "40"], ["S", "84–88", "64–68", "90–94", "42"], ["M", "88–92", "68–72", "94–98", "44"], ["L", "92–98", "72–78", "98–104", "46"], ["XL", "98–104", "78–84", "104–110", "48"]] },
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
