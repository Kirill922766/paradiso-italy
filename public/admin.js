let products=[],settings={};
let productSearch='', productCategoryFilter='all';
const DEFAULT_SIZES=['M','L','XL'];
const $=id=>document.getElementById(id);
let adminLang=localStorage.getItem('paradiso_admin_lang')||localStorage.getItem('paradiso_lang')||'ru';
const AI18N={ru:{adminTitle:'Админ-панель',adminSubtitle:'Управление магазином',password:'Пароль',login:'Войти',backShop:'← Вернуться в магазин',openShop:'Открыть магазин',logout:'Выйти',products:'Товары',categories:'Категории',orders:'Заказы',settings:'Настройки',productsHint:'Добавляйте, изменяйте фото, цены, размеры и описание.',newProduct:'＋ Новый товар',allCategories:'Все категории',categoriesHint:'Добавляйте любые разделы каталога без изменения кода.',add:'＋ Добавить',ordersHint:'Управляйте заказами и подтверждайте оплату.',refresh:'Обновить',all:'Все',newOrders:'Новые',paidOrders:'Оплаченные',completedOrders:'Завершённые',shopSettings:'Настройки магазина',settingsHint:'Эти данные отображаются на сайте.',changePassword:'Смена пароля',savePassword:'Сохранить пароль',name:'Название',tagline:'Подпись',telegram:'Ссылка на Telegram',telegramChat:'Telegram Chat ID для уведомлений',telegramTest:'📲 Отправить тест в Telegram',viber:'Ссылка на Viber',address:'Адрес',delivery:'Доставка',pickup:'Самовывоз',bank:'Банк для оплаты',card:'Номер карты',cardName:'Получатель карты',novaKey:'API-ключ Новой Пошты',save:'Сохранить настройки',phoneElena:'Телефон Елены',nameElena:'Имя Елены',phoneSvetlana:'Телефон Светланы',nameSvetlana:'Имя Светланы',phoneTatiana:'Телефон Татьяны',nameTatiana:'Имя Татьяны',phoneOlga:'Телефон Ольги',nameOlga:'Имя Ольги',article:'Артикул',category:'Категория',price:'Цена, грн',oldPrice:'Старая цена, грн (для акции)',description:'Описание',marks:'🏷️ Отметки товара',new:'🆕 Новинка',hit:'⭐ Хит',sizes:'📏 Размеры и наличие',addSize:'Добавить размер, например S или 2XL',addColor:'Например: чёрный',colors:'🎨 Цвета и наличие',colorEmpty:'Цвета ещё не добавлены.',photo:'📷 Добавить несколько фотографий',show:'Показывать в магазине',main:'Главное',makeMain:'Сделать главным',noPhoto:'Фото нет',saveProduct:'Сохранить',delete:'Удалить',search:'🔎 Поиск по названию, артикулу или описанию',notFound:'По вашему фильтру товары не найдены.',has:'есть',addColorBtn:'＋ Добавить цвет',addSizeBtn:'＋ Добавить размер',order:'Заказ',call:'📞 Позвонить',copyPhone:'📋 Скопировать телефон',city:'Город',branch:'Отделение',receipt:'Квитанция',paymentChecked:'✓ Оплата проверена',paymentReceived:'✓ Оплата получена',reject:'Отклонить',complete:'✓ Заказ завершён',sum:'Сумма:',status:'Статус',comment:'Комментарий:',deleteOrder:'Удалить заказ',emptyOrders:'В этом разделе заказов пока нет.',unknownPrice:'Цена уточняется',paymentConfirmed:'Оплата подтверждена',receiptUploaded:'Квитанция загружена — проверить',paymentRejected:'Оплата отклонена',paymentOnReceipt:'Оплата при получении',deleteCategory:'Удалить',categoryHasProducts:'В этой категории есть товары. Сначала перенесите или удалите их.'},ua:{adminTitle:'Адмін-панель',adminSubtitle:'Керування магазином',password:'Пароль',login:'Увійти',backShop:'← Повернутися до магазину',openShop:'Відкрити магазин',logout:'Вийти',products:'Товари',categories:'Категорії',orders:'Замовлення',settings:'Налаштування',productsHint:'Додавайте та змінюйте фото, ціни, розміри й опис.',newProduct:'＋ Новий товар',allCategories:'Усі категорії',categoriesHint:'Додавайте будь-які розділи каталогу без зміни коду.',add:'＋ Додати',ordersHint:'Керуйте замовленнями та підтверджуйте оплату.',refresh:'Оновити',all:'Усі',newOrders:'Нові',paidOrders:'Оплачені',completedOrders:'Завершені',shopSettings:'Налаштування магазину',settingsHint:'Ці дані відображаються на сайті.',changePassword:'Зміна пароля',savePassword:'Зберегти пароль',name:'Назва',tagline:'Підпис',telegram:'Посилання на Telegram',telegramChat:'Telegram Chat ID для сповіщень',telegramTest:'📲 Надіслати тест у Telegram',viber:'Посилання на Viber',address:'Адреса',delivery:'Доставка',pickup:'Самовивіз',bank:'Банк для оплати',card:'Номер картки',cardName:'Отримувач картки',novaKey:'API-ключ Нової Пошти',save:'Зберегти налаштування',phoneElena:'Телефон Олени',nameElena:'Ім’я Олени',phoneSvetlana:'Телефон Світлани',nameSvetlana:'Ім’я Світлани',phoneTatiana:'Телефон Тетяни',nameTatiana:'Ім’я Тетяни',phoneOlga:'Телефон Ольги',nameOlga:'Ім’я Ольги',article:'Артикул',category:'Категорія',price:'Ціна, грн',oldPrice:'Стара ціна, грн (для акції)',description:'Опис',marks:'🏷️ Позначки товару',new:'🆕 Новинка',hit:'⭐ Хіт',sizes:'📏 Розміри та наявність',addSize:'Додати розмір, наприклад S або 2XL',addColor:'Наприклад: чорний',colors:'🎨 Кольори та наявність',colorEmpty:'Кольори ще не додані.',photo:'📷 Додати кілька фотографій',show:'Показувати в магазині',main:'Головне',makeMain:'Зробити головним',noPhoto:'Фото немає',saveProduct:'Зберегти',delete:'Видалити',search:'🔎 Пошук за назвою, артикулом або описом',notFound:'За вашим фільтром товари не знайдені.',has:'є',addColorBtn:'＋ Додати колір',addSizeBtn:'＋ Додати розмір',order:'Замовлення',call:'📞 Зателефонувати',copyPhone:'📋 Скопіювати телефон',city:'Місто',branch:'Відділення',receipt:'Квитанція',paymentChecked:'✓ Оплату перевірено',paymentReceived:'✓ Оплату отримано',reject:'Відхилити',complete:'✓ Замовлення завершено',sum:'Сума:',status:'Статус',comment:'Коментар:',deleteOrder:'Видалити замовлення',emptyOrders:'У цьому розділі замовлень поки немає.',unknownPrice:'Ціна уточнюється',paymentConfirmed:'Оплату підтверджено',receiptUploaded:'Квитанцію завантажено — перевірити',paymentRejected:'Оплату відхилено',paymentOnReceipt:'Оплата при отриманні',deleteCategory:'Видалити',categoryHasProducts:'У цій категорії є товари. Спочатку перенесіть або видаліть їх.'}};
const at=k=>(AI18N[adminLang]&&AI18N[adminLang][k])||AI18N.ru[k]||k;
function translateCategory(c){const m={'Костюмы':['Костюмы','Костюми'],'Костюми':['Костюмы','Костюми'],'Платья':['Платья','Сукні'],'Плаття':['Платья','Сукні'],'Джинсы':['Джинсы','Джинси'],'Джинси':['Джинсы','Джинси'],'Блузки':['Блузки','Блузки'],'Брюки':['Брюки','Штани'],'Штани':['Брюки','Штани'],'Куртки':['Куртки','Куртки'],'Юбки':['Юбки','Спідниці'],'Спідниці':['Юбки','Спідниці'],'Футболки':['Футболки','Футболки'],'Свитера':['Свитера','Светри'],'Светри':['Свитера','Светри'],'Аксессуары':['Аксессуары','Аксесуари'],'Аксесуари':['Аксессуары','Аксесуари']};const pair=m[String(c)];return pair?pair[adminLang==='ua'?1:0]:c;}
function applyAdminLanguage(){document.documentElement.lang=adminLang;document.querySelectorAll('[data-ai18n]').forEach(el=>el.textContent=at(el.dataset.ai18n));document.querySelectorAll('[data-ai18n-placeholder]').forEach(el=>el.placeholder=at(el.dataset.ai18nPlaceholder));['adminLangRu','adminAppLangRu'].forEach(id=>$(id)?.classList.toggle('active',adminLang==='ru'));['adminLangUa','adminAppLangUa'].forEach(id=>$(id)?.classList.toggle('active',adminLang==='ua'));const search=$('productSearch');if(search)search.placeholder=at('search');const pass=$('pass');if(pass)pass.placeholder=at('password');const nc=$('newCategory');if(nc)nc.placeholder=adminLang==='ua'?'Наприклад: Джинси':'Например: Джинсы';const np=$('newPass');if(np)np.placeholder=adminLang==='ua'?'Новий пароль':'Новый пароль';}
function setAdminLang(v){adminLang=v;localStorage.setItem('paradiso_admin_lang',v);applyAdminLanguage();renderProducts();renderCategories();if(!document.getElementById('ordersTab').classList.contains('hidden'))renderOrders();if(!document.getElementById('settingsTab').classList.contains('hidden'))renderSettings();}
['adminLangRu','adminAppLangRu'].forEach(id=>$(id)?.addEventListener('click',()=>setAdminLang('ru')));['adminLangUa','adminAppLangUa'].forEach(id=>$(id)?.addEventListener('click',()=>setAdminLang('ua')));

