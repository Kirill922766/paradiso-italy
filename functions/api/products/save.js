import { json, requireAuth, authError } from '../../_utils.js';

async function ensureColumns(db) {
  const alters = [
    "ALTER TABLE products ADD COLUMN colors_json TEXT NOT NULL DEFAULT '[]'",
    "ALTER TABLE products ADD COLUMN images_json TEXT NOT NULL DEFAULT '[]'",
    "ALTER TABLE products ADD COLUMN size_stock_json TEXT NOT NULL DEFAULT '{}'",
    "ALTER TABLE products ADD COLUMN old_price REAL NOT NULL DEFAULT 0",
    "ALTER TABLE products ADD COLUMN is_new INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE products ADD COLUMN is_hit INTEGER NOT NULL DEFAULT 0"
  ];
  for (const sql of alters) { try { await db.prepare(sql).run(); } catch {} }
}
function normalizeSizes(v){return Array.isArray(v)?v.map(String).map(s=>s.trim()).filter(Boolean):[]}
function normalizeColors(v){return Array.isArray(v)?v.map(x=>typeof x==='string'?{name:x,available:true}:{name:String(x?.name||''),available:x?.available!==false}).filter(x=>x.name):[]}
function normalizeImages(v,fallback){const a=Array.isArray(v)?v.map(x=>String(x||'').trim()).filter(Boolean):[];if(!a.length&&fallback)a.push(String(fallback));return [...new Set(a)]}
function bindProduct(db,p){
  const id=Number(p?.id);
  if(!Number.isFinite(id)) throw new Error('Некорректный ID товара');
  const sizes=normalizeSizes(p.sizes);
  const sizeStock=p.sizeStock&&typeof p.sizeStock==='object'?Object.fromEntries(sizes.map(s=>[s,p.sizeStock[s]!==false])):Object.fromEntries(sizes.map(s=>[s,true]));
  const colors=normalizeColors(p.colors);
  const images=normalizeImages(p.images,p.image);
  const image=images[0]||String(p.image||'');
  return db.prepare(`INSERT INTO products (id,article,name,category,price,sizes_json,description,image,active,colors_json,images_json,size_stock_json,old_price,is_new,is_hit)
    VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15)
    ON CONFLICT(id) DO UPDATE SET article=excluded.article,name=excluded.name,category=excluded.category,price=excluded.price,sizes_json=excluded.sizes_json,description=excluded.description,image=excluded.image,active=excluded.active,colors_json=excluded.colors_json,images_json=excluded.images_json,size_stock_json=excluded.size_stock_json,old_price=excluded.old_price,is_new=excluded.is_new,is_hit=excluded.is_hit`)
    .bind(id,String(p.article||''),String(p.name||''),String(p.category||'Одежда'),Number(p.price||0),JSON.stringify(sizes),String(p.description||''),image,p.active===false?0:1,JSON.stringify(colors),JSON.stringify(images),JSON.stringify(sizeStock),Number(p.oldPrice||0),p.isNew?1:0,p.isHit?1:0);
}

export async function onRequestPost(context){
  if(!(await requireAuth(context)))return authError();
  const db=context.env.DB; await ensureColumns(db);
  let data;try{data=await context.request.json()}catch{return json({error:'Неверные данные'},400)}

  // New API: save exactly one product. This makes it impossible for a stale
  // browser tab to overwrite the rest of the catalog.
  if(data?.product && typeof data.product==='object'){
    await bindProduct(db,data.product).run();
    return json({ok:true,saved:1});
  }

  // Backward-compatible path: update/insert the supplied products only.
  // Never DELETE the whole products table.
  const products=Array.isArray(data?.products)?data.products:[];
  const deletedIds=Array.isArray(data?.deletedIds)?data.deletedIds.map(Number).filter(Number.isFinite):[];
  const statements=[];
  for(const p of products)statements.push(bindProduct(db,p));
  for(const id of deletedIds)statements.push(db.prepare('DELETE FROM products WHERE id=?1').bind(id));
  if(statements.length)await db.batch(statements);
  return json({ok:true,saved:products.length,deleted:deletedIds.length});
}
