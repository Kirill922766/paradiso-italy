export const DEFAULT_SETTINGS = {
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
  categories: ['Костюмы','Платья','Джинсы','Блузки','Брюки','Куртки','Юбки','Футболки','Свитера','Аксессуары']
};

export const DEFAULT_PRODUCTS = [
  {
    id: 1, article: '1083640', name: 'Костюм 1083640', category: 'Костюмы', price: 0,
    sizes_json: '["42","44","46","48","50"]',
    description: 'Стильный женский костюм из мягкого трикотажа. Комплект состоит из кофты с высоким воротником и брюк. Цвет — чёрный.',
    image: 'images/product-1.png', active: 1
  },
  {
    id: 2, article: '1084438', name: 'Костюм 1084438', category: 'Костюмы', price: 0,
    sizes_json: '["42","44","46","48","50"]',
    description: 'Уютный трикотажный костюм в тёплом оттенке. Свободный крой, мягкая фактура и удобная посадка.',
    image: 'images/product-2.png', active: 1
  },
  {
    id: 3, article: '1079433', name: 'Платье 1079433', category: 'Платья', price: 0,
    sizes_json: '["42","44","46","48"]',
    description: 'Трикотажное платье с высоким воротником. В наличии несколько цветовых вариантов. Уточняйте актуальные размеры.',
    image: 'images/product-3.png', active: 1
  }
];

export async function ensureDefaults(env) {
  const { results } = await env.DB.prepare('SELECT key, value FROM settings').all();
  const existing = Object.fromEntries(results.map(x => [x.key, x.value]));
  const initialized = existing.__paradiso_defaults_initialized === '1';
  if (initialized) return;

  const statements = [];
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    if (existing[key] === undefined || existing[key] === '') {
      const stored = key === 'categories' ? JSON.stringify(value) : String(value);
      statements.push(env.DB.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?1, ?2)').bind(key, stored));
    }
  }

  const productCount = await env.DB.prepare('SELECT COUNT(*) AS count FROM products').first();
  if (Number(productCount?.count || 0) === 0) {
    for (const p of DEFAULT_PRODUCTS) {
      statements.push(env.DB.prepare(
        'INSERT OR REPLACE INTO products (id, article, name, category, price, sizes_json, description, image, active) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9)'
      ).bind(p.id, p.article, p.name, p.category, p.price, p.sizes_json, p.description, p.image, p.active));
    }
  }

  statements.push(env.DB.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?1, ?2)').bind('__paradiso_defaults_initialized', '1'));
  if (statements.length) await env.DB.batch(statements);
}

export function normalizedSettings(results) {
  const settings = { ...DEFAULT_SETTINGS };
  for (const x of results) {
    if (x.key === 'categories') {
      try { settings.categories = JSON.parse(x.value || '[]'); } catch { settings.categories = DEFAULT_SETTINGS.categories; }
    } else if (x.key !== '__paradiso_defaults_initialized') {
      settings[x.key] = x.value;
    }
  }
  for (const key of ['telegram', 'viber']) {
    const value = String(settings[key] || '').trim();
    if (value && !/^https?:\/\//i.test(value)) settings[key] = 'https://' + value;
  }
  return settings;
}
