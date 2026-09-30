import { json } from '../_utils.js';

const commonCities = ['Одесса','Киев','Львов','Днепр','Харьков','Запорожье','Винница','Полтава','Черкассы','Чернигов','Житомир','Ивано-Франковск','Тернополь','Хмельницкий','Ровно','Луцк','Ужгород','Николаев','Херсон','Кропивницкий','Сумы','Кременчуг','Белая Церковь'];

async function setting(env, key) {
  const row = await env.DB.prepare('SELECT value FROM settings WHERE key = ?1').bind(key).first();
  return String(row?.value || '');
}

async function np(env, body) {
  const key = await setting(env, 'novaposhtaApiKey');
  if (!key) return { success: false, needKey: true, data: [] };
  const r = await fetch('https://api.novaposhta.ua/v2.0/json/', {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ apiKey: key, ...body })
  });
  const d = await r.json();
  return d;
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const mode = url.searchParams.get('mode') || 'cities';
  const q = (url.searchParams.get('q') || '').trim();
  if (!q && mode === 'cities') return json({ ok:true, needKey:false, cities: commonCities.map(x=>({name:x})) });
  if (!q) return json({ ok:true, needKey:false, branches:[] });

  if (mode === 'cities') {
    const d = await np(context.env, {
      modelName: 'Address', calledMethod: 'getCities', methodProperties: { FindByString: q, Limit: 20 }
    });
    if (d.needKey) return json({ ok:false, needKey:true, cities: commonCities.filter(x=>x.toLowerCase().includes(q.toLowerCase())).map(x=>({name:x})) });
    return json({ ok:true, cities:(d.data||[]).map(x=>({name:x.Description, ref:x.Ref, area:x.AreaDescription})) });
  }

  if (mode === 'branches') {
    const cities = await np(context.env, {
      modelName: 'Address', calledMethod: 'getCities', methodProperties: { FindByString: q, Limit: 20 }
    });
    if (cities.needKey) return json({ ok:false, needKey:true, branches:[] });
    const exact = (cities.data||[]).find(x=>String(x.Description||'').toLowerCase()===q.toLowerCase()) || (cities.data||[])[0];
    if (!exact?.Ref) return json({ ok:true, branches:[] });
    const d = await np(context.env, {
      modelName: 'AddressGeneral', calledMethod: 'getWarehouses', methodProperties: { CityRef: exact.Ref, Limit: 100 }
    });
    return json({ ok:true, branches:(d.data||[]).map(x=>({name:x.Description, ref:x.Ref})) });
  }
  return json({ error:'Неизвестный режим' },400);
}
