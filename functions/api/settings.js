import { json } from '../_utils.js';

export async function onRequestGet(context) {
  const { results } = await context.env.DB.prepare('SELECT key, value FROM settings').all();
  const settings = Object.fromEntries(results.map(x => [x.key, x.value]));
  return json(settings);
}
