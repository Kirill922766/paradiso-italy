import { json, requireAuth, authError } from '../../_utils.js';

const DEFAULT_CATEGORIES = [
  'Костюмы','Платья','Джинсы','Блузки','Брюки',
  'Куртки','Юбки','Футболки','Свитера','Аксессуары'
];

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
  pickupNote: 'Самовывоз: 7 км, Розовая 1315–1316. Приходите в магазин и заберите свой заказ после подтверждения менеджером.',
  cardNumber: '',
  cardName: '',
  cardBank: '',
  novaposhtaApiKey: '',
  categories: DEFAULT_CATEGORIES
};

export async function onRequestGet(context) {
  if (!(await requireAuth(context))) return authError();

  const { results } = await context.env.DB.prepare('SELECT key,value FROM settings').all();
  const out = { ...DEFAULTS };

  for (const x of results) {
    if (x.key === 'categories') {
      try {
        const parsed = JSON.parse(x.value || '[]');
        out.categories = Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_CATEGORIES;
      } catch {
        out.categories = DEFAULT_CATEGORIES;
      }
    } else if (x.value !== null && x.value !== undefined && String(x.value).trim() !== '') {
      out[x.key] = x.value;
    }
  }

  if (!String(out.telegram || '').trim()) out.telegram = DEFAULTS.telegram;
  if (!String(out.viber || '').trim()) out.viber = DEFAULTS.viber;
  if (!/^https?:\/\//i.test(String(out.telegram))) out.telegram = 'https://' + String(out.telegram);
  if (!/^https?:\/\//i.test(String(out.viber))) out.viber = 'https://' + String(out.viber);

  return json(out);
}
