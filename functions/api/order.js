import { json } from '../_utils.js';

export async function onRequestPost(context) {
  let data;
  try { data = await context.request.json(); } catch { return json({ error: 'Неверные данные' }, 400); }
  if (!data?.name || !data?.phone || !data?.delivery || !data?.payment || !Array.isArray(data?.items) || !data.items.length) {
    return json({ error: 'Заполните обязательные поля' }, 400);
  }
  const id = crypto.randomUUID().replaceAll('-', '').slice(0, 10);
  const now = new Date();
  const date = now.toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv' });
  await context.env.DB.prepare(
    'INSERT INTO orders (id, created_at, date, name, phone, delivery, city, branch, payment, comment) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10)'
  ).bind(id, Date.now(), date, String(data.name), String(data.phone), String(data.delivery), String(data.city || ''), String(data.branch || ''), String(data.payment), String(data.comment || '')).run();

  const statements = data.items.map(x => context.env.DB.prepare(
    'INSERT INTO order_items (order_id, product_id, article, name, size, price, qty, image) VALUES (?1,?2,?3,?4,?5,?6,?7,?8)'
  ).bind(id, Number(x.id) || 0, String(x.article || ''), String(x.name || ''), String(x.size || ''), Number(x.price || 0), Number(x.qty || 1), String(x.image || '')));
  if (statements.length) await context.env.DB.batch(statements);
  return json({ ok: true, id });
}