async function api(url,opt={}){
  const headers={...(opt.headers||{})};
  if(!(opt.body instanceof FormData)&&opt.body!==undefined)headers['Content-Type']='application/json';
  const r=await fetch(url,{...opt,headers});
  const d=await r.json();
  if(!r.ok)throw new Error(d.error||'Ошибка');
  return d;
}
applyAdminLanguage();
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

async function load(){products=await api('/api/products');products.sort((a,b)=>Number(b.id)-Number(a.id));settings=await api('/api/settings/admin');applyAdminLanguage();initProductFilters();updateProductCategoryFilter();renderProducts();renderCategories()}
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
    const gallery=imgs.map((im,j)=>`<div class="admin-photo ${j===0?'main':''}"><img src="${esc(imageSrc(im))}" onerror="this.onerror=null;this.style.display='none'"><button type="button" class="photo-del" onclick="removeImage(${i},${j})">×</button>${j===0?'<span>'+at('main')+'</span>':'<button type="button" class="photo-main" onclick="makeMainImage('+i+','+j+')">'+at('makeMain')+'</button>'}</div>`).join('')||`<div class="photo-empty">${at('noPhoto')}<small>Загрузите фото и нажмите «Сохранить»</small></div>`;
    const colorRows=colors.map((c,j)=>`<div class="color-row"><input class="color-name" data-color-index="${j}" value="${esc(c.name)}" placeholder="${at('addColor')}"><label><input type="checkbox" class="color-stock" data-color-index="${j}" ${c.available!==false?'checked':''}> ${at('has')}</label><button type="button" class="danger mini" onclick="removeColor(${i},${j})">×</button></div>`).join('')||`<p class="soft">${at('colorEmpty')}</p>`;
    return `<div class="product-edit" data-product-index="${i}">
      <div class="admin-gallery">${gallery}</div>
      <div><div class="fields">
        <input class="wide" data-k="name" value="${esc(p.name)}" placeholder="${at('name')}">
        <input data-k="article" value="${esc(p.article)}" placeholder="${at('article')}">
        <select data-k="category">${cats.map(c=>`<option value="${esc(c)}" ${c===p.category?'selected':''}>${esc(translateCategory(c))}</option>`).join('')}</select>
        <div class="price-fields">
          <input data-k="price" type="number" min="0" value="${p.price||''}" placeholder="${at('price')}">
          <input data-k="oldPrice" type="number" min="0" value="${p.oldPrice||''}" placeholder="${at('oldPrice')}">
        </div>
        <textarea class="wide" data-k="description" placeholder="${at('description')}">${esc(p.description)}</textarea>
        <div class="badges-box wide"><b>${at('marks')}</b>
          <label><input data-k="isNew" type="checkbox" ${p.isNew?'checked':''}> ${at('new')}</label>
          <label><input data-k="isHit" type="checkbox" ${p.isHit?'checked':''}> ${at('hit')}</label>
        </div>
        <div class="stock-box wide"><b>${at('sizes')}</b><div class="stock-grid">${sizes.map(sz=>`<label><input type="checkbox" class="size-stock" data-size="${esc(sz)}" ${stock[sz]!==false?'checked':''}> ${esc(sz)}</label>`).join('')}</div><input class="wide size-add-input" placeholder="${at('addSize')}"><button type="button" class="small-btn" onclick="addSize(${i},this)">${at('addSizeBtn')}</button></div>
        <div class="stock-box wide"><b>${at('colors')}</b><div class="color-list">${colorRows}</div><div class="color-add"><input id="newColor_${i}" placeholder="${at('addColor')}"><button type="button" class="small-btn" onclick="addColor(${i})">${at('addColorBtn')}</button></div></div>
        <label class="upload-label">${at('photo')}<input class="photo-input" type="file" accept="image/*" multiple onchange="uploadPhotos(${i},this)"></label>
        <label class="active-check"><input data-k="active" type="checkbox" ${p.active!==false?'checked':''}> ${at('show')}</label>
      </div><div class="actions"><button class="save" onclick="saveProduct(${i})">${at('saveProduct')}</button><button class="danger" onclick="deleteProduct(${i})">${at('delete')}</button></div></div></div>`;
  }).join('')||`<p>${at('notFound')}</p>`;
}

