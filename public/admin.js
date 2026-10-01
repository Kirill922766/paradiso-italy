let products=[],settings={};
let productSearch='', productCategoryFilter='all';
const DEFAULT_SIZES=['M','L','XL'];
const $=id=>document.getElementById(id);

async function api(url,opt={}){
  const headers={...(opt.headers||{})};
  if(!(opt.body instanceof FormData)&&opt.body!==undefined)headers['Content-Type']='application/json';
  const r=await fetch(url,{...opt,headers});
  const d=await r.json();
  if(!r.ok)throw new Error(d.error||'Ошибка');
  return d;
}
async function check(){
  try{let d=await api('/api/me');if(d.ok){$('login').classList.add('hidden');$('app').classList.remove('hidden');load()}}catch(e){}
}
$('loginBtn').onclick=async()=>{
  try{await api('/api/login',{method:'POST',body:JSON.stringify({password:$('pass').value})});
  $('login').classList.add('hidden');$('app').classList.remove('hidden');load()}
  catch(e){$('loginErr').textContent=e.message}
};
$('pass').addEventListener('keydown',e=>{if(e.key==='Enter')$('loginBtn').click()});
$('logout').onclick=async()=>{await api('/api/logout',{method:'POST'});location.reload()};

document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));t.classList.add('active');
  ['products','categories','orders','settings'].forEach(x=>$(x+'Tab').classList.add('hidden'));
  $(t.dataset.tab+'Tab').classList.remove('hidden');
  if(t.dataset.tab==='orders')loadOrders();
  if(t.dataset.tab==='settings')renderSettings();
  if(t.dataset.tab==='categories')renderCategories();
});

async function load(){products=await api('/api/products');products.sort((a,b)=>Number(b.id)-Number(a.id));settings=await api('/api/settings/admin');initProductFilters();updateProductCategoryFilter();renderProducts();renderCategories()}
function categories(){return Array.isArray(settings.categories)?settings.categories:[]}
function saveAllSettings(){
  return api('/api/settings/save',{method:'POST',body:JSON.stringify(settings)});
}

function renderProducts(){
  let cats=categories(); if(!cats.length)cats=['Одежда'];
  const query=productSearch.trim().toLowerCase();
  const entries=products.map((p,i)=>({p,i})).filter(({p})=>{
    const hay=[p.name,p.article,p.category,p.description].map(x=>String(x||'').toLowerCase()).join(' ');
    return (!query || hay.includes(query)) && (productCategoryFilter==='all' || p.category===productCategoryFilter);
  });
  let el=$('productList');
  el.innerHTML=entries.map(({p,i})=>{
    const sizes=(p.sizes||[]).length?(p.sizes||[]):DEFAULT_SIZES;
    const stock=p.sizeStock||Object.fromEntries(sizes.map(x=>[x,true]));
    const colors=Array.isArray(p.colors)?p.colors:[];
    const imgs=Array.isArray(p.images)&&p.images.length?p.images:(p.image?[p.image]:[]);
    return `<div class="product-edit" data-product-index="${i}">
      <div class="admin-gallery">${imgs.map((im,j)=>`<div class="admin-photo ${j===0?'main':''}"><img src="${esc(im)}"><button type="button" class="photo-del" onclick="removeImage(${i},${j})">×</button>${j===0?'<span>Главное</span>':`<button type="button" class="photo-main" onclick="makeMainImage(${i},${j})">Сделать главным</button>`}</div>`).join('')||'<div class="photo-empty">Фото нет</div>'}</div>
      <div><div class="fields">
        <input class="wide" data-k="name" value="${esc(p.name)}" placeholder="Название">
        <input data-k="article" value="${esc(p.article)}" placeholder="Артикул">
        <select data-k="category">${cats.map(c=>`<option ${c===p.category?'selected':''}>${esc(c)}</option>`).join('')}</select>
        <input data-k="price" type="number" min="0" value="${p.price||''}" placeholder="Цена, грн">
        <textarea class="wide" data-k="description" placeholder="Описание">${esc(p.description)}</textarea>
        <div class="stock-box wide"><b>📏 Размеры и наличие</b><div class="stock-grid">${sizes.map(sz=>`<label><input type="checkbox" class="size-stock" data-size="${esc(sz)}" ${stock[sz]!==false?'checked':''}> ${esc(sz)}</label>`).join('')}</div><input class="wide size-add-input" placeholder="Добавить размер, например S или 2XL"><button type="button" class="small-btn" onclick="addSize(${i},this)">＋ Добавить размер</button></div>
        <div class="stock-box wide"><b>🎨 Цвета и наличие</b><div class="color-list">${colors.map((c,j)=>`<div class="color-row"><input class="color-name" data-color-index="${j}" value="${esc(c.name)}" placeholder="Название цвета"><label><input type="checkbox" class="color-stock" data-color-index="${j}" ${c.available!==false?'checked':''}> есть</label><button type="button" class="danger mini" onclick="removeColor(${i},${j})">×</button></div>`).join('')||'<p class="soft">Цвета ещё не добавлены.</p>'}</div><div class="color-add"><input id="newColor_${i}" placeholder="Например: чёрный"><button type="button" class="small-btn" onclick="addColor(${i})">＋ Добавить цвет</button></div></div>
        <label class="upload-label">📷 Добавить несколько фотографий<input class="photo-input" type="file" accept="image/*" multiple onchange="uploadPhotos(${i},this)"></label>
        <label class="active-check"><input data-k="active" type="checkbox" ${p.active!==false?'checked':''}> Показывать в магазине</label>
      </div><div class="actions"><button class="save" onclick="saveProduct(${i})">Сохранить</button><button class="danger" onclick="deleteProduct(${i})">Удалить</button></div></div></div>`;
  }).join('')||'<p>По вашему фильтру товары не найдены.</p>';
}

