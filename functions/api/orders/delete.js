import { json, requireAuth, authError } from '../../../_utils.js';

export async function onRequestPost(context) {
  if (!(await requireAuth(context))) return authError();
  let data;
  try { data = await context.request.json(); } catch { return json({ error: 'Неверные данные' }, 400); }
  const id = String(data?.id || '');
  if (!id) return json({ error: 'Нет номера заказа' }, 400);
  await context.env.DB.batch([
    context.env.DB.prepare('DELETE FROM order_items WHERE order_id = ?1').bind(id),
    context.env.DB.prepare('DELETE FROM orders WHERE id = ?1').bind(id)
  ]);
  return json({ ok: true });
}
