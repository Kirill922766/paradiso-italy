import { json, requireAuth, authError } from '../../_utils.js';
export async function onRequestGet(context){
  if(!(await requireAuth(context))) return authError();
  const {results}=await context.env.DB.prepare('SELECT key,value FROM settings').all();
  const out={};
  for(const x of results){
    if(x.key==='categories'){try{out.categories=JSON.parse(x.value||'[]')}catch{out.categories=[]}}else out[x.key]=x.value;
  }
  return json(out);
}
