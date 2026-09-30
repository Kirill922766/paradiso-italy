import { json, requireAuth, authError } from '../../../_utils.js';

export async function onRequestPost(context) {
  if (!(await requireAuth(context))) return authError();
  let data;
  try { data = await context.request.json(); } catch { return json({ error: 'Неверные данные' }, 400); }
  const statements = [context.env.DB.prepare('DELETE FROM settings')];
  for (const [key, value] of Object.entries(data || {})) {
    statements.push(context.env.DB.prepare('INSERT INTO settings (key, value) VALUES (?1, ?2)').bind(String(key), String(value ?? '')));
  }
  await context.env.DB.batch(statements);
  return json({ ok: true });
}
