# PARADISO ITALY v6 — Cloudflare Workers + D1

Эта версия не использует R2. Фотографии лежат в `public/images` и публикуются как статические assets.

## 1. D1
Созданная база:
- Name: `paradiso-italy-db`
- ID: `2d231323-e95e-4189-8b0a-816168919e57`

Откройте D1 → `paradiso-italy-db` → Console и выполните сначала весь `schema.sql`, затем весь `seed.sql`.

## 2. GitHub
Репозиторий: `Kirill922766/paradiso-italy`

После Push Cloudflare Workers Build автоматически развернёт новую версию.

## 3. Cloudflare Worker
Wrangler config использует:
- `main = worker.js`
- static assets: `public/`
- D1 binding: `DB`

R2 не нужен.

## 4. Фото
Чтобы добавить новое фото:
- GitHub Desktop → `public/images/` → добавить файл → Commit → Push.
- В админке товара в поле «Путь к фото» написать, например `images/product-4.png`.
- После Push Cloudflare обновит статические файлы.
