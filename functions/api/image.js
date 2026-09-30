import { json } from '../_utils.js';

export async function onRequestGet(context) {
  const key = context.url.searchParams.get('key');
  if (!key || !key.startsWith('products/')) return json({ error: 'Фото не найдено' }, 404);
  const object = await context.env.IMAGES.get(key);
  if (!object) return json({ error: 'Фото не найдено' }, 404);
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  return new Response(object.body, { headers });
}
