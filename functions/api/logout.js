import { json, cookie } from '../_utils.js';

export async function onRequestPost(context) {
  const sid = cookie(context.request, 'paradiso_sid');
  if (sid) await context.env.DB.prepare('DELETE FROM sessions WHERE sid = ?1').bind(sid).run();
  return json({ ok: true }, 200, { 'Set-Cookie': 'paradiso_sid=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0' });
}
