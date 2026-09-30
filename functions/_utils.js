export const json = (data, status = 200, extraHeaders = {}) => new Response(JSON.stringify(data), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', ...extraHeaders }
});

export function cookie(request, name) {
  const raw = request.headers.get('Cookie') || '';
  const item = raw.split(';').map(x => x.trim()).find(x => x.startsWith(name + '='));
  return item ? decodeURIComponent(item.slice(name.length + 1)) : '';
}

export async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function requireAuth(context) {
  const sid = cookie(context.request, 'paradiso_sid');
  if (!sid) return false;
  const row = await context.env.DB.prepare(
    'SELECT sid FROM sessions WHERE sid = ?1 AND expires_at > ?2'
  ).bind(sid, Date.now()).first();
  return !!row;
}

export function authError() {
  return json({ error: 'Нужен вход в админку' }, 401);
}

export function safeFilename(name = 'photo.jpg') {
  const cleaned = String(name).replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
  return cleaned || 'photo.jpg';
}