function syncProductDraft(i,box){
  const p=products[i]; if(!p||!box)return;
  box.querySelectorAll('[data-k]').forEach(x=>{const k=x.dataset.k;if(k==='price')p[k]=Number(x.value)||0;else if(k==='active')p[k]=x.checked;else p[k]=x.value});
  const sizes=[...box.querySelectorAll('.size-stock')].map(x=>x.dataset.size); if(sizes.length)p.sizes=sizes;
  p.sizeStock=Object.fromEntries([...box.querySelectorAll('.size-stock')].map(x=>[x.dataset.size,x.checked]));
  p.colors=[...box.querySelectorAll('.color-row')].map(row=>({name:row.querySelector('.color-name').value.trim(),available:row.querySelector('.color-stock').checked})).filter(x=>x.name);
}

function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
async function compressImage(file){
  if(!file.type.startsWith('image/'))throw new Error('Выберите изображение');
  const img=await new Promise((resolve,reject)=>{const x=new Image();x.onload=()=>resolve(x);x.onerror=reject;x.src=URL.createObjectURL(file)});
  const max=1100,scale=Math.min(1,max/Math.max(img.width,img.height));
  const c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.width*scale));c.height=Math.max(1,Math.round(img.height*scale));
  c.getContext('2d').drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(img.src);
  let data=c.toDataURL('image/webp',.72); if(data.length>220000)data=c.toDataURL('image/webp',.52); if(data.length>360000)throw new Error('Фото слишком большое. Выберите другое или уменьшите его.'); return data;
}
window.uploadPhotos=async(i,input)=>{
  if(!input.files?.length)return;
  const box=input.closest('.product-edit');
  syncProductDraft(i,box);
  try{const added=[];for(const f of input.files){added.push(await compressImage(f));}products[i].images=[...(products[i].images||[]),...added];products[i].image=products[i].images[0]||'';renderProducts();alert(`Загружено фото: ${added.length}. Текст, размеры, цвета и остальные поля сохранены. Нажмите «Сохранить».`)}catch(e){alert(e.message)}
};
window.removeImage=(i,j)=>{const box=document.querySelector(`.product-edit[data-product-index="${i}"]`);syncProductDraft(i,box);products[i].images=(products[i].images||[]).filter((_,x)=>x!==j);products[i].image=products[i].images[0]||'';renderProducts()};
window.makeMainImage=(i,j)=>{const box=document.querySelector(`.product-edit[data-product-index="${i}"]`);syncProductDraft(i,box);const a=[...(products[i].images||[])];if(!a[j])return;const [x]=a.splice(j,1);a.unshift(x);products[i].images=a;products[i].image=a[0]||'';renderProducts()};
window.addSize=(i,btn)=>{const box=btn.closest('.product-edit');syncProductDraft(i,box);const input=btn.previousElementSibling,v=input.value.trim();if(!v)return;products[i].sizes=[...(products[i].sizes||[]),v].filter((x,n,a)=>a.indexOf(x)===n);products[i].sizeStock=products[i].sizeStock||{};products[i].sizeStock[v]=true;input.value='';renderProducts()};
window.addColor=(i)=>{const box=document.querySelector(`.product-edit[data-product-index="${i}"]`);syncProductDraft(i,box);const input=$('newColor_'+i),v=input.value.trim();if(!v)return;products[i].colors=Array.isArray(products[i].colors)?products[i].colors:[];if(products[i].colors.some(c=>String(c.name).toLowerCase()===v.toLowerCase()))return alert('Такой цвет уже добавлен');products[i].colors.push({name:v,available:true});input.value='';renderProducts()};
window.removeColor=(i,j)=>{const box=document.querySelector(`.product-edit[data-product-index="${i}"]`);syncProductDraft(i,box);products[i].colors=(products[i].colors||[]).filter((_,x)=>x!==j);renderProducts()};

