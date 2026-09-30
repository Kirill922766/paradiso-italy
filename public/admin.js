let products=[],settings={};
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

async function load(){products=await api('/api/products');settings=await api('/api/settings/admin');renderProducts();renderCategories()}
function categories(){return Array.isArray(settings.categories)?settings.categories:[]}
function saveAllSettings(){
  return api('/api/settings/save',{method:'POST',body:JSON.stringify(settings)});
}

function renderProducts(){
  let cats=categories();
  if(!cats.length)cats=['Одежда'];
  let el=$('productList');
  el.innerHTML=products.map((p,i)=>`<div class="product-edit">
<img src="${esc(p.image)}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22150%22 height=%22190%22><rect width=%22100%%22 height=%22100%%22 fill=%22%23eee%22/><text x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22>Фото</text></svg>'">
<div><div class="fields">
<input class="wide" data-k="name" value="${esc(p.name)}" placeholder="Название">
<input data-k="article" value="${esc(p.article)}" placeholder="Артикул">
<select data-k="category">${cats.map(c=>`<option ${c===p.category?'selected':''}>${esc(c)}</option>`).join('')}</select>
<input data-k="price" type="number" min="0" value="${p.price||''}" placeholder="Цена, грн">
<input class="wide" data-k="description" value="${esc(p.description)}" placeholder="Описание">
<input class="wide" data-k="sizes" value="${(p.sizes||[]).join(', ')}" placeholder="Размеры через запятую: 42, 44, 46">
<input class="wide" data-k="image" value="${esc(p.image)}" placeholder="Путь к фото или загруженное фото">
<label class="upload-label">📷 Загрузить новое фото<input class="photo-input" type="file" accept="image/*" onchange="uploadPhoto(${i},this)"></label>
<label class="active-check"><input data-k="active" type="checkbox" ${p.active!==false?'checked':''}> Показывать в магазине</label>
</div><div class="actions"><button class="save" onclick="saveProduct(${i})">Сохранить</button><button class="danger" onclick="deleteProduct(${i})">Удалить</button></div></div></div>`).join('')||'<p>Товаров пока нет.</p>';
}

function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}

async function compressImage(file){
  if(!file.type.startsWith('image/'))throw new Error('Выберите изображение');
  const img=await new Promise((resolve,reject)=>{const x=new Image();x.onload=()=>resolve(x);x.onerror=reject;x.src=URL.createObjectURL(file)});
  const max=1100,scale=Math.min(1,max/Math.max(img.width,img.height));
  const c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.width*scale));c.height=Math.max(1,Math.round(img.height*scale));
  c.getContext('2d').drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(img.src);
  let data=c.toDataURL('image/webp',.78);
  if(data.length>280000)data=c.toDataURL('image/webp',.58);
  if(data.length>400000)throw new Error('Фото слишком большое. Выберите другое или уменьшите его.');
  return data;
}
window.uploadPhoto=async(i,input)=>{
  if(!input.files?.[0])return;
  try{
    const data=await compressImage(input.files[0]);
    products[i].image=data;
    renderProducts();
    alert('Фото загружено. Нажмите «Сохранить» у товара ♡');
  }catch(e){alert(e.message)}
};

window.saveProduct=async i=>{
  const box=$('productList').children[i],p=products[i];
  box.querySelectorAll('[data-k]').forEach(x=>{
    let k=x.dataset.k;
    if(k==='price')p[k]=Number(x.value)||0;
    else if(k==='sizes')p[k]=x.value.split(',').map(s=>s.trim()).filter(Boolean);
    else if(k==='active')p[k]=x.checked;
    else p[k]=x.value;
  });
  if(!p.category)p.category=categories()[0]||'Одежда';
  await api('/api/products/save',{method:'POST',body:JSON.stringify({products})});
  alert('Товар сохранён ♡');load();
};

window.deleteProduct=async i=>{
  if(!confirm('Удалить товар?'))return;
  products.splice(i,1);
  await api('/api/products/save',{method:'POST',body:JSON.stringify({products})});
  renderProducts();
};

$('addProduct').onclick=async()=>{
  const cat=categories()[0]||'Одежда';
  products.push({id:Date.now(),article:'',name:'Новый товар',category:cat,price:0,sizes:['42','44','46','48'],description:'',image:'',active:true});
  await api('/api/products/save',{method:'POST',body:JSON.stringify({products})});
  renderProducts();
};

function renderCategories(){
  const list=$('categoryList');
  list.innerHTML=categories().map((c,i)=>`<div class="category-row"><span>🏷️ ${esc(c)}</span><button class="danger" onclick="removeCategory(${i})">Удалить</button></div>`).join('')||'<p class="soft">Категорий пока нет.</p>';
}
$('addCategory').onclick=async()=>{
  const input=$('newCategory'),name=input.value.trim();
  if(!name)return alert('Введите название категории');
  if(categories().some(c=>c.toLowerCase()===name.toLowerCase()))return alert('Такая категория уже есть');
  settings.categories=[...categories(),name];
  await saveAllSettings();input.value='';renderCategories();renderProducts();alert('Категория добавлена ♡');
};
window.removeCategory=async i=>{
  const name=categories()[i];
  if(products.some(p=>p.category===name))return alert('В этой категории есть товары. Сначала перенесите или удалите их.');
  if(!confirm('Удалить категорию «'+name+'»?'))return;
  settings.categories=categories().filter((_,x)=>x!==i);
  await saveAllSettings();renderCategories();renderProducts();
};

