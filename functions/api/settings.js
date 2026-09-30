import { json } from '../_utils.js';

const DEFAULTS = {
  shopName: 'PARADISO',
  tagline: 'Made & ITALY',
  phone: '+380639472122',
  phoneName: 'Елена',
  telegram: 'https://t.me/paradiso1315italy',
  viber: 'https://invite.viber.com/?g2=AQAaFlZKJwain0jOo%2B6nfN8kelZZqSA0ycoe%2BQpfwQRMB5tmuHSVQerrd1BGEIQ4&utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAb21jcAUpu7lleHRuA2FlbQIxMQBwZG9mAnNydGMGYXBwX2lkDzU2NzA2NzM0MzM1MjQyNwABp_L_ZPb5Q8zkA1nYILeeQh4yWsitw63aXsKdTNwzI2bA1N_zrfPEmXDSsMKN_aem_bqlVKhhtgvYl_oqlfEfmKw&lang=uk',
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
    } else {
      settings[x.key] = x.value;
    }
  }
  return json(settings);
}