function syncProductDraft(i,box){
  const p=products[i]; if(!p||!box)return;
  box.querySelectorAll('[data-k]').forEach(x=>{const k=x.dataset.k;if(k==='price'||k==='oldPrice')p[k]=Number(x.value)||0;else if(k==='active'||k==='isNew'||k==='isHit')p[k]=x.checked;else p[k]=x.value});
  const sizes=[...box.querySelectorAll('.size-stock')].map(x=>x.dataset.size); if(sizes.length)p.sizes=sizes;
  p.sizeStock=Object.fromEntries([...box.querySelectorAll('.size-stock')].map(x=>[x.dataset.size,x.checked]));
  p.colors=[...box.querySelectorAll('.color-row')].map(row=>({name:row.querySelector('.color-name').value.trim(),available:row.querySelector('.color-stock').checked})).filter(x=>x.name);
}

function imageSrc(value){const v=String(value||'').trim();if(!v)return '';if(/^(data:|https?:|blob:|\/)/i.test(v))return v;return '/'+v.replace(/^\/+/, '');}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
async function compressImage(file){
  if(!file.type.startsWith('image/'))throw new Error(adminLang==='ua'?'Оберіть зображення':'Выберите изображение');
  const img=await new Promise((resolve,reject)=>{const x=new Image();x.onload=()=>resolve(x);x.onerror=reject;x.src=URL.createObjectURL(file)});
  const max=1100,scale=Math.min(1,max/Math.max(img.width,img.height));
  const c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.width*scale));c.height=Math.max(1,Math.round(img.height*scale));
  c.getContext('2d').drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(img.src);
  let data=c.toDataURL('image/webp',.72); if(data.length>220000)data=c.toDataURL('image/webp',.52); if(data.length>360000)throw new Error(adminLang==='ua'?'Фото занадто велике. Оберіть інше або зменште його.':'Фото слишком большое. Выберите другое или уменьшите его.'); return data;
}
window.uploadPhotos=async(i,input)=>{
  if(!input.files?.length)return;
  const box=input.closest('.product-edit');
  syncProductDraft(i,box);
  try{const added=[];for(const f of input.files){added.push(await compressImage(f));}products[i].images=[...(products[i].images||[]),...added];products[i].image=products[i].images[0]||'';renderProducts();alert(adminLang==='ua'?`Завантажено фото: ${added.length}. Текст, розміри, кольори та інші поля збережено. Натисніть «Зберегти».`:`Загружено фото: ${added.length}. Текст, размеры, цвета и остальные поля сохранены. Нажмите «Сохранить».`)}catch(e){alert(e.message)}
};
window.removeImage=(i,j)=>{const box=document.querySelector(`.product-edit[data-product-index="${i}"]`);syncProductDraft(i,box);products[i].images=(products[i].images||[]).filter((_,x)=>x!==j);products[i].image=products[i].images[0]||'';renderProducts()};
window.makeMainImage=(i,j)=>{const box=document.querySelector(`.product-edit[data-product-index="${i}"]`);syncProductDraft(i,box);const a=[...(products[i].images||[])];if(!a[j])return;const [x]=a.splice(j,1);a.unshift(x);products[i].images=a;products[i].image=a[0]||'';renderProducts()};
window.addSize=(i,btn)=>{const box=btn.closest('.product-edit');syncProductDraft(i,box);const input=btn.previousElementSibling,v=input.value.trim();if(!v)return;products[i].sizes=[...(products[i].sizes||[]),v].filter((x,n,a)=>a.indexOf(x)===n);products[i].sizeStock=products[i].sizeStock||{};products[i].sizeStock[v]=true;input.value='';renderProducts()};
window.addColor=(i)=>{const box=document.querySelector(`.product-edit[data-product-index="${i}"]`);syncProductDraft(i,box);const input=$('newColor_'+i),v=input.value.trim();if(!v)return;products[i].colors=Array.isArray(products[i].colors)?products[i].colors:[];if(products[i].colors.some(c=>String(c.name).toLowerCase()===v.toLowerCase()))return alert(adminLang==='ua'?'Такий колір уже додано':'Такой цвет уже добавлен');products[i].colors.push({name:v,available:true});input.value='';renderProducts()};
window.removeColor=(i,j)=>{const box=document.querySelector(`.product-edit[data-product-index="${i}"]`);syncProductDraft(i,box);products[i].colors=(products[i].colors||[]).filter((_,x)=>x!==j);renderProducts()};

