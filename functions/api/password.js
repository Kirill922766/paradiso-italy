import { json, requireAuth, authError, sha256 } from '../_utils.js';

export async function onRequestPost(context) {
  if (!(await requireAuth(context))) return authError();
  let data;
  try { data = await context.request.json(); } catch { return json({ error: 'Неверные данные' }, 400); }
  const password = String(data?.password || '');
  if (password.length < 4) return json({ error: 'Минимум 4 символа' }, 400);
  await context.env.DB.prepare('UPDATE admin SET password_hash = ?1 WHERE id = 1').bind(await sha256(password)).run();
  return json({ ok: true });
}
