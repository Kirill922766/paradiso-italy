let products=[],settings={},cart=[],favorites=[],current=null,selectedSize=null,selectedColor=null;
let currentCategory='Все',specialFilter='all',lang=localStorage.getItem('paradiso_lang')||'ru';
const $=id=>document.getElementById(id);
const I18N={
 ru:{
  navCatalog:'Каталог',navAbout:'О нас',navContacts:'Контакты',cart:'Корзина',heroTiny:'PARADISO ITALY • ОПТ / РОЗНИЦА',
  heroTitle:'Красивые вещи',heroSubtitle:'с итальянским настроением.',heroText:'Одежда для женщин, которую приятно выбирать, примерять и носить каждый день. Заходите в наш магазин на 7 км или оформляйте заказ онлайн.',
  heroCatalog:'Смотреть одежду',heroFind:'Как нас найти',collection:'КОЛЛЕКЦИЯ',ourItems:'Наши вещи',
  catalogHint:'Нажмите на товар, чтобы посмотреть детали и выбрать размер.',all:'Все',new:'🆕 Новинки',hit:'⭐ Хиты',favorites:'♡ Избранное',
  color:'Цвет',size:'Размер',addToCart:'Добавить в корзину 🛍',chooseSize:'Выберите размер',chooseColor:'Выберите цвет',addedTitle:'Товар добавлен в корзину ✓',continueShopping:'Продолжить покупки',goToCheckout:'Оформить заказ',cartItemsAdded:'Товар добавлен. Можно продолжить покупки или оформить заказ.',
  yourOrder:'ВАШ ЗАКАЗ',total:'Итого:',checkout:'Перейти к оформлению',checkoutTitleSmall:'ОФОРМЛЕНИЕ',whereOrder:'Куда отправить заказ?',
  deliveryHow:'Как получить заказ?',pickup:'Самовывоз',nova:'Новая Почта',paymentMethod:'Способ оплаты',payOnPickup:'💵 Оплата при получении',payCard:'💳 Полная оплата на карту',
  placeOrder:'Оформить заказ 🛍',successTitle:'Заказ успешно оформлен!',successText:'Спасибо! Мы получили ваш заказ и свяжемся с вами для подтверждения.',backShop:'Вернуться в магазин',
  pricePending:'Цена уточняется',remove:'Удалить',emptyCart:'Корзина пока пустая ♡',emptyFavorites:'В избранном пока ничего нет ♡',selectSize:'Сначала выберите размер ♡',selectColor:'Сначала выберите цвет ♡',
  selectedSize:'Выбран размер: ',selectedColor:'Выбран цвет: ',article:'Артикул: ',colorLabel:'Цвет ',sizeLabel:'Размер ',qty:'Кол-во: ',sale:'Акция',newBadge:'Новинка',hitBadge:'Хит',
  noProducts:'Пока ничего не найдено ♡',orderName:'Имя и фамилия получателя',comment:'Комментарий к заказу',receipt:'Фото квитанции об оплате',
  npCity:'Начните вводить город',npBranch:'Выберите отделение',npHint:'Начните вводить город — список подгрузится.',paymentCardHint:'Полная оплата на карту',
  copy:'Скопировано ✓',benefitWholesale:'Опт и розница',benefitItalian:'Итальянская одежда',benefitAddress:'7 км, Одесса',benefitHelp:'Поможем подобрать',heroNote:'нежно • удобно • по-итальянски ♡',aboutTitle:'Немного Италии<br>в вашем гардеробе.',aboutText1:'Мы работаем в формате <b>опт / розница</b>. Если не знаете, какой размер выбрать — напишите или позвоните нам, и мы поможем.',aboutText2:'А если вы приехали на 7 км лично, будем рады показать модели вживую.',contactTiny:'ЖДЁМ ВАС',wholesaleRetail:'Опт / Розница',adminLogin:'Вход для администратора'
 },
 ua:{
  navCatalog:'Каталог',navAbout:'Про нас',navContacts:'Контакти',cart:'Кошик',heroTiny:'PARADISO ITALY • ОПТ / РОЗДРІБ',
  heroTitle:'Красиві речі',heroSubtitle:'з італійським настроєм.',heroText:'Жіночий одяг, який приємно обирати, приміряти та носити щодня. Завітайте до нашого магазину на 7 км або оформлюйте замовлення онлайн.',
  heroCatalog:'Дивитися одяг',heroFind:'Як нас знайти',collection:'КОЛЕКЦІЯ',ourItems:'Наші речі',
  catalogHint:'Натисніть на товар, щоб переглянути деталі та обрати розмір.',all:'Усі',new:'🆕 Новинки',hit:'⭐ Хіти',favorites:'♡ Обране',
  color:'Колір',size:'Розмір',addToCart:'Додати до кошика 🛍',chooseSize:'Оберіть розмір',chooseColor:'Оберіть колір',addedTitle:'Товар додано до кошика ✓',continueShopping:'Продовжити покупки',goToCheckout:'Оформити замовлення',cartItemsAdded:'Товар додано. Можна продовжити покупки або оформити замовлення.',
  yourOrder:'ВАШЕ ЗАМОВЛЕННЯ',total:'Разом:',checkout:'Перейти до оформлення',checkoutTitleSmall:'ОФОРМЛЕННЯ',whereOrder:'Куди відправити замовлення?',
  deliveryHow:'Як отримати замовлення?',pickup:'Самовивіз',nova:'Нова Пошта',paymentMethod:'Спосіб оплати',payOnPickup:'💵 Оплата при отриманні',payCard:'💳 Повна оплата на картку',
  placeOrder:'Оформити замовлення 🛍',successTitle:'Замовлення успішно оформлено!',successText:'Дякуємо! Ми отримали ваше замовлення та зв’яжемося з вами для підтвердження.',backShop:'Повернутися до магазину',
  pricePending:'Ціна уточнюється',remove:'Видалити',emptyCart:'Кошик поки порожній ♡',emptyFavorites:'В обраному поки нічого немає ♡',selectSize:'Спочатку оберіть розмір ♡',selectColor:'Спочатку оберіть колір ♡',
  selectedSize:'Обраний розмір: ',selectedColor:'Обраний колір: ',article:'Артикул: ',colorLabel:'Колір ',sizeLabel:'Розмір ',qty:'Кількість: ',sale:'Акція',newBadge:'Новинка',hitBadge:'Хіт',
  noProducts:'Поки нічого не знайдено ♡',orderName:'Ім’я та прізвище отримувача',comment:'Коментар до замовлення',receipt:'Фото квитанції про оплату',
  npCity:'Почніть вводити місто',npBranch:'Оберіть відділення',npHint:'Почніть вводити місто — список завантажиться.',paymentCardHint:'Повна оплата на картку',
  copy:'Скопійовано ✓',benefitWholesale:'Опт і роздріб',benefitItalian:'Італійський одяг',benefitAddress:'7 км, Одеса',benefitHelp:'Допоможемо підібрати',heroNote:'ніжно • зручно • по-італійськи ♡',aboutTitle:'Трохи Італії<br>у вашому гардеробі.',aboutText1:'Ми працюємо у форматі <b>опт / роздріб</b>. Якщо не знаєте, який розмір обрати — напишіть або зателефонуйте нам, і ми допоможемо.',aboutText2:'А якщо ви приїхали на 7 км особисто, будемо раді показати моделі наживо.',contactTiny:'ЧЕКАЄМО НА ВАС',wholesaleRetail:'Опт / Роздріб',adminLogin:'Вхід для адміністратора'
 }
};
const t=k=>(I18N[lang]&&I18N[lang][k])||I18N.ru[k]||k;
async function api(url,opt={}){const headers={...(opt.headers||{})};if(!(opt.body instanceof FormData)&&opt.body!==undefined)headers['Content-Type']='application/json';let r=await fetch(url,{...opt,headers});let d=await r.json();return d}
function loadLocal(){
 try{cart=JSON.parse(localStorage.getItem('paradiso_cart')||'[]');if(!Array.isArray(cart))cart=[]}catch{cart=[]}
 try{favorites=JSON.parse(localStorage.getItem('paradiso_favorites')||'[]').map(Number)}catch{favorites=[]}
}
function saveLocal(){localStorage.setItem('paradiso_cart',JSON.stringify(cart));localStorage.setItem('paradiso_favorites',JSON.stringify(favorites))}
async function init(){loadLocal();products=await api('/api/products');settings=await api('/api/settings');applyLanguage();renderCats();renderSpecialFilters();render();applySettings();updateCart();updateFavorites();bindCheckout()}
function applyLanguage(){
 document.documentElement.lang=lang;
 document.querySelectorAll('[data-i18n]').forEach(el=>{const k=el.dataset.i18n;if(I18N[lang][k])el.innerHTML=t(k)});
 const ru=$('langRu'),ua=$('langUa');if(ru&&ua){ru.classList.toggle('active',lang==='ru');ua.classList.toggle('active',lang==='ua')}
 const name=$('checkoutForm')?.querySelector('[name=\"name\"]');if(name)name.placeholder=t('orderName');
 const comment=$('checkoutForm')?.querySelector('[name=\"comment\"]');if(comment)comment.placeholder=t('comment');
 const receipt=$('receiptBox');if(receipt){const input=receipt.querySelector('input');receipt.childNodes.forEach(n=>{if(n.nodeType===3)n.textContent=' '+t('receipt')});if(input)input.setAttribute('aria-label',t('receipt'))}
 const city=$('city'),branch=$('branch');if(city)city.placeholder=t('npCity');if(branch)branch.placeholder=t('npBranch');
 const npHint=$('npHint');if(npHint&&!npHint.textContent.includes('API'))npHint.textContent=t('npHint');
 if($('payment')){const opts=$('payment').options;if(opts[0])opts[0].textContent=t('payOnPickup');if(opts[1])opts[1].textContent=t('payCard')}
 if($('pickupNote'))$('pickupNote').textContent=((lang==='ua'&&(!settings.pickupNote||/Самовывоз|Розовая/.test(settings.pickupNote)))?'Самовивіз: 7 км, Розова 1315–1316. Прийдіть до магазину та заберіть замовлення після підтвердження менеджером.':(lang==='ru'&&(!settings.pickupNote||/Самовивіз|Розова/.test(settings.pickupNote))?'Самовывоз: 7 км, Розовая 1315–1316. Приходите в магазин и заберите заказ после подтверждения менеджером.':settings.pickupNote));
 if(current)openProduct(current.id,true);
 renderCats();renderSpecialFilters();render(currentCategory);updateCart();
}
$('langRu')?.addEventListener('click',()=>{lang='ru';localStorage.setItem('paradiso_lang',lang);applyLanguage()});
$('langUa')?.addEventListener('click',()=>{lang='ua';localStorage.setItem('paradiso_lang',lang);applyLanguage()});
function normalizeUrl(url){let v=String(url||'').trim();if(v&&!/^https?:\/\//i.test(v))v='https://'+v;return v}
function applySettings(){
 const setLink=(id,url)=>{const el=$(id);const v=normalizeUrl(url);if(v)el.href=v;else if(el)el.style.display='none'};
 setLink('tgBtn',settings.telegram);setLink('vbBtn',settings.viber);
 const contacts=[['contactName1','contactPhone1',settings.phoneName,settings.phone],['contactName2','contactPhone2',settings.phone2Name,settings.phone2],['contactName3','contactPhone3',settings.phone3Name,settings.phone3],['contactName4','contactPhone4',settings.phone4Name,settings.phone4]];
 contacts.forEach(([nameId,phoneId,name,phone])=>{const n=$(nameId),b=$(phoneId);if(n)n.textContent=name||'';if(b){b.textContent=phone||'';b.dataset.phone=phone||'';}});
 document.querySelectorAll('.copy-phone').forEach(b=>b.onclick=async()=>{try{await navigator.clipboard.writeText(b.dataset.phone);const old=b.textContent;b.textContent=t('copy');setTimeout(()=>b.textContent=old,1200)}catch(e){prompt('Скопируйте номер:',b.dataset.phone)}});
 $('year').textContent=new Date().getFullYear();
 if($('pickupNote'))$('pickupNote').textContent=((lang==='ua'&&(!settings.pickupNote||/Самовывоз|Розовая/.test(settings.pickupNote)))?( 'Самовивіз: 7 км, Розова 1315–1316. Прийдіть до магазину та заберіть замовлення після підтвердження менеджером.'):(lang==='ru'&&(!settings.pickupNote||/Самовивіз|Розова/.test(settings.pickupNote))?('Самовывоз: 7 км, Розовая 1315–1316. Приходите в магазин и заберите заказ после подтверждения менеджером.'):settings.pickupNote));
 if($('cardInfo'))$('cardInfo').innerHTML=cardHtml();
}
function cardHtml(){const n=String(settings.cardNumber||'').replace(/(\d{4})(?=\d)/g,'$1 ');return `<b>${esc(t('paymentCardHint'))}</b><br>${n||'Номер карты будет указан менеджером'}${settings.cardName?`<br>${esc(settings.cardName)}`:''}${settings.cardBank?`<br><small>${esc(settings.cardBank)}</small>`:''}`}

function translateCategory(c){
 const map={
  'Костюмы':['Костюмы','Костюми'],'Костюми':['Костюмы','Костюми'],
  'Платья':['Платья','Сукні'],'Плаття':['Платья','Сукні'],
  'Джинсы':['Джинсы','Джинси'],'Джинси':['Джинсы','Джинси'],
  'Блузки':['Блузки','Блузки'],'Брюки':['Брюки','Штани'],'Штани':['Брюки','Штани'],
  'Куртки':['Куртки','Куртки'],'Юбки':['Юбки','Спідниці'],'Спідниці':['Юбки','Спідниці'],
  'Футболки':['Футболки','Футболки'],'Свитера':['Свитера','Светри'],'Светри':['Свитера','Светри'],
  'Аксессуары':['Аксессуары','Аксесуари'],'Аксесуари':['Аксессуары','Аксесуари']
 }; const pair=map[String(c)];return pair?pair[lang==='ua'?1:0]:c;
}
function renderCats(){
 let extra=Array.isArray(settings.categories)?settings.categories:[];let cats=['Все',...new Set([...extra,...products.map(p=>p.category)].filter(Boolean))];
 $('cats').innerHTML=cats.map((c,i)=>`<button class="cat ${c===currentCategory?'active':''}" data-cat="${esc(c)}">${esc(c==='Все'?t('all'):translateCategory(c))}</button>`).join('');
 document.querySelectorAll('.cat').forEach(b=>b.onclick=()=>{currentCategory=b.dataset.cat;specialFilter='all';renderCats();renderSpecialFilters();render(currentCategory)})
}
function renderSpecialFilters(){
 const el=$('smartFilters');if(!el)return;
 const defs=[['all',t('all')],['new',t('new')],['hit',t('hit')],['favorites',t('favorites')]];
 el.innerHTML=defs.map(([k,v])=>`<button class="smart-filter ${specialFilter===k?'active':''}" data-special="${k}">${v}</button>`).join('');
 el.querySelectorAll('.smart-filter').forEach(b=>b.onclick=()=>{specialFilter=b.dataset.special;currentCategory='Все';renderCats();renderSpecialFilters();render()});
}
function priceHtml(p,modal=false){
 const price=Number(p.price||0),old=Number(p.oldPrice||0);
 if(price&&old&&old>price)return modal?`<div class="modal-price-row"><span class="modal-old-price">${old.toLocaleString('uk-UA')} грн</span><strong class="price">${price.toLocaleString('uk-UA')} грн</strong></div>`:`<div class="price-row"><span class="old-price">${old.toLocaleString('uk-UA')} грн</span><span class="new-price">${price.toLocaleString('uk-UA')} грн</span></div>`;
 return price?(modal?`${price.toLocaleString('uk-UA')} грн`:`<div class="price">${price.toLocaleString('uk-UA')} грн</div>`):`<div class="price">${esc(t('pricePending'))}</div>`;
}
function isFavorite(id){return favorites.includes(Number(id))}
function toggleFavorite(id){
 id=Number(id);favorites=isFavorite(id)?favorites.filter(x=>x!==id):[...favorites,id];saveLocal();updateFavorites();render(currentCategory);
}
function updateFavorites(){const n=$('favCount');if(n)n.textContent=favorites.length}
function filteredProducts(){
 let ps=products.filter(p=>p.active!==false&&(currentCategory==='Все'||p.category===currentCategory));
 if(specialFilter==='new')ps=ps.filter(p=>p.isNew);
 if(specialFilter==='hit')ps=ps.filter(p=>p.isHit);
 if(specialFilter==='favorites')ps=ps.filter(p=>isFavorite(p.id));
 return ps;
}
function render(){
 const ps=filteredProducts();
 $('products').innerHTML=ps.map(p=>{
  const badges=[p.isNew?`<span class="product-badge">${esc(t('newBadge'))}</span>`:'',p.isHit?`<span class="product-badge">⭐ ${esc(t('hitBadge'))}</span>`:'',Number(p.oldPrice)>Number(p.price)&&Number(p.price)>0?`<span class="product-badge sale">${esc(t('sale'))}</span>`:''].join('');
  return `<article class="product" onclick="openProduct(${p.id})"><button class="favorite-btn ${isFavorite(p.id)?'active':''}" onclick="event.stopPropagation();toggleFavorite(${p.id})" aria-label="${esc(t('favorites'))}">${isFavorite(p.id)?'♥':'♡'}</button><div class="photo"><div class="badge-row">${badges}</div><img src="${esc(imageSrc(p.image))}" alt="${esc(p.name)}" onerror="this.onerror=null;this.closest('.photo')?.classList.add('image-error');this.removeAttribute('src')"></div><div class="pinfo"><div class="pname">${esc(p.name)}</div><div class="pmeta">${esc(t('article'))} ${esc(p.article)}</div>${priceHtml(p)}</div></article>`
 }).join('')||`<p class="empty">${esc(specialFilter==='favorites'?t('emptyFavorites'):t('noProducts'))}</p>`;
 $('empty').classList.toggle('hidden',ps.length>0);
}
window.toggleFavorite=toggleFavorite;
$('favBtn')?.addEventListener('click',()=>{specialFilter='favorites';currentCategory='Все';renderCats();renderSpecialFilters();render()});
window.openProduct=(id,reopen=false)=>{
 current=products.find(p=>p.id===id);if(!current)return;if(!reopen){selectedSize=null;selectedColor=null}
 $('modalCat').textContent=current.category+' • '+t('article')+' '+current.article;$('modalName').textContent=current.name;$('modalPrice').innerHTML=priceHtml(current,true);$('modalDesc').textContent=current.description||'';
 const imgs=(current.images&&current.images.length?current.images:[current.image]).filter(Boolean);
 $('modalPhoto').innerHTML=imgs[0]?`<img src="${esc(imageSrc(imgs[0]))}" alt="${esc(current.name)}" onerror="this.style.display='none'">`:'';
 $('modalGallery').innerHTML=imgs.map((im,i)=>`<button class="gallery-thumb ${i===0?'selected':''}" data-i="${i}"><img src="${esc(imageSrc(im))}" alt=""></button>`).join('');
 document.querySelectorAll('.gallery-thumb').forEach(b=>b.onclick=()=>{document.querySelectorAll('.gallery-thumb').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');$('modalPhoto').innerHTML=`<img src="${esc(imageSrc(imgs[Number(b.dataset.i)]))}" alt="${esc(current.name)}" onerror="this.style.display='none'">`});
 const colors=Array.isArray(current.colors)?current.colors:[];$('colors').innerHTML=colors.length?colors.map((c,i)=>`<button class="color-choice ${c.available===false?'disabled':''} ${selectedColor===c.name?'selected':''}" data-color-index="${i}" ${c.available===false?'disabled':''}>${esc(c.name)}</button>`).join(''):`<span class="soft">${esc(lang==='ua'?'Колір не вказано':'Цвет не указан')}</span>`;
 document.querySelectorAll('.color-choice').forEach(b=>b.onclick=()=>{document.querySelectorAll('.color-choice').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');selectedColor=colors[Number(b.dataset.colorIndex)].name;$('sizeHint').textContent=t('selectedColor')+selectedColor});
 const sizes=current.sizes||[],stock=current.sizeStock||{};$('sizes').innerHTML=sizes.map(s=>`<button class="size ${stock[s]===false?'disabled':''} ${selectedSize===s?'selected':''}" data-size="${esc(s)}" ${stock[s]===false?'disabled':''}>${esc(s)}</button>`).join('');
 document.querySelectorAll('.size').forEach(b=>b.onclick=()=>{document.querySelectorAll('.size').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');selectedSize=b.dataset.size;$('sizeHint').textContent=t('selectedSize')+selectedSize+(selectedColor?' • '+selectedColor:'')});
 $('sizeHint').textContent=selectedSize?t('selectedSize')+selectedSize+(selectedColor?' • '+selectedColor:''):(selectedColor?t('selectedColor')+selectedColor:t('chooseSize'));
 if(!reopen){$('productModal').classList.remove('hidden');document.body.classList.add('modal-open')}
}
$('addToCart').onclick=()=>{
 if(!selectedSize){$('sizeHint').textContent=t('selectSize');return}
 if((current.colors||[]).some(c=>c.available!==false)&&!selectedColor){$('sizeHint').textContent=t('selectColor');return}
 let old=cart.find(x=>x.id===current.id&&x.size===selectedSize&&x.color===selectedColor);
 if(old)old.qty++;else cart.push({id:current.id,name:current.name,size:selectedSize,color:selectedColor||'',price:current.price||0,oldPrice:current.oldPrice||0,image:(current.images&&current.images[0])||current.image,qty:1});
 saveLocal();updateCart();
 closeAll();
 $('cartAddedModal').classList.remove('hidden');
 document.body.classList.add('modal-open');
};
function updateCart(){
 $('cartCount').textContent=cart.reduce((a,x)=>a+x.qty,0);
 $('cartItems').innerHTML=cart.length?cart.map((x,i)=>`<div class="cart-line"><img src="${esc(imageSrc(x.image))}" onerror="this.onerror=null;this.style.display='none'"><div><b>${esc(x.name)}</b><br><small>${esc(t('sizeLabel'))}${esc(x.size)}${x.color?' • '+esc(t('colorLabel'))+esc(x.color):''} • ${x.price?Number(x.price).toLocaleString('uk-UA')+' грн':esc(t('pricePending'))} × ${x.qty}</small></div><button class="remove" onclick="removeCart(${i})">${esc(t('remove'))}</button></div>`).join(''):`<p class="soft">${esc(t('emptyCart'))}</p>`;
 let total=cart.reduce((a,x)=>a+(Number(x.price)||0)*x.qty,0);$('cartTotal').textContent=total?total.toLocaleString('uk-UA')+' грн':t('pricePending');$('cartTotalCount').textContent=cart.length?'('+cart.reduce((a,x)=>a+x.qty,0)+')':'';$('checkoutBtn').disabled=!cart.length;
}
window.removeCart=i=>{cart.splice(i,1);saveLocal();updateCart()};$('cartBtn').onclick=()=>{$('cartModal').classList.remove('hidden');document.body.classList.add('modal-open')};$('checkoutBtn').onclick=()=>{if(!cart.length)return;closeAll();$('checkoutModal').classList.remove('hidden');document.body.classList.add('modal-open');$('orderStatus').textContent=''};
$('continueShoppingBtn').onclick=()=>{closeAll()};
$('addedCheckoutBtn').onclick=()=>{
 closeAll();
 if(!cart.length)return;
 $('checkoutModal').classList.remove('hidden');
 document.body.classList.add('modal-open');
 $('orderStatus').textContent='';
};
function bindCheckout(){
 document.querySelectorAll('input[name="delivery"]').forEach(r=>r.onchange=()=>toggleDelivery(r.value==='Новая Почта'&&r.checked));
 $('payment').onchange=togglePayment;$('city').addEventListener('input',debounce(loadBranches,350));$('checkoutForm').onsubmit=submitOrder;toggleDelivery(false);togglePayment()
}
function toggleDelivery(np){
 if(np){$('npFields').classList.remove('hidden');$('city').required=true;$('branch').required=true;loadCities('');$('payment').value='Перевод на карту'}
 else{$('npFields').classList.add('hidden');$('city').required=false;$('branch').required=false;$('city').value='';$('branch').value='';if(!$('payment').value||$('payment').value==='Перевод на карту')$('payment').value='Оплата при получении'}
 $('pickupNote').classList.toggle('hidden',np);togglePayment()
}
function togglePayment(){const card=$('payment').value==='Перевод на карту';$('cardBox').classList.toggle('hidden',!card);$('receiptBox').classList.toggle('hidden',!card);$('receipt').required=card;if(card)$('cardInfo').innerHTML=cardHtml()}
async function loadCities(q){try{const d=await api('/api/novaposhta?mode=cities&q='+encodeURIComponent(q));const list=$('cityList');list.innerHTML=(d.cities||[]).map(x=>`<option value="${esc(x.name)}">`).join('');if(d.needKey)$('npHint').textContent=lang==='ua'?'Для живого списку міст і відділень додайте API-ключ Нової Пошти в адмінці.':'Для живого списка городов и отделений добавьте API-ключ Новой Пошты в админке.';else $('npHint').textContent=t('npHint')}catch(e){}}
async function loadBranches(){const city=$('city').value.trim();if(city.length<2)return;$('branch').value='';try{const d=await api('/api/novaposhta?mode=branches&q='+encodeURIComponent(city));$('branchList').innerHTML=(d.branches||[]).map(x=>`<option value="${esc(x.name)}">`).join('');if(d.needKey)$('npHint').textContent=lang==='ua'?'Для списку відділень потрібен API-ключ Нової Пошти в адмінці.':'Для списка отделений нужен API-ключ Новой Пошты в админке.';else $('npHint').textContent=(d.branches||[]).length?(lang==='ua'?'Оберіть відділення зі списку.':'Выберите отделение из подсказок.'):(lang==='ua'?'Відділення не знайдені — уточніть місто.':'Отделения не найдены — уточните город.')}catch(e){}}
function debounce(fn,ms){let timer;return(...a)=>{clearTimeout(timer);timer=setTimeout(()=>fn(...a),ms)}}
async function submitOrder(e){
 e.preventDefault();let f=new FormData(e.target);let name=String(f.get('name')||'').trim().replace(/\s+/g,' '),phone=String(f.get('phone')||'').replace(/[\s()\-]/g,'');
 if(!/^[A-Za-zА-Яа-яЁёІіЇїЄєҐґ'’\-]{2,}(?:\s+[A-Za-zА-Яа-яЁёІіЇїЄєҐґ'’\-]{2,})+$/.test(name))return showOrderError(lang==='ua'?'Введіть ім’я та прізвище отримувача.':'Введите имя и фамилию получателя.');
 if(!/^\+380\d{9}$/.test(phone))return showOrderError(lang==='ua'?'Введіть номер телефону у форматі +380XXXXXXXXX.':'Введите номер телефона в формате +380XXXXXXXXX.');
 let delivery=f.get('delivery');if(delivery==='Новая Почта'&&(!f.get('city')||!f.get('branch')))return showOrderError(lang==='ua'?'Оберіть місто та відділення Нової Пошти.':'Выберите город и отделение Новой Пошты.');
 let receipt='';if(f.get('payment')==='Перевод на карту'){const file=$('receipt').files?.[0];if(!file)return showOrderError(lang==='ua'?'Завантажте фото квитанції про оплату.':'Загрузите фото квитанции об оплате.');try{receipt=await compressReceipt(file)}catch(err){return showOrderError(err.message)}}
 let order={name,phone,delivery,city:delivery==='Новая Почта'?f.get('city'):'',branch:delivery==='Новая Почта'?f.get('branch'):'',payment:f.get('payment'),comment:f.get('comment'),receipt,items:cart.map(x=>({id:x.id,article:(products.find(p=>p.id===x.id)||{}).article||'',name:x.name,size:x.size,color:x.color||'',price:x.price,qty:x.qty,image:x.image}))};
 let d=await api('/api/order',{method:'POST',body:JSON.stringify(order)});if(d.ok){e.target.reset();$('npFields').classList.add('hidden');$('cardBox').classList.add('hidden');$('receiptBox').classList.add('hidden');$('pickupNote').classList.remove('hidden');cart=[];saveLocal();updateCart();closeAll();$('successOrder').textContent=(lang==='ua'?'Номер замовлення: #':'Номер заказа: #')+d.id;$('successModal').classList.remove('hidden');document.body.classList.add('modal-open')}else showOrderError(d.error||'Не удалось оформить заказ.')}
function showOrderError(msg){$('orderStatus').textContent=msg;$('orderStatus').className='error';$('orderStatus').classList.remove('hidden')}
async function compressReceipt(file){if(!file.type.startsWith('image/'))throw new Error('Загрузите фото квитанции.');const img=await new Promise((res,rej)=>{const x=new Image();x.onload=()=>res(x);x.onerror=()=>rej(new Error('Не удалось прочитать фото.'));x.src=URL.createObjectURL(file)});const max=1200,scale=Math.min(1,max/Math.max(img.width,img.height));const c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.width*scale));c.height=Math.max(1,Math.round(img.height*scale));c.getContext('2d').drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(img.src);let data=c.toDataURL('image/jpeg',.72);if(data.length>360000)data=c.toDataURL('image/jpeg',.55);if(data.length>480000)throw new Error('Фото квитанции слишком большое. Выберите другое фото.');return data}
document.querySelector('[data-close-success]').onclick=()=>{$('successModal').classList.add('hidden');document.body.classList.remove('modal-open')};function closeAll(){document.querySelectorAll('.modal').forEach(x=>x.classList.add('hidden'));document.body.classList.remove('modal-open')}document.querySelectorAll('[data-close]').forEach(b=>b.onclick=closeAll);document.querySelectorAll('.shade').forEach(x=>x.onclick=closeAll);document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAll()});function imageSrc(value){const v=String(value||'').trim();if(!v)return '';if(/^(data:|https?:|blob:|\/)/i.test(v))return v;return '/'+v.replace(/^\/+/, '');}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}init();
