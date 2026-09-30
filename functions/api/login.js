import { json, sha256 } from '../_utils.js';

export async function onRequestPost(context) {
  let data;
  try { data = await context.request.json(); } catch { return json({ error: 'Неверные данные' }, 400); }
  const password = String(data?.password || '');
  if (!password) return json({ error: 'Введите пароль' }, 400);

  const admin = await context.env.DB.prepare('SELECT password_hash FROM admin WHERE id = 1').first();
  const hash = await sha256(password);
  if (!admin || hash !== admin.password_hash) return json({ error: 'Неверный пароль' }, 403);

  const sid = crypto.randomUUID().replaceAll('-', '') + crypto.randomUUID().replaceAll('-', '');
  const expires = Date.now() + 1000 * 60 * 60 * 24 * 7;
  await context.env.DB.prepare('INSERT INTO sessions (sid, expires_at) VALUES (?1, ?2)').bind(sid, expires).run();

  return json({ ok: true }, 200, {
    'Set-Cookie': `paradiso_sid=${encodeURIComponent(sid)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`
  });
}
