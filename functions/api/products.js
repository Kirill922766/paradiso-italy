import { json } from '../_utils.js';
import { ensureDefaults } from './_defaults.js';

export async function onRequestGet(context) {
  await ensureDefaults(context.env);
  const { results } = await context.env.DB.prepare(
    'SELECT id, article, name, category, price, sizes_json, description, image, active FROM products ORDER BY id'
  ).all();
  const products = results.map(p => ({
    ...p,
    sizes: JSON.parse(p.sizes_json || '[]'),
    active: !!p.active,
    price: Number(p.price || 0)
  }));
  return json(products);
}
