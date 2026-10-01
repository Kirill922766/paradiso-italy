import { json, requireAuth, authError } from '../_utils.js';
const META='__PARADISO_META__';
export async function onRequestGet(context) {
  if (!(await requireAuth(context))) return authError();
  try { await context.env.DB.prepare("ALTER TABLE order_items ADD COLUMN color TEXT NOT NULL DEFAULT ''").run(); } catch {}
  const { results } = await context.env.DB.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  const orders = [];
  for (const o of results) {
    let comment=o.comment||'', paymentStatus='not_required', receipt='', orderStatus='new', ttn='';
    if (comment.startsWith(META)) {
      try {
        const m=JSON.parse(comment.slice(META.length));
        comment=String(m.text||''); paymentStatus=String(m.paymentStatus||'not_required'); receipt=String(m.receipt||'');
        orderStatus=String(m.orderStatus||'new'); ttn=String(m.ttn||'');
      } catch {}
    }
    const items = await context.env.DB.prepare('SELECT product_id as id, article, name, size, price, qty, image, color FROM order_items WHERE order_id = ?1 ORDER BY rowid').bind(o.id).all();
    orders.push({ ...o, comment, paymentStatus, receipt, orderStatus, ttn, items: items.results || [] });
  }
  return json(orders);
}
