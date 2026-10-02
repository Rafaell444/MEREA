/**
 * Admin model registry: declares which Prisma models the admin can manage and how to render their forms.
 * Everything in /admin/[model] is generated from this file.
 */
export type FieldType = "text" | "textarea" | "html" | "number" | "boolean" | "select" | "color" | "image" | "json" | "date" | "password" | "parent" | "readonly";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  options?: { value: string; label: string }[];
  placeholder?: string;
  width?: "full" | "half";
  default?: unknown;
};

export type ModelDef = {
  key: string; // url segment & prisma delegate (camelCase)
  delegate: string;
  label: string;
  labelPlural: string;
  icon: string; // lucide icon name (resolved in Sidebar)
  group: "content" | "catalog" | "marketing" | "inbox" | "system";
  fields: Field[];
  listColumns: string[];
  orderable?: boolean; // has sortOrder
  toggle?: string; // boolean field used as the enable/disable switch in lists
  search?: string[]; // fields searched by the list filter
  readonly?: boolean; // no create/edit (inbox-style)
  titleField?: string;
  filterField?: Field; // optional top-level filter (e.g. menu: women/girls)
  help?: string;
};

const CATEGORY_SELECT_HELP = "Путь без начального слэша, например zhenschinam/nizhnee-bele/byustgaltery";

