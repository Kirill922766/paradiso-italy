import { onRequestGet as productsGet } from './functions/api/products.js';
import { onRequestGet as novaPoshtaGet } from './functions/api/novaposhta.js';
import { onRequestGet as settingsGet } from './functions/api/settings.js';
import { onRequestGet as settingsAdminGet } from './functions/api/settings/admin.js';
import { onRequestGet as ordersGet } from './functions/api/orders.js';
import { onRequestGet as meGet } from './functions/api/me.js';
import { onRequestPost as loginPost } from './functions/api/login.js';
import { onRequestPost as logoutPost } from './functions/api/logout.js';
import { onRequestPost as orderPost } from './functions/api/order.js';
import { onRequestPost as productsSavePost } from './functions/api/products/save.js';
import { onRequestPost as ordersDeletePost } from './functions/api/orders/delete.js';
import { onRequestPost as passwordPost } from './functions/api/password.js';
import { onRequestPost as settingsSavePost } from './functions/api/settings/save.js';
import { onRequestPost as orderStatusPost } from './functions/api/order-status.js';
import { onRequestPost as paymentPost } from './functions/api/orders/payment.js';
import { onRequestPost as telegramTestPost } from './functions/api/telegram-test.js';
import { json } from './functions/_utils.js';

function context(request, env) {
  return { request, env, url: new URL(request.url) };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // SEO files are served directly by the Worker so Cloudflare Assets
    // cannot inject or cache unexpected content into sitemap.xml.
    if (request.method === 'GET' && url.pathname === '/sitemap.xml') {
      const origin = url.origin;
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${origin}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
      return new Response(xml, {
        status: 200,
        headers: {
          'content-type': 'application/xml; charset=UTF-8',
          'cache-control': 'no-store, no-cache, must-revalidate'
        }
      });
    }

    if (request.method === 'GET' && url.pathname === '/robots.txt') {
      const robots = `User-agent: *
Allow: /
Disallow: /admin.html
Disallow: /api/

Sitemap: ${url.origin}/sitemap.xml
`;
      return new Response(robots, {
        status: 200,
        headers: {
          'content-type': 'text/plain; charset=UTF-8',
          'cache-control': 'no-store, no-cache, must-revalidate'
        }
      });
    }

    if (!url.pathname.startsWith('/api/')) {
      return env.ASSETS.fetch(request);
    }

    const ctx = context(request, env);
    const key = `${request.method} ${url.pathname}`;

    try {
      switch (key) {
        case 'GET /api/products': return productsGet(ctx);
        case 'GET /api/novaposhta': return novaPoshtaGet(ctx);
        case 'GET /api/settings': return settingsGet(ctx);
        case 'GET /api/settings/admin': return settingsAdminGet(ctx);
        case 'GET /api/orders': return ordersGet(ctx);
        case 'GET /api/me': return meGet(ctx);
        case 'POST /api/login': return loginPost(ctx);
        case 'POST /api/logout': return logoutPost(ctx);
        case 'POST /api/order': return orderPost(ctx);
        case 'POST /api/products/save': return productsSavePost(ctx);
        case 'POST /api/orders/delete': return ordersDeletePost(ctx);
        case 'POST /api/password': return passwordPost(ctx);
        case 'POST /api/settings/save': return settingsSavePost(ctx);
        case 'POST /api/orders/status': return orderStatusPost(ctx);
        case 'POST /api/orders/payment': return paymentPost(ctx);
        case 'POST /api/telegram/test': return telegramTestPost(ctx);
        default: return json({ error: 'API route not found' }, 404);
      }
    } catch (error) {
      console.error(error);
      return json({ error: 'Внутренняя ошибка сервера' }, 500);
    }
  }
};
