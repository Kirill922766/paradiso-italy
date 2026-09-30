import { json } from '../_utils.js';
import { ensureDefaults, normalizedSettings } from './_defaults.js';

export async function onRequestGet(context) {
  await ensureDefaults(context.env);
  const { results } = await context.env.DB.prepare('SELECT key, value FROM settings').all();
  const settings = normalizedSettings(results);
  delete settings.novaposhtaApiKey;
  return json(settings);
}