export const MODELS: ModelDef[] = [
  {
    key: "announcements", delegate: "announcement", label: "Бегущая строка", labelPlural: "Бегущая строка", icon: "Megaphone", group: "marketing",
    help: "Сообщения в верхней бегущей строке. Можно задать период показа.",
    fields: [
      { name: "text", label: "Текст", type: "text", required: true },
      { name: "href", label: "Ссылка", type: "text", placeholder: "/rasprodazha/dlya-nee", width: "half" },
      { name: "enabled", label: "Включено", type: "boolean", default: true, width: "half" },
      { name: "startsAt", label: "Показывать с", type: "date", width: "half" },
      { name: "endsAt", label: "Показывать до", type: "date", width: "half" },
    ],
    listColumns: ["text", "href"], orderable: true, toggle: "enabled", titleField: "text",
  },
  {
    key: "hero", delegate: "heroSlide", label: "Слайд главного баннера", labelPlural: "Главный слайдер", icon: "Images", group: "content",
    help: "Полноэкранные слайды на главной странице. Если изображение не задано — показывается красный фон «Распродажа до -70%».",
    fields: [
      { name: "title", label: "Заголовок", type: "text", required: true },
      { name: "subtitle", label: "Подзаголовок", type: "textarea" },
      { name: "note", label: "Примечание (мелкий текст)", type: "text" },
      { name: "ctaText", label: "Текст кнопки", type: "text", width: "half" },
      { name: "ctaHref", label: "Ссылка кнопки", type: "text", width: "half" },
      { name: "image", label: "Изображение (десктоп)", type: "image" },
      { name: "imageMobile", label: "Изображение (мобильное)", type: "image" },
      { name: "video", label: "Видео (mp4 URL, необязательно)", type: "text" },
      { name: "textTheme", label: "Цвет текста", type: "select", options: [{ value: "light", label: "Белый" }, { value: "dark", label: "Черный" }], default: "light", width: "half" },
      { name: "align", label: "Выравнивание", type: "select", options: [{ value: "left", label: "Слева" }, { value: "center", label: "По центру" }], default: "left", width: "half" },
      { name: "enabled", label: "Включено", type: "boolean", default: true },
    ],
    listColumns: ["title", "ctaHref"], orderable: true, toggle: "enabled", titleField: "title",
  },
  {
    key: "home", delegate: "homeSection", label: "Блок главной страницы", labelPlural: "Главная страница", icon: "LayoutTemplate", group: "content",
    help: "Порядок блоков на главной. Тип блока определяет, какие поля из «Настроек блока (JSON)» используются: product_carousel → {collection, limit, href}; editorial → {image, links:[{label,href}], collection, limit}; banner → {image, cta, href, collection, limit, textTheme}; promo_strip → {items:[{text,cta,href}]}; category_tiles → {items:[{label,href,image}]}; text → {html}.",
    fields: [
      { name: "type", label: "Тип блока", type: "select", required: true, options: [
        { value: "hero", label: "Главный слайдер" }, { value: "product_carousel", label: "Карусель товаров" }, { value: "editorial", label: "Редакционный блок (фото + текст + товары)" },
        { value: "banner", label: "Баннер + товары" }, { value: "promo_strip", label: "Бегущая промо-полоса" }, { value: "category_tiles", label: "Плитки категорий" }, { value: "text", label: "Текст (HTML)" },
      ] },
      { name: "title", label: "Заголовок", type: "text", width: "half" },
      { name: "subtitle", label: "Подзаголовок", type: "text", width: "half" },
      { name: "config", label: "Настройки блока (JSON)", type: "json", default: {} },
      { name: "enabled", label: "Включено", type: "boolean", default: true },
    ],
    listColumns: ["type", "title"], orderable: true, toggle: "enabled", titleField: "title",
  },
  {
    key: "menus", delegate: "menuItem", label: "Пункт меню", labelPlural: "Меню", icon: "Menu", group: "content",
    help: "Дерево навигации. Пункты с дочерними элементами открывают следующую панель. Меню «service» — нижние ссылки в выдвижном меню (Избранное, Отследить заказ…).",
    filterField: { name: "menu", label: "Меню", type: "select", options: [{ value: "women", label: "Женщинам" }, { value: "girls", label: "Девочкам" }, { value: "service", label: "Сервисные ссылки" }] },
    fields: [
      { name: "menu", label: "Меню", type: "select", required: true, options: [{ value: "women", label: "Женщинам" }, { value: "girls", label: "Девочкам" }, { value: "service", label: "Сервисные ссылки" }], width: "half" },
      { name: "parentId", label: "Родительский пункт", type: "parent", width: "half" },
      { name: "label", label: "Название", type: "text", required: true, width: "half" },
      { name: "href", label: "Ссылка", type: "text", width: "half", help: "Если пусто и есть дочерние пункты — только раскрывает список" },
      { name: "badgeText", label: "Бейдж (например, НОВИНКИ)", type: "text", width: "half" },
      { name: "badgeColor", label: "Цвет бейджа", type: "color", width: "half" },
      { name: "textColor", label: "Цвет текста", type: "color", width: "half" },
      { name: "image", label: "Промо-изображение панели", type: "image", width: "half" },
      { name: "enabled", label: "Включено", type: "boolean", default: true },
    ],
    listColumns: ["label", "href", "badgeText"], orderable: true, toggle: "enabled", titleField: "label", search: ["label", "href"],
  },
  {
    key: "footer-columns", delegate: "footerColumn", label: "Колонка футера", labelPlural: "Футер: колонки", icon: "PanelBottom", group: "content",
    fields: [
      { name: "title", label: "Заголовок", type: "text", required: true },
      { name: "enabled", label: "Включено", type: "boolean", default: true },
    ],
    listColumns: ["title"], orderable: true, toggle: "enabled", titleField: "title",
  },
  {
    key: "footer-links", delegate: "footerLink", label: "Ссылка футера", labelPlural: "Футер: ссылки", icon: "Link", group: "content",
    fields: [
      { name: "columnId", label: "Колонка", type: "select", required: true, options: [] /* filled at runtime */ },
      { name: "label", label: "Название", type: "text", required: true, width: "half" },
      { name: "href", label: "Ссылка", type: "text", required: true, width: "half" },
      { name: "enabled", label: "Включено", type: "boolean", default: true },
    ],
    listColumns: ["label", "href"], orderable: true, toggle: "enabled", titleField: "label", search: ["label", "href"],
  },
  {
    key: "popups", delegate: "popup", label: "Попап", labelPlural: "Попапы и маркетинг", icon: "MessageSquare", group: "marketing",
    help: "Ключ cookie — согласие на куки (показывается первым). Остальные попапы показываются после него с учетом задержки, скролла и частоты. Пути — JSON-массив префиксов, например [\"/product\"].",
    fields: [
      { name: "key", label: "Ключ (уникальный)", type: "text", required: true, width: "half", placeholder: "newsletter" },
      { name: "name", label: "Название (для админки)", type: "text", required: true, width: "half" },
      { name: "enabled", label: "Включен", type: "boolean", default: true },
      { name: "title", label: "Заголовок", type: "text", required: true },
      { name: "body", label: "Текст", type: "textarea" },
      { name: "image", label: "Изображение", type: "image" },
      { name: "ctaText", label: "Текст кнопки", type: "text", width: "half" },
      { name: "ctaHref", label: "Ссылка кнопки", type: "text", width: "half" },
      { name: "secondaryText", label: "Текст ссылки (для куки-попапа)", type: "text" },
      { name: "delaySeconds", label: "Задержка, сек", type: "number", default: 10, width: "half" },
      { name: "scrollPercent", label: "Показать после прокрутки, %", type: "number", default: 0, width: "half" },
      { name: "frequencyDays", label: "Показывать раз в N дней", type: "number", default: 7, width: "half" },
      { name: "showOnPaths", label: "Только на путях (JSON)", type: "json", default: [], width: "half" },
      { name: "excludePaths", label: "Кроме путей (JSON)", type: "json", default: [] },
      { name: "config", label: "Доп. настройки (JSON: placeholder, discountCode, consentPrivacy, consentMarketing, successTitle, successText)", type: "json", default: {} },
      { name: "startsAt", label: "Показывать с", type: "date", width: "half" },
      { name: "endsAt", label: "Показывать до", type: "date", width: "half" },
    ],
    listColumns: ["key", "name", "title"], toggle: "enabled", titleField: "name",
  },
  {
    key: "categories", delegate: "categoryPage", label: "Категория", labelPlural: "Категории (страницы каталога)", icon: "FolderTree", group: "catalog",
    help: "Связывает URL сайта с коллекцией Shopify. Дочерние категории показываются плитками над товарами.",
    fields: [
      { name: "path", label: "Путь (URL)", type: "text", required: true, help: CATEGORY_SELECT_HELP },
      { name: "parentPath", label: "Родительский путь", type: "text", width: "half" },
      { name: "collectionHandle", label: "Handle коллекции Shopify", type: "text", width: "half", help: "Например women-bras" },
      { name: "title", label: "Заголовок H1", type: "text", required: true, width: "half" },
      { name: "navTitle", label: "Короткое название (плитки, крошки)", type: "text", width: "half" },
      { name: "image", label: "Изображение плитки", type: "image" },
      { name: "showInTiles", label: "Показывать плиткой", type: "boolean", default: true, width: "half" },
      { name: "enabled", label: "Включено", type: "boolean", default: true, width: "half" },
      { name: "bannerImage", label: "Баннер над товарами", type: "image" },
      { name: "bannerTitle", label: "Заголовок баннера", type: "text", width: "half" },
      { name: "bannerText", label: "Текст баннера", type: "text", width: "half" },
      { name: "seoTitle", label: "SEO title", type: "text" },
      { name: "seoDescription", label: "SEO description", type: "textarea" },
      { name: "seoText", label: "SEO-текст под товарами (HTML)", type: "html" },
    ],
    listColumns: ["path", "title", "collectionHandle"], orderable: true, toggle: "enabled", titleField: "title", search: ["path", "title", "collectionHandle"],
  },
  {
    key: "badges", delegate: "promoBadge", label: "Бейдж", labelPlural: "Бейджи на товарах", icon: "Tag", group: "catalog",
    help: "Бейдж показывается на товаре, если у него есть соответствующий тег в Shopify (например 3=4, new, sale).",
    fields: [
      { name: "tag", label: "Тег Shopify", type: "text", required: true, width: "half" },
      { name: "label", label: "Надпись", type: "text", required: true, width: "half" },
      { name: "textColor", label: "Цвет текста", type: "color", default: "#80251D", width: "half" },
      { name: "bgColor", label: "Цвет фона", type: "color", default: "#FFFFFF", width: "half" },
      { name: "position", label: "Позиция", type: "select", options: [{ value: "bottom", label: "Внизу" }, { value: "top", label: "Вверху" }], default: "bottom", width: "half" },
      { name: "enabled", label: "Включен", type: "boolean", default: true, width: "half" },
    ],
    listColumns: ["tag", "label"], orderable: true, toggle: "enabled", titleField: "label",
  },
  {
    key: "pages", delegate: "page", label: "Страница", labelPlural: "Текстовые страницы", icon: "FileText", group: "content",
    help: "Доступны по /pages/<slug> и /policy/<slug>.",
    fields: [
      { name: "slug", label: "Slug (URL)", type: "text", required: true, width: "half" },
      { name: "title", label: "Заголовок", type: "text", required: true, width: "half" },
      { name: "body", label: "Содержимое (HTML)", type: "html", required: true },
      { name: "seoTitle", label: "SEO title", type: "text", width: "half" },
      { name: "seoDescription", label: "SEO description", type: "text", width: "half" },
      { name: "published", label: "Опубликовано", type: "boolean", default: true },
    ],
    listColumns: ["slug", "title"], toggle: "published", titleField: "title", search: ["slug", "title"],
  },
  {
    key: "stores", delegate: "store", label: "Магазин", labelPlural: "Магазины", icon: "Store", group: "content",
    fields: [
      { name: "name", label: "Название", type: "text", required: true, width: "half" },
      { name: "city", label: "Город", type: "text", required: true, width: "half" },
      { name: "address", label: "Адрес", type: "text", required: true },
      { name: "hours", label: "Часы работы", type: "text", width: "half" },
      { name: "phone", label: "Телефон", type: "text", width: "half" },
      { name: "lat", label: "Широта", type: "number", width: "half" },
      { name: "lng", label: "Долгота", type: "number", width: "half" },
      { name: "enabled", label: "Включен", type: "boolean", default: true },
    ],
    listColumns: ["city", "name", "address"], orderable: true, toggle: "enabled", titleField: "name", search: ["city", "name", "address"],
  },
  {
    key: "size-guides", delegate: "sizeGuide", label: "Таблица размеров", labelPlural: "Таблицы размеров", icon: "Ruler", group: "catalog",
    help: "Содержимое — JSON: {\"note\":\"…\",\"columns\":[…],\"rows\":[[…],[…]]}. Ключ связывается с метаполем товара custom.size_guide.",
    fields: [
      { name: "key", label: "Ключ", type: "text", required: true, width: "half" },
      { name: "title", label: "Название", type: "text", required: true, width: "half" },
      { name: "content", label: "Таблица (JSON)", type: "json", required: true },
    ],
    listColumns: ["key", "title"], orderable: true, titleField: "title",
  },
  {
    key: "reviews", delegate: "review", label: "Отзыв", labelPlural: "Отзывы (модерация)", icon: "Star", group: "inbox",
    fields: [
      { name: "productHandle", label: "Handle товара", type: "text", required: true },
      { name: "author", label: "Автор", type: "text", required: true, width: "half" },
      { name: "rating", label: "Оценка (1–5)", type: "number", required: true, width: "half" },
      { name: "title", label: "Заголовок", type: "text" },
      { name: "body", label: "Текст", type: "textarea", required: true },
      { name: "approved", label: "Одобрен (виден на сайте)", type: "boolean", default: false },
    ],
    listColumns: ["productHandle", "author", "rating"], toggle: "approved", titleField: "author", search: ["productHandle", "author"],
  },
  {
    key: "subscribers", delegate: "subscriber", label: "Подписчик", labelPlural: "Подписчики", icon: "Mail", group: "inbox",
    fields: [
      { name: "email", label: "E-mail", type: "text", required: true, width: "half" },
      { name: "source", label: "Источник", type: "text", width: "half" },
      { name: "consent", label: "Согласие на рассылку", type: "boolean", default: true },
    ],
    listColumns: ["email", "source", "createdAt"], toggle: "consent", titleField: "email", search: ["email"],
  },
  {
    key: "messages", delegate: "contactMessage", label: "Сообщение", labelPlural: "Обращения клиентов", icon: "Inbox", group: "inbox",
    fields: [
      { name: "name", label: "Имя", type: "readonly", width: "half" },
      { name: "email", label: "E-mail", type: "readonly", width: "half" },
      { name: "phone", label: "Телефон", type: "readonly", width: "half" },
      { name: "orderNo", label: "Номер заказа", type: "readonly", width: "half" },
      { name: "topic", label: "Тема", type: "readonly" },
      { name: "message", label: "Сообщение", type: "readonly" },
      { name: "handled", label: "Обработано", type: "boolean", default: false },
    ],
    listColumns: ["name", "email", "topic", "createdAt"], toggle: "handled", titleField: "name", search: ["name", "email", "message"],
  },
  {
    key: "returns", delegate: "returnRequest", label: "Заявка на возврат", labelPlural: "Возвраты", icon: "RotateCcw", group: "inbox",
    fields: [
      { name: "orderNumber", label: "Номер заказа", type: "readonly", width: "half" },
      { name: "email", label: "E-mail", type: "readonly", width: "half" },
      { name: "items", label: "Товары (JSON)", type: "readonly" },
      { name: "reason", label: "Причина", type: "readonly", width: "half" },
      { name: "comment", label: "Комментарий", type: "readonly", width: "half" },
      { name: "status", label: "Статус", type: "select", options: [{ value: "new", label: "Новая" }, { value: "approved", label: "Одобрена" }, { value: "rejected", label: "Отклонена" }, { value: "refunded", label: "Возврат выполнен" }], default: "new" },
    ],
    listColumns: ["orderNumber", "email", "status", "createdAt"], titleField: "orderNumber", search: ["orderNumber", "email"],
  },
  {
    key: "notify", delegate: "notifyRequest", label: "Запрос о поступлении", labelPlural: "Ждут поступления", icon: "Bell", group: "inbox",
    fields: [
      { name: "email", label: "E-mail", type: "readonly", width: "half" },
      { name: "size", label: "Размер", type: "readonly", width: "half" },
      { name: "productHandle", label: "Товар", type: "readonly" },
      { name: "notified", label: "Уведомлен", type: "boolean", default: false },
    ],
    listColumns: ["email", "productHandle", "size", "createdAt"], toggle: "notified", titleField: "email", search: ["email", "productHandle"],
  },
  {
    key: "users", delegate: "adminUser", label: "Администратор", labelPlural: "Администраторы", icon: "Users", group: "system",
    help: "Роли: owner — полный доступ, admin — всё кроме управления администраторами, editor — только контент.",
    fields: [
      { name: "name", label: "Имя", type: "text", required: true, width: "half" },
      { name: "email", label: "E-mail", type: "text", required: true, width: "half" },
      { name: "password", label: "Пароль (оставь пустым, чтобы не менять)", type: "password" },
      { name: "role", label: "Роль", type: "select", options: [{ value: "owner", label: "Владелец" }, { value: "admin", label: "Администратор" }, { value: "editor", label: "Редактор" }], default: "editor", width: "half" },
      { name: "active", label: "Активен", type: "boolean", default: true, width: "half" },
    ],
    listColumns: ["name", "email", "role", "lastLoginAt"], toggle: "active", titleField: "name",
  },
  {
    key: "media", delegate: "media", label: "Файл", labelPlural: "Медиатека", icon: "Image", group: "system",
    fields: [
      { name: "url", label: "URL", type: "readonly" },
      { name: "filename", label: "Имя файла", type: "readonly", width: "half" },
      { name: "size", label: "Размер, байт", type: "readonly", width: "half" },
      { name: "alt", label: "Alt-текст", type: "text" },
    ],
    listColumns: ["url", "filename", "createdAt"], titleField: "filename", search: ["filename", "alt"],
  },
];

export const MODEL_BY_KEY = Object.fromEntries(MODELS.map((m) => [m.key, m])) as Record<string, ModelDef>;

export function roleCan(role: string, model: ModelDef, action: "read" | "write") {
  if (role === "owner") return true;
  if (model.key === "users") return false;
  if (role === "admin") return true;
  // editor
  if (model.group === "system") return action === "read" && model.key === "media";
  return true;
}