window.saveProduct=async i=>{
  const box=document.querySelector(`.product-edit[data-product-index="${i}"]`),p=products[i];
  syncProductDraft(i,box);
  p.images=p.images||[];p.image=p.images[0]||p.image||'';if(!p.category)p.category=categories()[0]||'Одежда';
  await api('/api/products/save',{method:'POST',body:JSON.stringify({product:p})});alert(adminLang==='ua'?'Товар збережено ♡':'Товар сохранён ♡');load();
};
window.deleteProduct=async i=>{if(!confirm(adminLang==='ua'?'Видалити товар?':'Удалить товар?'))return;const id=Number(products[i]?.id);products.splice(i,1);try{await api('/api/products/save',{method:'POST',body:JSON.stringify({deletedIds:Number.isFinite(id)?[id]:[]})});renderProducts()}catch(e){alert(e.message);load()}};
$('addProduct').onclick=async()=>{const cat=categories()[0]||'Одежда';products.unshift({id:Date.now(),article:'',name:adminLang==='ua'?'Новий товар':'Новый товар',category:cat,price:0,oldPrice:0,isNew:true,isHit:false,sizes:[...DEFAULT_SIZES],sizeStock:{M:true,L:true,XL:true},colors:[],images:[],image:'',description:'',active:true});await api('/api/products/save',{method:'POST',body:JSON.stringify({product:products[0]})});renderProducts()};

