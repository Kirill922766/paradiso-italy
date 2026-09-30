import { json, requireAuth } from '../_utils.js';

export async function onRequestGet(context) {
  return json({ ok: await requireAuth(context) });
}
