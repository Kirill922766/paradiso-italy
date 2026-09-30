import { json, requireAuth, authError } from '../../_utils.js';
const META='__PARADISO_META__';

async function notifyTelegram(env, text) {
  const token=String(env.TELEGRAM_BOT_TOKEN||'').trim();
  let chatId=String(env.TELEGRAM_CHAT_ID||'').trim();
  if(!chatId && env.DB){try{chatId=String((await env.DB.prepare("SELECT value FROM settings WHERE key='telegramChatId'").first())?.value||'').trim()}catch{}}
  if(!token||!chatId)return;
  try{await fetch(`https://api.telegram.org/bot${token}/sendMessage`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({chat_id:chatId,text,disable_web_page_preview:true})})}catch(e){console.error('Telegram notification failed',e)}
}
export async function onRequestPost(context){
  if(!(await requireAuth(context))) return authError();
  let data; try{data=await context.request.json()}catch{return json({error:'Неверные данные'},400)}
  const id=String(data?.id||''), status=String(data?.status||'');
  if(!id || !['receipt_uploaded','paid','rejected'].includes(status)) return json({error:'Неверный статус'},400);
  const row=await context.env.DB.prepare('SELECT comment FROM orders WHERE id=?1').bind(id).first();
  if(!row) return json({error:'Заказ не найден'},404);
  let meta={text:'',paymentStatus:status,receipt:''};
  const raw=String(row.comment||'');
  if(raw.startsWith(META)){try{meta={...meta,...JSON.parse(raw.slice(META.length))}}catch{}}
  meta.paymentStatus=status;
  if(status==='paid' && ['new','confirmed'].includes(String(meta.orderStatus||'new'))) meta.orderStatus='paid';
  await context.env.DB.prepare('UPDATE orders SET comment=?1 WHERE id=?2').bind(META+JSON.stringify(meta),id).run();
  if(status==='paid') await notifyTelegram(context.env, `💳 ОПЛАТА ПОДТВЕРЖДЕНА\nЗаказ #${id}\nСтатус: оплачено`);
  return json({ok:true});
}
