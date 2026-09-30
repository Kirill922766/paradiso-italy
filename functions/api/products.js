import { json } from '../_utils.js';

function normalizeSizes(value) {
  const sizes = Array.isArray(value) ? value.map(String).filter(Boolean) : [];
  return sizes.length && sizes.every(s => /^\d+$/.test(s)) ? ['M','L','XL'] : sizes;
}

export async function onRequestGet(context) {
  const { results } = await context.env.DB.prepare(
    'SELECT id, article, name, category, price, sizes_json, description, image, active FROM products ORDER BY id'
  ).all();
  const products = results.map(p => ({
    ...p,
    sizes: normalizeSizes(JSON.parse(p.sizes_json || '[]')),
    active: !!p.active,
    price: Number(p.price || 0)
  }));
  return json(products);
}
