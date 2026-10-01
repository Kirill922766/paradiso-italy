import { json, requireAuth, authError } from '../_utils.js';
const META='__PARADISO_META__';
const ALLOWED=['new','paid','completed'];
export async function onRequestPost(context){
  if(!(await requireAuth(context))) return authError();
  let data; try{data=await context.request.json()}catch{return json({error:'Неверные данные'},400)}
  const id=String(data?.id||''); const status=String(data?.status||''); const ttn=String(data?.ttn||'').trim();
  if(!id || !ALLOWED.includes(status)) return json({error:'Неверный статус'},400);
  const row=await context.env.DB.prepare('SELECT comment FROM orders WHERE id=?1').bind(id).first();
  if(!row) return json({error:'Заказ не найден'},404);
  let meta={text:'',paymentStatus:'not_required',receipt:'',orderStatus:'new',ttn:''};
  const raw=String(row.comment||'');
  if(raw.startsWith(META)){try{meta={...meta,...JSON.parse(raw.slice(META.length))}}catch{}}
  meta.orderStatus=status;
  if(data?.ttn!==undefined) meta.ttn=ttn;
  await context.env.DB.prepare('UPDATE orders SET comment=?1 WHERE id=?2').bind(META+JSON.stringify(meta),id).run();
  return json({ok:true,status:meta.orderStatus,ttn:meta.ttn});
}
