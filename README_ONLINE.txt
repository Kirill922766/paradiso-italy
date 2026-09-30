PARADISO ITALY — ONLINE v6 (FREE, SIMPLE)

Схема:
- GitHub хранит код и фотографии товаров.
- Cloudflare Workers публикует сайт и API.
- Cloudflare D1 хранит товары, заказы, настройки и админ-сессии.
- R2 НЕ ИСПОЛЬЗУЕТСЯ.

Как менять сайт:
1. Код/дизайн: меняйте файлы в репозитории GitHub.
2. Новые фото: положите файл в public/images через GitHub Desktop, затем Push.
3. В админке у товара укажите путь к фото, например images/product-4.png.
4. Push запускает новый деплой Cloudflare автоматически.

Админка: /admin.html
Пароль по умолчанию: admin123 — сразу поменяйте его в админке.

ВАЖНО: schema.sql и seed.sql выполняются один раз в удалённой D1 базе через Console.
