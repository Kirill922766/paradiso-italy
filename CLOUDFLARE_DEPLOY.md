# PARADISO ITALY — общий доступ для всех

Эта версия подготовлена для Cloudflare Pages + Pages Functions + D1 + R2.
Она сохраняет текущий дизайн, каталог, корзину, оформление заказов и админку.

## Что будет работать онлайн
- сайт получает общий публичный адрес `*.pages.dev`;
- любой человек может открыть каталог со своего телефона/ПК;
- заказы сохраняются в общей облачной базе D1;
- админка видит заказы с любого устройства;
- товары и настройки сохраняются в D1;
- новые фотографии товаров сохраняются в R2;
- Telegram и Viber остаются двумя отдельными полями в настройках;
- пароль админки не хранится в JavaScript сайта.

Cloudflare Pages Functions поддерживают серверную часть, а D1 можно подключить как облачную SQL-базу. R2 используется для фотографий. См. официальную документацию Cloudflare.

## 1. Создать аккаунт Cloudflare
Откройте https://dash.cloudflare.com/ и войдите/зарегистрируйтесь.

## 2. Создать D1
Cloudflare Dashboard → Workers & Pages → D1 → Create database.

Имя: `paradiso-italy-db`

После создания скопируйте **Database ID**.

## 3. Создать R2
Cloudflare Dashboard → R2 → Create bucket.

Имя: `paradiso-italy-images`

Для фотографий сайта достаточно Standard storage.

## 4. Прописать Database ID
Откройте `wrangler.toml` и замените:

`REPLACE_WITH_YOUR_D1_DATABASE_ID`

на реальный Database ID.

## 5. Заполнить базу
В Cloudflare Dashboard откройте созданную D1 → Console/Query.

Сначала выполните весь `schema.sql`, затем весь `seed.sql`.

После этого в базе появятся 3 исходных товара и пароль админки.

### Пароль по умолчанию
`admin123`

После первого входа желательно сразу изменить пароль в админке.

## 6. Опубликовать через GitHub
Создайте новый приватный или публичный GitHub-репозиторий и загрузите содержимое этой папки.

Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git.

Выберите этот репозиторий.

Build command: `exit 0`
Build output directory: `.`

Pages Functions находятся в папке `functions`, поэтому они автоматически подключатся при деплое.

## 7. Привязать D1 и R2
В Cloudflare Pages откройте проект:

Settings → Bindings.

Добавьте:

- D1 database: Variable name `DB` → `paradiso-italy-db`
- R2 bucket: Variable name `IMAGES` → `paradiso-italy-images`

После добавления binding сделайте новый Deploy.

## 8. Проверка
После публикации Cloudflare даст адрес вида:

`https://paradiso-italy.pages.dev`

Проверить нужно с телефона через мобильный интернет, а не только через тот же Wi-Fi.

Админка:

`https://paradiso-italy.pages.dev/admin.html`

Пароль: `admin123` (если его ещё не меняли).

## Важно
GitHub нужен только как место хранения кода. Общие товары, настройки и заказы находятся в Cloudflare D1, а фотографии — в R2.

Если пользователей станет много, Cloudflare Free имеет дневные лимиты для Workers/D1. Для небольшого магазина и тестирования текущих лимитов достаточно; при превышении лимитов запросы к D1/Functions могут временно перестать выполняться до сброса лимита или потребуется платный план.
