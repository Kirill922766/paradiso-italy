import { json } from '../_utils.js';

async function ensureColumns(db) {
  const alters = [
    "ALTER TABLE products ADD COLUMN colors_json TEXT NOT NULL DEFAULT '[]'",
    "ALTER TABLE products ADD COLUMN images_json TEXT NOT NULL DEFAULT '[]'",
    "ALTER TABLE products ADD COLUMN size_stock_json TEXT NOT NULL DEFAULT '{}'",
    "ALTER TABLE products ADD COLUMN old_price REAL NOT NULL DEFAULT 0",
    "ALTER TABLE products ADD COLUMN is_new INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE products ADD COLUMN is_hit INTEGER NOT NULL DEFAULT 0"
  ];
  for (const sql of alters) { try { await db.prepare(sql).run(); } catch {} }
}
function parse(s, fallback){try{return JSON.parse(s||'') ?? fallback}catch{return fallback}}
function normalizeSizes(value) { return Array.isArray(value) ? value.map(String).filter(Boolean) : []; }
function normalizeImage(value) {
  const v = String(value || '').trim();
  if (!v) return '';
  if (/^(data:|https?:|blob:|\/)/i.test(v)) return v;
  return '/' + v.replace(/^\/+/, '');
}
function fallbackImage(p) {
  const article = String(p.article || '').trim();
  const map = { '1083640':'/images/product-1.png', '1084438':'/images/product-2.png', '1079433':'/images/product-3.png' };
  return map[article] || '';
}
export async function onRequestGet(context) {
  await ensureColumns(context.env.DB);
  const { results } = await context.env.DB.prepare(
    'SELECT id, article, name, category, price, old_price, is_new, is_hit, sizes_json, description, image, active, colors_json, images_json, size_stock_json FROM products ORDER BY id'
  ).all();
  const products = results.map(p => {
    const sizes=normalizeSizes(parse(p.sizes_json,[]));
    const rawImages=Array.isArray(parse(p.images_json,[]))?parse(p.images_json,[]):[];
    const fallback=fallbackImage(p);
    const images=rawImages.map(normalizeImage).filter(Boolean);
    const image=images[0]||normalizeImage(p.image)||fallback;
    const sizeStock=Object.keys(parse(p.size_stock_json,{})).length?parse(p.size_stock_json,{}):Object.fromEntries(sizes.map(s=>[s,true]));
    const colors=Array.isArray(parse(p.colors_json,[]))?parse(p.colors_json,[]):[];
    return {...p,sizes,sizeStock,colors,images:image?[...new Set([image,...images])]:images,image,active:!!p.active,price:Number(p.price||0),oldPrice:Number(p.old_price||0),isNew:!!p.is_new,isHit:!!p.is_hit};
  });
  return json(products);
}
