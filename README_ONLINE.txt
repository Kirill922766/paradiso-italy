ОНЛАЙН-ВЕРСИЯ PARADISO ITALY

Для общего доступа всем людям подготовлены:
- CLOUDFLARE_DEPLOY.md — пошаговая публикация;
- schema.sql — структура облачной базы;
- seed.sql — начальные товары/настройки/пароль;
- functions/ — облачный API;
- wrangler.toml — настройки Cloudflare;
- текущие index.html/style.css/script.js/admin.html/admin.css/admin.js.

Схема:
сайт -> Cloudflare Pages -> Pages Functions -> D1 (товары/заказы/настройки) + R2 (фото).

Дефолтный пароль админки: admin123.
Сразу после первого входа измени его в админке.