function initProductFilters(){
  const search=$('productSearch'), cat=$('productCategoryFilter');
  if(search)search.oninput=()=>{productSearch=search.value;renderProducts()};
  if(cat)cat.onchange=()=>{productCategoryFilter=cat.value;renderProducts()};
  updateProductCategoryFilter();
}
function updateProductCategoryFilter(){
  const cat=$('productCategoryFilter'); if(!cat)return;
  const current=productCategoryFilter;
  cat.innerHTML='<option value="all">'+at('allCategories')+'</option>'+categories().map(c=>`<option value="${esc(c)}">${esc(translateCategory(c))}</option>`).join('');
  cat.value=categories().includes(current)?current:'all'; productCategoryFilter=cat.value;
}

function renderCategories(){
  const list=$('categoryList');
  list.innerHTML=categories().map((c,i)=>`<div class="category-row"><span>🏷️ ${esc(translateCategory(c))}</span><button class="danger" onclick="removeCategory(${i})">${at('deleteCategory')}</button></div>`).join('')||`<p class="soft">${adminLang==='ua'?'Категорій поки немає.':'Категорий пока нет.'}</p>`;
}
$('addCategory').onclick=async()=>{
  const input=$('newCategory'),name=input.value.trim();
  if(!name)return alert(adminLang==='ua'?'Введіть назву категорії':'Введите название категории');
  if(categories().some(c=>c.toLowerCase()===name.toLowerCase()))return alert(adminLang==='ua'?'Така категорія вже є':'Такая категория уже есть');
  settings.categories=[...categories(),name];
  await saveAllSettings();input.value='';updateProductCategoryFilter();renderCategories();renderProducts();alert(adminLang==='ua'?'Категорію додано ♡':'Категория добавлена ♡');
};
window.removeCategory=async i=>{
  const name=categories()[i];
  if(products.some(p=>p.category===name))return alert(at('categoryHasProducts'));
  if(!confirm((adminLang==='ua'?'Видалити категорію «':'Удалить категорию «')+name+'»?'))return;
  settings.categories=categories().filter((_,x)=>x!==i);
  await saveAllSettings();updateProductCategoryFilter();renderCategories();renderProducts();
};