window.saveProduct=async i=>{
  const box=document.querySelector(`.product-edit[data-product-index="${i}"]`),p=products[i];
  syncProductDraft(i,box);
  p.images=p.images||[];p.image=p.images[0]||p.image||'';if(!p.category)p.category=categories()[0]||'Одежда';
  await api('/api/products/save',{method:'POST',body:JSON.stringify({products})});alert('Товар сохранён ♡');load();
};
window.deleteProduct=async i=>{if(!confirm('Удалить товар?'))return;products.splice(i,1);await api('/api/products/save',{method:'POST',body:JSON.stringify({products})});renderProducts()};
$('addProduct').onclick=async()=>{const cat=categories()[0]||'Одежда';products.unshift({id:Date.now(),article:'',name:'Новый товар',category:cat,price:0,sizes:[...DEFAULT_SIZES],sizeStock:{M:true,L:true,XL:true},colors:[],images:[],image:'',description:'',active:true});await api('/api/products/save',{method:'POST',body:JSON.stringify({products})});renderProducts()};

function initProductFilters(){
  const search=$('productSearch'), cat=$('productCategoryFilter');
  if(search)search.oninput=()=>{productSearch=search.value;renderProducts()};
  if(cat)cat.onchange=()=>{productCategoryFilter=cat.value;renderProducts()};
  updateProductCategoryFilter();
}
function updateProductCategoryFilter(){
  const cat=$('productCategoryFilter'); if(!cat)return;
  const current=productCategoryFilter;
  cat.innerHTML='<option value="all">Все категории</option>'+categories().map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('');
  cat.value=categories().includes(current)?current:'all'; productCategoryFilter=cat.value;
}

function renderCategories(){
  const list=$('categoryList');
  list.innerHTML=categories().map((c,i)=>`<div class="category-row"><span>🏷️ ${esc(c)}</span><button class="danger" onclick="removeCategory(${i})">Удалить</button></div>`).join('')||'<p class="soft">Категорий пока нет.</p>';
}
$('addCategory').onclick=async()=>{
  const input=$('newCategory'),name=input.value.trim();
  if(!name)return alert('Введите название категории');
  if(categories().some(c=>c.toLowerCase()===name.toLowerCase()))return alert('Такая категория уже есть');
  settings.categories=[...categories(),name];
  await saveAllSettings();input.value='';updateProductCategoryFilter();renderCategories();renderProducts();alert('Категория добавлена ♡');
};
window.removeCategory=async i=>{
  const name=categories()[i];
  if(products.some(p=>p.category===name))return alert('В этой категории есть товары. Сначала перенесите или удалите их.');
  if(!confirm('Удалить категорию «'+name+'»?'))return;
  settings.categories=categories().filter((_,x)=>x!==i);
  await saveAllSettings();updateProductCategoryFilter();renderCategories();renderProducts();
};

let allOrders=[];
let orderFilter='all';
const orderStatusLabels={new:'🔴 Новый',paid:'💳 Оплата проверена',completed:'🟢 Заказ завершён'};
const paymentStatusLabel={receipt_uploaded:'Квитанция загружена — проверить',paid:'Оплата подтверждена',rejected:'Оплата отклонена',not_required:'Оплата при получении'};

function updateOrderCounters(){
  const counts={all:allOrders.length,new:0,paid:0,completed:0};
  allOrders.forEach(o=>{const st=orderStatusLabels[o.orderStatus]?o.orderStatus:'new';counts[st]++});
  Object.entries(counts).forEach(([k,v])=>{const el=$('count'+k.charAt(0).toUpperCase()+k.slice(1));if(el)el.textContent=v});
  const badge=$('newOrderBadge');
  if(badge){badge.textContent=counts.new;badge.classList.toggle('hidden',counts.new===0)}
}

