import { json, requireAuth, authError, safeFilename } from '../_utils.js';

export async function onRequestPost(context) {
  if (!(await requireAuth(context))) return authError();
  const form = await context.request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return json({ error: 'Файл не найден' }, 400);
  if (!file.type.startsWith('image/')) return json({ error: 'Можно загружать только изображения' }, 400);
  if (file.size > 8 * 1024 * 1024) return json({ error: 'Фото должно быть не больше 8 МБ' }, 400);
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const allowed = new Set(['jpg','jpeg','png','webp','gif']);
  const finalExt = allowed.has(ext) ? ext : 'jpg';
  const key = `products/${crypto.randomUUID()}-${safeFilename(file.name).replace(/\.[^.]+$/, '')}.${finalExt}`;
  await context.env.IMAGES.put(key, file.stream(), {
    httpMetadata: { contentType: file.type || 'image/jpeg', cacheControl: 'public, max-age=31536000, immutable' }
  });
  return json({ ok: true, image: `/api/image?key=${encodeURIComponent(key)}` });
}
