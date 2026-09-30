import { json, requireAuth, authError } from '../../../_utils.js';

export async function onRequestPost(context) {
  if (!(await requireAuth(context))) return authError();
  let data;
  try { data = await context.request.json(); } catch { return json({ error: 'Неверные данные' }, 400); }
  const products = Array.isArray(data?.products) ? data.products : [];
  const statements = [context.env.DB.prepare('DELETE FROM products')];
  for (const p of products) {
    statements.push(context.env.DB.prepare(
      'INSERT INTO products (id, article, name, category, price, sizes_json, description, image, active) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9)'
    ).bind(
      Number(p.id), String(p.article || ''), String(p.name || ''), String(p.category || 'Одежда'),
      Number(p.price || 0), JSON.stringify(Array.isArray(p.sizes) ? p.sizes : []), String(p.description || ''),
      String(p.image || ''), p.active === false ? 0 : 1
    ));
  }
  await context.env.DB.batch(statements);
  return json({ ok: true });
}