function orderStatusSelect(o){
  return `<select class="order-status-select" onchange="setOrderStatus('${o.id}',this.value)">${Object.entries(orderStatusLabels).map(([k,v])=>`<option value="${k}" ${o.orderStatus===k?'selected':''}>${v}</option>`).join('')}</select>`;
}

function renderOrders(){
  updateOrderCounters();
  const list=orderFilter==='all'?allOrders:allOrders.filter(o=>(o.orderStatus||'new')===orderFilter);
  $('orders').innerHTML=list.map(o=>{
    const itemTotal=(o.items||[]).reduce((sum,x)=>sum+(Number(x.price)||0)*(Number(x.qty)||1),0);
    const paymentButtons=`<div class="payment-actions">${o.paymentStatus==='receipt_uploaded'?`<button onclick="setPayment('${o.id}','paid')">✓ Оплата проверена</button><button class="danger" onclick="setPayment('${o.id}','rejected')">Отклонить</button>`:''}${o.paymentStatus==='rejected'?`<button onclick="setPayment('${o.id}','paid')">✓ Оплата проверена</button>`:''}${o.payment==='Оплата при получении'&&o.orderStatus!=='completed'?`<button onclick="setPayment('${o.id}','paid')">✓ Оплата получена</button>`:''}${o.orderStatus==='paid'?`<button class="complete-order" onclick="setOrderStatus('${o.id}','completed')">✓ Заказ завершён</button>`:''}</div>`;
    return `<div class="order order-status-${esc(o.orderStatus||'new')}">
      <div class="order-top"><div><b>Заказ #${esc(o.id)}</b> <span class="order-status-pill">${orderStatusLabels[o.orderStatus]||orderStatusLabels.new}</span></div><small>${esc(o.date)}</small></div>
      <div class="order-main-actions"><div><p><b>👤 ${esc(o.name)}</b></p><p>📱 <a href="tel:${esc(o.phone)}">${esc(o.phone)}</a></p></div><div class="quick-actions"><a class="button-link" href="tel:${esc(o.phone)}">📞 Позвонить</a><button onclick="copyPhone('${esc(o.phone)}')">📋 Скопировать телефон</button></div></div>
      <p>📦 <b>${esc(o.delivery)}</b>${o.city?' • Город: '+esc(o.city):''}${o.branch?' • Отделение: '+esc(o.branch):''}</p>
      <p>💳 <b>${esc(o.payment)}</b> <span class="order-payment-status">${esc(paymentStatusLabel[o.paymentStatus]||o.paymentStatus||'—')}</span></p>
      ${o.receipt?`<div class="receipt-box"><b>Квитанция:</b><br><a href="${esc(o.receipt)}" target="_blank"><img class="receipt-preview" src="${esc(o.receipt)}" alt="Квитанция"></a></div>`:''}${paymentButtons}
      <div class="order-items">${(o.items||[]).map(x=>`<div class="order-product"><img src="${esc(x.image||'')}" onerror="this.style.display='none'"><div><b>${esc(x.name)}</b><br><small>Артикул: ${esc(x.article||'—')} • Размер: ${esc(x.size||'—')} • Цвет: ${esc(x.color||'—')} • Кол-во: ${esc(x.qty||1)}${x.price?' • '+Number(x.price).toLocaleString('uk-UA')+' грн':''}</small></div></div>`).join('')}</div>
      <div class="order-total"><b>Сумма:</b> ${itemTotal?itemTotal.toLocaleString('uk-UA')+' грн':'Цена уточняется'}</div>
      <div class="order-management"><label>Статус ${orderStatusSelect(o)}</label></div>
      <p class="order-comment">Комментарий: ${esc(o.comment||'—')}</p>
      <button class="danger" onclick="delOrder('${o.id}')">Удалить заказ</button>
    </div>`;
  }).join('')||'<p class="soft">В этом разделе заказов пока нет.</p>';
}

