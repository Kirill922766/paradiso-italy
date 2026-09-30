import { json, requireAuth, authError } from '../../_utils.js';
import { ensureDefaults, normalizedSettings } from '../_defaults.js';

export async function onRequestGet(context) {
  if (!(await requireAuth(context))) return authError();
  await ensureDefaults(context.env);
  const { results } = await context.env.DB.prepare('SELECT key, value FROM settings').all();
  return json(normalizedSettings(results));
}