let allOrders=[];
let orderFilter='all';
const orderStatusLabels={new:()=>adminLang==='ua'?'🔴 Нове':'🔴 Новый',paid:()=>adminLang==='ua'?'💳 Оплату перевірено':'💳 Оплата проверена',completed:()=>adminLang==='ua'?'🟢 Замовлення завершено':'🟢 Заказ завершён'};
const paymentStatusLabel={receipt_uploaded:()=>at('receiptUploaded'),paid:()=>at('paymentConfirmed'),rejected:()=>at('paymentRejected'),not_required:()=>at('paymentOnReceipt')};

function updateOrderCounters(){
  const counts={all:allOrders.length,new:0,paid:0,completed:0};
  allOrders.forEach(o=>{const st=orderStatusLabels[o.orderStatus]?o.orderStatus:'new';counts[st]++});
  Object.entries(counts).forEach(([k,v])=>{const el=$('count'+k.charAt(0).toUpperCase()+k.slice(1));if(el)el.textContent=v});
  const badge=$('newOrderBadge');
  if(badge){badge.textContent=counts.new;badge.classList.toggle('hidden',counts.new===0)}
}

function orderStatusSelect(o){
  return `<select class="order-status-select" onchange="setOrderStatus('${o.id}',this.value)">${Object.entries(orderStatusLabels).map(([k,v])=>`<option value="${k}" ${o.orderStatus===k?'selected':''}>${v()}</option>`).join('')}</select>`;
}