async function loadOrders(){try{allOrders=await api('/api/orders');renderOrders()}catch(e){alert(e.message)}}
window.setOrderStatus=async(id,status)=>{try{await api('/api/orders/status',{method:'POST',body:JSON.stringify({id,status})});await loadOrders()}catch(e){alert(e.message)}};
window.copyPhone=async phone=>{try{await navigator.clipboard.writeText(phone);alert('Телефон скопирован ♡')}catch{alert('Телефон: '+phone)}};
window.setPayment=async(id,status)=>{try{await api('/api/orders/payment',{method:'POST',body:JSON.stringify({id,status})});await loadOrders()}catch(e){alert(e.message)}};
window.delOrder=async id=>{if(confirm('Удалить заказ?')){await api('/api/orders/delete',{method:'POST',body:JSON.stringify({id})});await loadOrders()}};
$('refreshOrders').onclick=loadOrders;
document.querySelectorAll('.order-filter').forEach(btn=>btn.onclick=()=>{document.querySelectorAll('.order-filter').forEach(x=>x.classList.remove('active'));btn.classList.add('active');orderFilter=btn.dataset.filter;renderOrders()});

function renderSettings(){
  $('settingsForm').innerHTML=`<label>Название<input name="shopName" value="${esc(settings.shopName)}"></label>
<label>Подпись<input name="tagline" value="${esc(settings.tagline)}"></label>
<label>Телефон Елены<input name="phone" value="${esc(settings.phone)}"></label>
<label>Имя Елены<input name="phoneName" value="${esc(settings.phoneName)}"></label>
<label class="wide">Ссылка на Telegram<input name="telegram" value="${esc(settings.telegram)}" placeholder="https://t.me/..."></label>
<label class="wide">Telegram Chat ID для уведомлений<input name="telegramChatId" value="${esc(settings.telegramChatId||'')}" placeholder="Например, -1001234567890 или ваш chat id"></label><button type="button" id="telegramTest" class="settings-test">📲 Отправить тест в Telegram</button>
<label class="wide">Ссылка на Viber<input name="viber" value="${esc(settings.viber)}" placeholder="https://invite.viber.com/..."></label>
<label>Телефон Светланы<input name="phone2" value="${esc(settings.phone2)}"></label>
<label>Имя Светланы<input name="phone2Name" value="${esc(settings.phone2Name)}"></label>
<label>Телефон Татьяны<input name="phone3" value="${esc(settings.phone3||'+380972577772')}"></label>
<label>Имя Татьяны<input name="phone3Name" value="${esc(settings.phone3Name||'Татьяна')}"></label>
<label>Телефон Ольги<input name="phone4" value="${esc(settings.phone4||'+380931980977')}"></label>
<label>Имя Ольги<input name="phone4Name" value="${esc(settings.phone4Name||'Ольга')}"></label>
<label class="wide">Адрес<input name="address" value="${esc(settings.address)}"></label>
<label class="wide">Доставка<textarea name="deliveryNote">${esc(settings.deliveryNote)}</textarea></label>
<label class="wide">Самовывоз<textarea name="pickupNote">${esc(settings.pickupNote)}</textarea></label>
<label>Банк для оплаты<input name="cardBank" value="${esc(settings.cardBank)}" placeholder="Например, Monobank"></label>
<label>Номер карты<input name="cardNumber" value="${esc(settings.cardNumber)}" placeholder="0000 0000 0000 0000"></label>
<label>Получатель карты<input name="cardName" value="${esc(settings.cardName)}" placeholder="Имя и фамилия"></label>
<label class="wide">API-ключ Новой Пошты<input name="novaposhtaApiKey" value="${esc(settings.novaposhtaApiKey)}" placeholder="Вставьте ключ из бизнес-кабинета Новой Пошты"></label>
<button type="submit">Сохранить настройки</button>`;
  $('telegramTest').onclick=async()=>{try{const f=new FormData($('settingsForm'));settings={...settings,...Object.fromEntries(f.entries()),categories:categories()};await saveAllSettings();await api('/api/telegram/test',{method:'POST',body:'{}'});alert('Тест отправлен в Telegram ♡')}catch(e){alert(e.message)}};
}
$('settingsForm').onsubmit=async e=>{
  e.preventDefault();
  const f=new FormData(e.target);
  const oldCats=categories();
  settings={...settings,...Object.fromEntries(f.entries()),categories:oldCats};
  await saveAllSettings();alert('Настройки сохранены ♡')
};
$('changePass').onclick=async()=>{
  if($('newPass').value.length<4)return alert('Минимум 4 символа');
  await api('/api/password',{method:'POST',body:JSON.stringify({password:$('newPass').value})});
  $('newPass').value='';alert('Пароль изменён')
};
check();
