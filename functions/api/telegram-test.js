import { json, requireAuth, authError } from '../_utils.js';

export async function onRequestPost(context) {
  if (!(await requireAuth(context))) return authError();
  const token = String(context.env.TELEGRAM_BOT_TOKEN || '').trim();
  let chatId = String(context.env.TELEGRAM_CHAT_ID || '').trim();
  if (!chatId && context.env.DB) {
    try { chatId = String((await context.env.DB.prepare("SELECT value FROM settings WHERE key='telegramChatId'").first())?.value || '').trim(); } catch {}
  }
  if (!token) return json({ error: 'Не задан TELEGRAM_BOT_TOKEN в Cloudflare Secrets' }, 400);
  if (!chatId) return json({ error: 'Сначала укажите Telegram Chat ID в настройках' }, 400);
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {'content-type':'application/json'},
      body: JSON.stringify({ chat_id: chatId, text: '✅ PARADISO: тестовое Telegram-уведомление работает.' })
    });
    const d = await r.json();
    if (!r.ok || !d.ok) return json({ error: d.description || 'Telegram отклонил сообщение' }, 400);
    return json({ ok: true });
  } catch (e) {
    return json({ error: 'Не удалось связаться с Telegram' }, 502);
  }
}
