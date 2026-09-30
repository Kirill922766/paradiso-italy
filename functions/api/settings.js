import { json } from '../_utils.js';

const DEFAULTS = {
  shopName: 'PARADISO',
  tagline: 'Made & ITALY',
  phone: '+380639472122',
  phoneName: 'Елена',
  telegram: 'https://t.me/paradiso1315italy',
  viber: 'https://invite.viber.com/?g2=AQAaFlZKJwain0jOo%2B6nfN8kelZZqSA0ycoe%2BQpfwQRMB5tmuHSVQerrd1BGEIQ4&lang=uk',
  phone2: '+380631030364',
  phone2Name: 'Светлана',
  address: '7 км, Розовая 1315–1316',
  deliveryNote: 'Доставка Новой Почтой по Украине.',
  pickupNote: 'Самовывоз: 7 км, Розовая 1315–1316.',
  categories: ['Костюмы','Платья','Джинсы','Блузки','Брюки','Куртки','Юбки','Футболки','Свитера','Аксессуары']
};

export async function onRequestGet(context) {
  const { results } = await context.env.DB.prepare('SELECT key, value FROM settings').all();
  const settings = { ...DEFAULTS };
  for (const x of results) {
    if (x.key === 'categories') {
      try { settings.categories = JSON.parse(x.value || '[]'); } catch { settings.categories = DEFAULTS.categories; }
    } else if (typeof x.value === 'string' && x.value.trim() !== '') {
      // Empty values in an older database must not hide the working defaults.
      settings[x.key] = x.value.trim();
    }
  }
  return json(settings);
}
