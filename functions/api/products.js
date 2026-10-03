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

function parse(s, fallback) { try { return JSON.parse(s || '') ?? fallback; } catch { return fallback; } }
function normalizeSizes(value) { return Array.isArray(value) ? value.map(String).map(s => s.trim()).filter(Boolean) : []; }
function normalizeImage(value) {
  const v = String(value || '').trim();
  if (!v) return '';
  if (/^(data:|https?:|blob:|\/)/i.test(v)) return v;
  return '/' + v.replace(/^\/+/, '');
}
function fallbackImage(article) {
  const map = { '1083640':'/images/product-1.png', '1084438':'/images/product-2.png', '1079433':'/images/product-3.png' };
  return map[String(article || '').trim()] || '';
}

const DEFAULTS = [
  { article:'1083640', name:'Костюм 1083640', category:'Костюмы', description:'Стильный женский костюм из мягкого трикотажа. Комплект состоит из кофты с высоким воротником и брюк. Цвет — чёрный.', image:'/images/product-1.png', isHit:1 },
  { article:'1084438', name:'Костюм 1084438', category:'Костюмы', description:'Уютный трикотажный костюм в тёплом оттенке. Свободный крой, мягкая фактура и удобная посадка.', image:'/images/product-2.png', isHit:1 },
  { article:'1079433', name:'Платье 1079433', category:'Платья', description:'Трикотажное платье с высоким воротником. В наличии несколько цветовых вариантов. Уточняйте актуальные размеры.', image:'/images/product-3.png', isHit:1 }
];

function isEmptyPlaceholder(p) {
  const name = String(p.name || '').trim().toLowerCase();
  return (!String(p.article || '').trim() &&
    (name === '' || name === 'новый товар' || name === 'новий товар' || name === 'new product') &&
    !String(p.image || '').trim() &&
    !String(p.images_json || '').replace(/\[\s*\]/g, '').trim() &&
    !String(p.description || '').trim() && Number(p.price || 0) === 0);
}

async function repairCatalog(db) {
  const { results } = await db.prepare('SELECT id, article, name, category, price, sizes_json, description, image, active, colors_json, images_json, size_stock_json, old_price, is_new, is_hit FROM products ORDER BY id').all();
  if (!results.length) return;

  // If the catalog was accidentally replaced by blank "Новый товар" rows,
  // repair it automatically without deleting order history. Reuse the first
  // three rows and hide any additional blank placeholders.
  if (results.every(isEmptyPlaceholder)) {
    const rows = [...results].sort((a,b) => Number(a.id) - Number(b.id));
    const statements = [];
    DEFAULTS.forEach((d, i) => {
      const row = rows[i];
      if (!row) return;
      statements.push(db.prepare(`UPDATE products SET article=?1,name=?2,category=?3,price=0,sizes_json='["M","L","XL"]',description=?4,image=?5,active=1,colors_json='[]',images_json=?6,size_stock_json='{"M":true,"L":true,"XL":true}',old_price=0,is_new=0,is_hit=?7 WHERE id=?8`)
        .bind(d.article,d.name,d.category,d.description,d.image,JSON.stringify([d.image]),d.isHit,Number(row.id)));
    });
    for (let i = DEFAULTS.length; i < rows.length; i++) {
      statements.push(db.prepare('UPDATE products SET active=0 WHERE id=?1').bind(Number(rows[i].id)));
    }
    if (statements.length) await db.batch(statements);
    return;
  }

  // Repair known original products if they exist but lost their image.
  const byArticle = new Map(results.map(p => [String(p.article || '').trim(), p]));
  const statements = [];
  for (const d of DEFAULTS) {
    const row = byArticle.get(d.article);
    if (!row) continue;
    const parsedImages = parse(row.images_json, []);
    if (!String(row.image || '').trim() && (!Array.isArray(parsedImages) || !parsedImages.length)) {
      statements.push(db.prepare('UPDATE products SET image=?1,images_json=?2 WHERE id=?3').bind(d.image, JSON.stringify([d.image]), Number(row.id)));
    }
  }
  if (statements.length) await db.batch(statements);
}

export async function onRequestGet(context) {
  const db = context.env.DB;
  await ensureColumns(db);
  await repairCatalog(db);
  const { results } = await db.prepare(
    'SELECT id, article, name, category, price, old_price, is_new, is_hit, sizes_json, description, image, active, colors_json, images_json, size_stock_json FROM products ORDER BY id'
  ).all();
  const products = results.map(p => {
    const sizes = normalizeSizes(parse(p.sizes_json, []));
    const parsed = parse(p.images_json, []);
    const rawImages = Array.isArray(parsed) ? parsed : [];
    const fallback = fallbackImage(p.article);
    const images = rawImages.map(normalizeImage).filter(Boolean);
    const image = images[0] || normalizeImage(p.image) || fallback;
    const sizeStockRaw = parse(p.size_stock_json, {});
    const sizeStock = sizeStockRaw && typeof sizeStockRaw === 'object' && Object.keys(sizeStockRaw).length
      ? sizeStockRaw : Object.fromEntries(sizes.map(s => [s, true]));
    const colors = Array.isArray(parse(p.colors_json, [])) ? parse(p.colors_json, []) : [];
    return {
      ...p, sizes, sizeStock, colors,
      images: image ? [...new Set([image, ...images])] : images,
      image, active: !!p.active, price: Number(p.price || 0), oldPrice: Number(p.old_price || 0),
      isNew: !!p.is_new, isHit: !!p.is_hit
    };
  });
  return json(products);
}