function renderOrders(){
  updateOrderCounters();
  const list=orderFilter==='all'?allOrders:allOrders.filter(o=>(o.orderStatus||'new')===orderFilter);
  $('orders').innerHTML=list.map(o=>{
    const itemTotal=(o.items||[]).reduce((sum,x)=>sum+(Number(x.price)||0)*(Number(x.qty)||1),0);
    const paymentButtons=`<div class="payment-actions">${o.paymentStatus==='receipt_uploaded'?`<button onclick="setPayment('${o.id}','paid')">${at('paymentChecked')}</button><button class="danger" onclick="setPayment('${o.id}','rejected')">${at('reject')}</button>`:''}${o.paymentStatus==='rejected'?`<button onclick="setPayment('${o.id}','paid')">${at('paymentChecked')}</button>`:''}${o.payment==='Оплата при получении'&&o.orderStatus!=='completed'?`<button onclick="setPayment('${o.id}','paid')">${at('paymentReceived')}</button>`:''}${o.orderStatus==='paid'?`<button class="complete-order" onclick="setOrderStatus('${o.id}','completed')">${at('complete')}</button>`:''}</div>`;
    return `<div class="order order-status-${esc(o.orderStatus||'new')}">
      <div class="order-top"><div><b>${at('order')} #${esc(o.id)}</b> <span class="order-status-pill">${(orderStatusLabels[o.orderStatus]||orderStatusLabels.new)()}</span></div><small>${esc(o.date)}</small></div>
      <div class="order-main-actions"><div><p><b>👤 ${esc(o.name)}</b></p><p>📱 <a href="tel:${esc(o.phone)}">${esc(o.phone)}</a></p></div><div class="quick-actions"><a class="button-link" href="tel:${esc(o.phone)}">${at('call')}</a><button onclick="copyPhone('${esc(o.phone)}')">${at('copyPhone')}</button></div></div>
      <p>📦 <b>${esc(o.delivery)}</b>${o.city?' • '+at('city')+': '+esc(o.city):''}${o.branch?' • '+at('branch')+': '+esc(o.branch):''}</p>
      <p>💳 <b>${esc(o.payment)}</b> <span class="order-payment-status">${esc((paymentStatusLabel[o.paymentStatus]||(()=>o.paymentStatus||'—'))())}</span></p>
      ${o.receipt?`<div class="receipt-box"><b>${at('receipt')}:</b><br><a href="${esc(o.receipt)}" target="_blank"><img class="receipt-preview" src="${esc(o.receipt)}" alt="Квитанция"></a></div>`:''}${paymentButtons}
      <div class="order-items">${(o.items||[]).map(x=>`<div class="order-product"><img src="${esc(x.image||'')}" onerror="this.style.display='none'"><div><b>${esc(x.name)}</b><br><small>${at('article')}: ${esc(x.article||'—')} • ${adminLang==='ua'?'Розмір':'Размер'}: ${esc(x.size||'—')} • ${adminLang==='ua'?'Колір':'Цвет'}: ${esc(x.color||'—')} • ${adminLang==='ua'?'Кількість':'Кол-во'}: ${esc(x.qty||1)}${x.price?' • '+Number(x.price).toLocaleString('uk-UA')+' грн':''}</small></div></div>`).join('')}</div>
      <div class="order-total"><b>${at('sum')}</b> ${itemTotal?itemTotal.toLocaleString('uk-UA')+' грн':at('unknownPrice')}</div>
      <div class="order-management"><label>${at('status')} ${orderStatusSelect(o)}</label></div>
      <p class="order-comment">${at('comment')} ${esc(o.comment||'—')}</p>
      <button class="danger" onclick="delOrder('${o.id}')">${at('deleteOrder')}</button>
    </div>`;
  }).join('')||`<p class="soft">${at('emptyOrders')}</p>`;
}

async function loadOrders(){try{allOrders=await api('/api/orders');renderOrders()}catch(e){alert(e.message)}}
window.setOrderStatus=async(id,status)=>{try{await api('/api/orders/status',{method:'POST',body:JSON.stringify({id,status})});await loadOrders()}catch(e){alert(e.message)}};
window.copyPhone=async phone=>{try{await navigator.clipboard.writeText(phone);alert(adminLang==='ua'?'Телефон скопійовано ♡':'Телефон скопирован ♡')}catch{alert((adminLang==='ua'?'Телефон: ':'Телефон: ')+phone)}};
window.setPayment=async(id,status)=>{try{await api('/api/orders/payment',{method:'POST',body:JSON.stringify({id,status})});await loadOrders()}catch(e){alert(e.message)}};
window.delOrder=async id=>{if(confirm(at('deleteOrder')+'?')){await api('/api/orders/delete',{method:'POST',body:JSON.stringify({id})});await loadOrders()}};
$('refreshOrders').onclick=loadOrders;
document.querySelectorAll('.order-filter').forEach(btn=>btn.onclick=()=>{document.querySelectorAll('.order-filter').forEach(x=>x.classList.remove('active'));btn.classList.add('active');orderFilter=btn.dataset.filter;renderOrders()});

