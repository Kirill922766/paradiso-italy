import { json, requireAuth, authError } from '../../_utils.js';

async function ensureColumns(db) {
  const alters = [
    "ALTER TABLE products ADD COLUMN colors_json TEXT NOT NULL DEFAULT '[]'",
    "ALTER TABLE products ADD COLUMN images_json TEXT NOT NULL DEFAULT '[]'",
    "ALTER TABLE products ADD COLUMN size_stock_json TEXT NOT NULL DEFAULT '{}'"
  ];
  for (const sql of alters) { try { await db.prepare(sql).run(); } catch {} }
}
function normalizeSizes(value) {
  return Array.isArray(value) ? value.map(String).map(s=>s.trim()).filter(Boolean) : [];
}
function normalizeColors(value) {
  return Array.isArray(value) ? value.map(x => typeof x==='string' ? {name:x,available:true} : {name:String(x?.name||''),available:x?.available!==false}).filter(x=>x.name) : [];
}
function normalizeImages(value, fallback) {
  const a = Array.isArray(value) ? value.map(String).filter(Boolean) : [];
  if (!a.length && fallback) a.push(String(fallback));
  return [...new Set(a)];
}
export async function onRequestPost(context) {
  if (!(await requireAuth(context))) return authError();
  await ensureColumns(context.env.DB);
  let data;
  try { data = await context.request.json(); } catch { return json({ error: 'Неверные данные' }, 400); }
  const products = Array.isArray(data?.products) ? data.products : [];
  const statements = [context.env.DB.prepare('DELETE FROM products')];
  for (const p of products) {
    const sizes = normalizeSizes(p.sizes);
    const sizeStock = p.sizeStock && typeof p.sizeStock==='object' ? Object.fromEntries(sizes.map(s=>[s,p.sizeStock[s]!==false])) : Object.fromEntries(sizes.map(s=>[s,true]));
    const colors = normalizeColors(p.colors);
    const images = normalizeImages(p.images, p.image);
    const image = images[0] || String(p.image || '');
    statements.push(context.env.DB.prepare(
      'INSERT INTO products (id, article, name, category, price, sizes_json, description, image, active, colors_json, images_json, size_stock_json) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12)'
    ).bind(
      Number(p.id), String(p.article || ''), String(p.name || ''), String(p.category || 'Одежда'),
      Number(p.price || 0), JSON.stringify(sizes), String(p.description || ''), image, p.active === false ? 0 : 1,
      JSON.stringify(colors), JSON.stringify(images), JSON.stringify(sizeStock)
    ));
  }
  await context.env.DB.batch(statements);
  return json({ ok: true });
}
