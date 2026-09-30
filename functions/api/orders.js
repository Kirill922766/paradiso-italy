import { json, requireAuth, authError } from '../_utils.js';

export async function onRequestGet(context) {
  if (!(await requireAuth(context))) return authError();
  const { results } = await context.env.DB.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  const orders = [];
  for (const o of results) {
    const items = await context.env.DB.prepare('SELECT product_id as id, article, name, size, price, qty, image FROM order_items WHERE order_id = ?1 ORDER BY rowid').bind(o.id).all();
    orders.push({ ...o, items: items.results || [] });
  }
  return json(orders);
}
