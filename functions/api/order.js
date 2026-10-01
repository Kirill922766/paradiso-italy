import { json } from '../_utils.js';

const nameRe = /^[A-Za-zА-Яа-яЁёІіЇїЄєҐґ'’\-]{2,}(?:\s+[A-Za-zА-Яа-яЁёІіЇїЄєҐґ'’\-]{2,})+$/;
const phoneRe = /^\+380\d{9}$/;
const META = '__PARADISO_META__';

async function notifyTelegram(env, text) {
  const token = String(env.TELEGRAM_BOT_TOKEN || '').trim();
  let chatId = String(env.TELEGRAM_CHAT_ID || '').trim();
  if (!chatId && env.DB) {
    try { chatId = String((await env.DB.prepare("SELECT value FROM settings WHERE key='telegramChatId'").first())?.value || '').trim(); } catch {}
  }
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST', headers: {'content-type':'application/json'},
      body: JSON.stringify({chat_id: chatId, text, disable_web_page_preview: true})
    });
  } catch (e) { console.error('Telegram notification failed', e); }
}

export async function onRequestPost(context) {
  let data;
  try { data = await context.request.json(); } catch { return json({ error: 'Неверные данные' }, 400); }
  const name = String(data?.name || '').trim().replace(/\s+/g,' ');
  const phone = String(data?.phone || '').trim().replace(/[\s()\-]/g,'');
  const delivery = String(data?.delivery || '');
  const payment = String(data?.payment || '');
  if (!name || !nameRe.test(name)) return json({ error: 'Введите имя и фамилию получателя' }, 400);
  if (!phoneRe.test(phone)) return json({ error: 'Введите номер в формате +380XXXXXXXXX' }, 400);
  if (!delivery || !payment || !Array.isArray(data?.items) || !data.items.length) return json({ error: 'Заполните обязательные поля' }, 400);
  if (delivery === 'Новая Почта' && payment !== 'Перевод на карту') return json({ error: 'Для Новой Почты доступна только полная оплата на карту' }, 400);
  if (delivery === 'Самовывоз' && !['Перевод на карту','Оплата при получении'].includes(payment)) return json({ error: 'Выберите способ оплаты' }, 400);
  if (delivery === 'Новая Почта' && (!String(data.city||'').trim() || !String(data.branch||'').trim())) return json({ error: 'Выберите город и отделение Новой Почты' }, 400);
  if (payment === 'Перевод на карту' && !String(data.receipt || '').startsWith('data:image/')) return json({ error: 'Для оплаты на карту загрузите фото квитанции' }, 400);
  if (String(data.receipt||'').length > 500000) return json({ error: 'Квитанция слишком большая' }, 400);

  const id = crypto.randomUUID().replaceAll('-', '').slice(0, 10);
  const now = new Date();
  const date = now.toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv' });
  try { await context.env.DB.prepare("ALTER TABLE order_items ADD COLUMN color TEXT NOT NULL DEFAULT ''").run(); } catch {}

  const meta = {
    text: String(data.comment || ''),
    paymentStatus: payment === 'Перевод на карту' ? 'receipt_uploaded' : 'not_required',
    receipt: String(data.receipt || ''),
    orderStatus: 'new',
    ttn: ''
  };
  const comment = META + JSON.stringify(meta);
  await context.env.DB.prepare(
    'INSERT INTO orders (id, created_at, date, name, phone, delivery, city, branch, payment, comment) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10)'
  ).bind(id, Date.now(), date, name, phone, delivery, String(data.city || ''), String(data.branch || ''), payment, comment).run();

  const statements = data.items.map(x => context.env.DB.prepare(
    'INSERT INTO order_items (order_id, product_id, article, name, size, price, qty, image, color) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9)'
  ).bind(id, Number(x.id) || 0, String(x.article || ''), String(x.name || ''), String(x.size || ''), Number(x.price || 0), Number(x.qty || 1), String(x.image || ''), String(x.color || '')));
  if (statements.length) await context.env.DB.batch(statements);

  const total = data.items.reduce((sum, x) => sum + (Number(x.price)||0) * (Number(x.qty)||1), 0);
  const itemsText = data.items.map(x => `• ${String(x.name||'Товар')} — ${String(x.size||'—')}${x.color ? ' — '+String(x.color) : ''} × ${Number(x.qty||1)}`).join('\n');
  const totalText = total ? `${total.toLocaleString('uk-UA')} грн` : 'цена уточняется';
  const destination = delivery === 'Новая Почта' ? `${String(data.city||'')}, ${String(data.branch||'')}` : 'Самовывоз: 7 км, Розовая 1315–1316';
  await notifyTelegram(context.env,
    `🛍 НОВЫЙ ЗАКАЗ #${id}\n\n` +
    `👤 ${name}\n📱 ${phone}\n📦 ${destination}\n💳 ${payment}\n\n` +
    `${itemsText}\n\n💰 Сумма: ${totalText}\n🧾 Квитанция: ${data.receipt ? 'загружена' : 'нет'}`
  );
  return json({ ok: true, id });
}
