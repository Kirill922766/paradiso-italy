import { json, requireAuth, authError } from '../../_utils.js';

const DEFAULTS = {
  shopName:'PARADISO', tagline:'Made & ITALY',
  phone:'+380639472122', phoneName:'Елена',
  telegram:'https://t.me/paradiso1315italy',
  viber:'',
  phone2:'+380631030364', phone2Name:'Светлана',
  phone3:'+380972577772', phone3Name:'Татьяна',
  phone4:'+380931980977', phone4Name:'Ольга',
  telegramChatId:'',
  address:'7 км, Розовая 1315–1316',
  deliveryNote:'Доставка Новой Почтой по Украине.',
  pickupNote:'Самовывоз: 7 км, Розовая 1315–1316. Приходите в магазин и заберите свой заказ после подтверждения менеджером.',
  cardNumber:'', cardName:'', cardBank:'', novaposhtaApiKey:'',
  categories:['Костюмы','Платья','Джинсы','Блузки','Брюки','Куртки','Юбки','Футболки','Свитера','Аксессуары']
};

export async function onRequestGet(context){
  if(!(await requireAuth(context))) return authError();
  const {results}=await context.env.DB.prepare('SELECT key,value FROM settings').all();
  const out={...DEFAULTS};
  for(const x of results){
    if(x.key==='categories'){try{out.categories=JSON.parse(x.value||'[]')}catch{}}
    else out[x.key]=x.value;
  }
  return json(out);
}
