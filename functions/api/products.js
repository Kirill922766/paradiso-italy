import { json } from '../_utils.js';

async function ensureColumns(db) {
  const alters = [
    "ALTER TABLE products ADD COLUMN colors_json TEXT NOT NULL DEFAULT '[]'",
    "ALTER TABLE products ADD COLUMN images_json TEXT NOT NULL DEFAULT '[]'",
    "ALTER TABLE products ADD COLUMN size_stock_json TEXT NOT NULL DEFAULT '{}'"
  ];
  for (const sql of alters) { try { await db.prepare(sql).run(); } catch {} }
}
function parse(s, fallback){try{return JSON.parse(s||'') ?? fallback}catch{return fallback}}
function normalizeSizes(value) { return Array.isArray(value) ? value.map(String).filter(Boolean) : []; }
export async function onRequestGet(context) {
  await ensureColumns(context.env.DB);
  const { results } = await context.env.DB.prepare(
    'SELECT id, article, name, category, price, sizes_json, description, image, active, colors_json, images_json, size_stock_json FROM products ORDER BY id'
  ).all();
  const products = results.map(p => {
    const sizes=normalizeSizes(parse(p.sizes_json,[]));
    const images=Array.isArray(parse(p.images_json,[]))?parse(p.images_json,[]):[];
    const image=images[0]||p.image||'';
    const sizeStock=Object.keys(parse(p.size_stock_json,{})).length?parse(p.size_stock_json,{}):Object.fromEntries(sizes.map(s=>[s,true]));
    const colors=Array.isArray(parse(p.colors_json,[]))?parse(p.colors_json,[]):[];
    return {...p,sizes,sizeStock,colors,images:image?[...new Set([image,...images])]:images,image,active:!!p.active,price:Number(p.price||0)};
  });
  return json(products);
}