async function loadOrders(){
  let os=await api('/api/orders');
  const statusLabel={receipt_uploaded:'Квитанция загружена — проверить',paid:'Оплата подтверждена',rejected:'Оплата отклонена',not_required:'Оплата при получении'};
  $('orders').innerHTML=os.map(o=>`<div class="order"><div class="order-top"><b>Заказ #${o.id}</b><small>${esc(o.date)}</small></div><p><b>${esc(o.name)}</b> • <a href="tel:${esc(o.phone)}">${esc(o.phone)}</a></p><p>📦 <b>${esc(o.delivery)}</b>${o.city?' • Город: '+esc(o.city):''}${o.branch?' • Отделение: '+esc(o.branch):''}<br>💳 <b>${esc(o.payment)}</b> <span class="order-payment-status">${esc(statusLabel[o.paymentStatus]||o.paymentStatus||'—')}</span></p>${o.receipt?`<div><b>Квитанция:</b><br><a href="${esc(o.receipt)}" target="_blank"><img class="receipt-preview" src="${esc(o.receipt)}" alt="Квитанция"></a></div><div class="payment-actions">${o.paymentStatus==='receipt_uploaded'?`<button onclick="setPayment('${o.id}','paid')">✓ Подтвердить оплату</button><button class="danger" onclick="setPayment('${o.id}','rejected')">Отклонить</button>`:''}${o.paymentStatus==='rejected'?`<button onclick="setPayment('${o.id}','paid')">✓ Подтвердить оплату</button>`:''}</div>`:''}<div class="order-items">${(o.items||[]).map(x=>`<div class="order-product"><img src="${esc(x.image||'')}" onerror="this.style.display='none'"><div><b>${esc(x.name)}</b><br><small>Артикул: ${esc(x.article||'—')} • Размер: ${esc(x.size)} • Кол-во: ${esc(x.qty||1)}${x.price?' • '+Number(x.price).toLocaleString('uk-UA')+' грн':''}</small></div></div>`).join('')}</div><small>Комментарий: ${esc(o.comment||'—')}</small><br><button class="danger" onclick="delOrder('${o.id}')">Удалить</button></div>`).join('')||'<p>Заказов пока нет.</p>'
}
window.setPayment=async(id,status)=>{try{await api('/api/orders/payment',{method:'POST',body:JSON.stringify({id,status})});loadOrders()}catch(e){alert(e.message)}}
window.delOrder=async id=>{if(confirm('Удалить заказ?')){await api('/api/orders/delete',{method:'POST',body:JSON.stringify({id})});loadOrders()}};
$('refreshOrders').onclick=loadOrders;

function renderSettings(){
  $('settingsForm').innerHTML=`<label>Название<input name="shopName" value="${esc(settings.shopName)}"></label>
<label>Подпись<input name="tagline" value="${esc(settings.tagline)}"></label>
<label>Телефон Елены<input name="phone" value="${esc(settings.phone)}"></label>
<label>Имя Елены<input name="phoneName" value="${esc(settings.phoneName)}"></label>
<label class="wide">Ссылка на Telegram<input name="telegram" value="${esc(settings.telegram)}" placeholder="https://t.me/..."></label>
<label class="wide">Ссылка на Viber<input name="viber" value="${esc(settings.viber)}" placeholder="https://invite.viber.com/..."></label>
<label>Телефон Светланы<input name="phone2" value="${esc(settings.phone2)}"></label>
<label>Имя Светланы<input name="phone2Name" value="${esc(settings.phone2Name)}"></label>
<label class="wide">Адрес<input name="address" value="${esc(settings.address)}"></label>
<label class="wide">Доставка<textarea name="deliveryNote">${esc(settings.deliveryNote)}</textarea></label>
<label class="wide">Самовывоз<textarea name="pickupNote">${esc(settings.pickupNote)}</textarea></label>
<label>Банк для оплаты<input name="cardBank" value="${esc(settings.cardBank)}" placeholder="Например, Monobank"></label>
<label>Номер карты<input name="cardNumber" value="${esc(settings.cardNumber)}" placeholder="0000 0000 0000 0000"></label>
<label>Получатель карты<input name="cardName" value="${esc(settings.cardName)}" placeholder="Имя и фамилия"></label>
<label class="wide">API-ключ Новой Пошты<input name="novaposhtaApiKey" value="${esc(settings.novaposhtaApiKey)}" placeholder="Вставьте ключ из бизнес-кабинета Новой Пошты"></label>
<button type="submit">Сохранить настройки</button>`
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
