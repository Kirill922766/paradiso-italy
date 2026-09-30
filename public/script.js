let products=[],settings={},cart=[],current=null,selectedSize=null;
const $=id=>document.getElementById(id);
async function api(url,opt={}){const headers={...(opt.headers||{})};if(!(opt.body instanceof FormData)&&opt.body!==undefined)headers['Content-Type']='application/json';let r=await fetch(url,{...opt,headers});return r.json()}
async function init(){products=await api('/api/products');settings=await api('/api/settings');renderCats();render();applySettings();updateCart()}
function applySettings(){
  const setLink=(id,url)=>{const el=$(id);if(!el)return;if(url&&String(url).trim()){el.href=String(url).trim();el.style.display='inline-block';}else{el.style.display='none'}};
  setLink('tgBtn',settings.telegram);setLink('vbBtn',settings.viber);
  document.querySelectorAll('.copy-phone').forEach(b=>b.onclick=async()=>{try{await navigator.clipboard.writeText(b.dataset.phone);const old=b.textContent;b.textContent='Скопировано ✓';setTimeout(()=>b.textContent=old,1200)}catch(e){prompt('Скопируйте номер:',b.dataset.phone)}});
  $('year').textContent=new Date().getFullYear();
}
function renderCats(){let extra=Array.isArray(settings.categories)?settings.categories:[];let cats=['Все',...new Set([...extra,...products.map(p=>p.category)].filter(Boolean))];$('cats').innerHTML=cats.map((c,i)=>`<button class="cat ${i===0?'active':''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('');document.querySelectorAll('.cat').forEach(b=>b.onclick=()=>{document.querySelectorAll('.cat').forEach(x=>x.classList.remove('active'));b.classList.add('active');render(b.dataset.cat)})}
function render(cat='Все'){let ps=products.filter(p=>p.active!==false&&(cat==='Все'||p.category===cat));$('products').innerHTML=ps.map(p=>`<article class="product" onclick="openProduct(${p.id})"><div class="photo"><span class="tag">${esc(p.category)}</span><img src="${p.image}" alt="${esc(p.name)}"></div><div class="pinfo"><div class="pname">${esc(p.name)}</div><div class="pmeta">Артикул: ${esc(p.article)}</div><div class="price">${p.price?Number(p.price).toLocaleString('uk-UA')+' грн':'Цена уточняется'}</div></div></article>`).join('');$('empty').classList.toggle('hidden',ps.length>0)}
window.openProduct=id=>{current=products.find(p=>p.id===id);selectedSize=null;$('modalCat').textContent=current.category+' • Артикул '+current.article;$('modalName').textContent=current.name;$('modalPrice').textContent=current.price?Number(current.price).toLocaleString('uk-UA')+' грн':'Цена уточняется';$('modalDesc').textContent=current.description||'';$('modalPhoto').innerHTML=`<img src="${current.image}" alt="">`;$('sizes').innerHTML=(current.sizes||[]).map(s=>`<button class="size" data-size="${esc(s)}">${esc(s)}</button>`).join('');document.querySelectorAll('.size').forEach(b=>b.onclick=()=>{document.querySelectorAll('.size').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');selectedSize=b.dataset.size;$('sizeHint').textContent='Выбран размер: '+selectedSize});$('productModal').classList.remove('hidden')}
$('addToCart').onclick=()=>{if(!selectedSize){$('sizeHint').textContent='Сначала выберите размер ♡';return}let old=cart.find(x=>x.id===current.id&&x.size===selectedSize);if(old)old.qty++;else cart.push({id:current.id,name:current.name,size:selectedSize,price:current.price||0,image:current.image,qty:1});updateCart();closeAll();$('cartModal').classList.remove('hidden')};
function updateCart(){$('cartCount').textContent=cart.reduce((a,x)=>a+x.qty,0);$('cartItems').innerHTML=cart.length?cart.map((x,i)=>`<div class="cart-line"><img src="${x.image}"><div><b>${esc(x.name)}</b><br><small>Размер ${esc(x.size)} • ${x.price?Number(x.price).toLocaleString('uk-UA')+' грн':'цена уточняется'} × ${x.qty}</small></div><button class="remove" onclick="removeCart(${i})">Удалить</button></div>`).join(''):'<p class="soft">Корзина пока пустая ♡</p>';let total=cart.reduce((a,x)=>a+(Number(x.price)||0)*x.qty,0);$('cartTotal').textContent=total?total.toLocaleString('uk-UA')+' грн':'Цена уточняется';$('cartTotalCount').textContent=cart.length?'('+cart.reduce((a,x)=>a+x.qty,0)+')':'';$('checkoutBtn').disabled=!cart.length}
window.removeCart=i=>{cart.splice(i,1);updateCart()};
$('cartBtn').onclick=()=>{$('cartModal').classList.remove('hidden')};
$('checkoutBtn').onclick=()=>{if(!cart.length)return;closeAll();$('checkoutModal').classList.remove('hidden');$('orderStatus').textContent=''};
document.querySelectorAll('input[name="delivery"]').forEach(r=>r.onchange=()=>{
  const np=r.value==='Новая Почта' && r.checked;
  if(np){$('npFields').classList.remove('hidden');$('city').required=true;$('branch').required=true}
  else if(r.checked){$('npFields').classList.add('hidden');$('city').required=false;$('branch').required=false;$('city').value='';$('branch').value=''}
});
$('checkoutForm').onsubmit=async e=>{
  e.preventDefault();
  let f=new FormData(e.target);
  let delivery=f.get('delivery');
  let order={
    name:f.get('name'),phone:f.get('phone'),delivery,
    city:delivery==='Новая Почта'?f.get('city'):'',
    branch:delivery==='Новая Почта'?f.get('branch'):'',
    payment:f.get('payment'),comment:f.get('comment'),
    items:cart.map(x=>({id:x.id,article:(products.find(p=>p.id===x.id)||{}).article||'',name:x.name,size:x.size,price:x.price,qty:x.qty,image:x.image}))
  };
  let d=await api('/api/order',{method:'POST',body:JSON.stringify(order)});
  if(d.ok){
    $('checkoutForm').reset();$('npFields').classList.add('hidden');
    cart=[];updateCart();closeAll();
    $('successOrder').textContent='Номер заказа: #'+d.id;
    $('successModal').classList.remove('hidden');
  }else alert('Не удалось оформить заказ. Попробуйте ещё раз.');
};
document.querySelector('[data-close-success]').onclick=()=>{$('successModal').classList.add('hidden')};

function closeAll(){document.querySelectorAll('.modal').forEach(x=>x.classList.add('hidden'))}
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=closeAll);document.querySelectorAll('.shade').forEach(x=>x.onclick=closeAll);document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAll()});
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]) )}
init();