function renderSettings(){
  $('settingsForm').innerHTML=`<label>${at('name')}<input name="shopName" value="${esc(settings.shopName)}"></label>
<label>${at('tagline')}<input name="tagline" value="${esc(settings.tagline)}"></label>
<label>${at('phoneElena')}<input name="phone" value="${esc(settings.phone)}"></label>
<label>${at('nameElena')}<input name="phoneName" value="${esc(settings.phoneName)}"></label>
<label class="wide">${at('telegram')}<input name="telegram" value="${esc(settings.telegram)}" placeholder="https://t.me/..."></label>
<label class="wide">${at('telegramChat')}<input name="telegramChatId" value="${esc(settings.telegramChatId||'')}" placeholder="-1001234567890"></label><button type="button" id="telegramTest" class="settings-test">${at('telegramTest')}</button>
<label class="wide">${at('viber')}<input name="viber" value="${esc(settings.viber)}" placeholder="https://invite.viber.com/..."></label>
<label>${at('phoneSvetlana')}<input name="phone2" value="${esc(settings.phone2)}"></label>
<label>${at('nameSvetlana')}<input name="phone2Name" value="${esc(settings.phone2Name)}"></label>
<label>${at('phoneTatiana')}<input name="phone3" value="${esc(settings.phone3||'+380972577772')}"></label>
<label>${at('nameTatiana')}<input name="phone3Name" value="${esc(settings.phone3Name||'Татьяна')}"></label>
<label>${at('phoneOlga')}<input name="phone4" value="${esc(settings.phone4||'+380931980977')}"></label>
<label>${at('nameOlga')}<input name="phone4Name" value="${esc(settings.phone4Name||'Ольга')}"></label>
<label class="wide">${at('address')}<input name="address" value="${esc(settings.address)}"></label>
<label class="wide">${at('delivery')}<textarea name="deliveryNote">${esc(settings.deliveryNote)}</textarea></label>
<label class="wide">${at('pickup')}<textarea name="pickupNote">${esc(settings.pickupNote)}</textarea></label>
<label>${at('bank')}<input name="cardBank" value="${esc(settings.cardBank)}" placeholder="Monobank"></label>
<label>${at('card')}<input name="cardNumber" value="${esc(settings.cardNumber)}" placeholder="0000 0000 0000 0000"></label>
<label>${at('cardName')}<input name="cardName" value="${esc(settings.cardName)}" placeholder="Имя и фамилия"></label>
<label class="wide">${at('novaKey')}<input name="novaposhtaApiKey" value="${esc(settings.novaposhtaApiKey)}"></label>
<button type="submit">${at('save')}</button>`;
  $('telegramTest').onclick=async()=>{try{const f=new FormData($('settingsForm'));settings={...settings,...Object.fromEntries(f.entries()),categories:categories()};await saveAllSettings();await api('/api/telegram/test',{method:'POST',body:'{}'});alert(adminLang==='ua'?'Тест надіслано в Telegram ♡':'Тест отправлен в Telegram ♡')}catch(e){alert(e.message)}};
}
$('settingsForm').onsubmit=async e=>{
  e.preventDefault();
  const f=new FormData(e.target);
  const oldCats=categories();
  settings={...settings,...Object.fromEntries(f.entries()),categories:oldCats};
  await saveAllSettings();alert(adminLang==='ua'?'Налаштування збережено ♡':'Настройки сохранены ♡')
};
$('changePass').onclick=async()=>{
  if($('newPass').value.length<4)return alert(adminLang==='ua'?'Мінімум 4 символи':'Минимум 4 символа');
  await api('/api/password',{method:'POST',body:JSON.stringify({password:$('newPass').value})});
  $('newPass').value='';alert(adminLang==='ua'?'Пароль змінено':'Пароль изменён')
};
check();
