// ===== Helpers =====
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const currency = (n) => Number(n).toFixed(2);

const LS_PRODUCTS = 'store.products';
const LS_CART = 'store.cart';

// Seed demo products if none
function seedProducts() {
  const exists = JSON.parse(localStorage.getItem(LS_PRODUCTS) || '[]');
  if (exists.length) return;
  const demo = [
    { id: crypto.randomUUID(), name: 'قميص قطني', price: 19.99, image: 'https://images.unsplash.com/photo-1520974699644-0a56c1a8a9bf?q=80&w=800&auto=format&fit=crop', desc:'قميص مريح 100% قطن.' },
    { id: crypto.randomUUID(), name: 'حقيبة يد', price: 34.50, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop', desc:'حقيبة أنيقة للاستخدام اليومي.' },
    { id: crypto.randomUUID(), name: 'ساعة كلاسيكية', price: 59.00, image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=800&auto=format&fit=crop', desc:'ساعة مقاومة للماء.' },
    { id: crypto.randomUUID(), name: 'سماعات لاسلكية', price: 29.90, image: 'https://images.unsplash.com/photo-1518441902113-c1d3d7260f83?q=80&w=800&auto=format&fit=crop', desc:'صوت نقي وبطارية تدوم.' },
  ];
  localStorage.setItem(LS_PRODUCTS, JSON.stringify(demo));
}



// تعديل دالة addToCart
function addToCart(productId) {
    const products = getProducts();
    const product = products.find(p => p.id === productId);
    
    if (product) {
        // التتبع
        trackEvent('add_to_cart', {
            productId: productId,
            productName: product.name,
            price: product.price
        });
        
        // الكود الأصلي...
    }
}

// في دالة إتمام الطلب
function completeOrder(orderData) {
    trackEvent('purchase', {
        orderId: orderData.id,
        total: orderData.total,
        itemsCount: orderData.items.length
    });
    
    // الكود الأصلي...
}




function getProducts(){ return JSON.parse(localStorage.getItem(LS_PRODUCTS) || '[]'); }
function saveCart(c){ localStorage.setItem(LS_CART, JSON.stringify(c)); updateCartCount(); }
function getCart(){ return JSON.parse(localStorage.getItem(LS_CART) || '[]'); }

function addToCart(p){
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === p.id);
  if (idx > -1) cart[idx].qty += 1;
  else cart.push({ id: p.id, name: p.name, price: p.price, qty: 1 });
  saveCart(cart);
  openCart();
  renderCart();
}

function removeFromCart(id){
  let cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
  renderCart();
}

function changeQty(id, delta){
  let cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  saveCart(cart);
  renderCart();
}

function cartTotal(){
  return getCart().reduce((s, i) => s + i.price * i.qty, 0);
}

function updateCartCount(){
  const count = getCart().reduce((s, i) => s + i.qty, 0);
  const el = $('#cartCount'); if (el) el.textContent = count;
}

// ===== UI Rendering =====
function renderProducts(){
  const wrap = $('#products');
  const products = getProducts();
  if (!wrap) return;
  wrap.innerHTML = products.map(p => `
    <div class="card product">
      <img loading="lazy" src="${p.image || 'https://placehold.co/600x400?text=Product'}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p class="muted">${p.desc || ''}</p>
      <div class="row">
        <span class="price">$${currency(p.price)}</span>
        <button class="btn primary" data-add="${p.id}">أضف للسلة</button>
      </div>
    </div>
  `).join('');

  // bind buttons
  wrap.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-add');
      const p = getProducts().find(x => x.id === id);
      if (p) addToCart(p);
    });
  });
}

function renderCart(){
  const body = $('#cartItems');
  const totalEl = $('#cartTotal');
  if (!body || !totalEl) return;
  const cart = getCart();
  if (!cart.length){
    body.innerHTML = '<p class="muted">السلة فارغة.</p>';
  } else {
    body.innerHTML = cart.map(i => `
      <div class="row">
        <div>
          <strong>${i.name}</strong><br>
          <small class="muted">$${currency(i.price)} × ${i.qty}</small>
        </div>
        <div class="row" style="gap:.3rem">
          <button class="btn" data-dec="${i.id}">−</button>
          <button class="btn" data-inc="${i.id}">+</button>
          <button class="btn danger ghost" data-del="${i.id}">حذف</button>
        </div>
      </div>
    `).join('');
  }
  totalEl.textContent = '$' + currency(cartTotal());

  body.querySelectorAll('[data-inc]').forEach(b=>b.onclick=()=>changeQty(b.getAttribute('data-inc'), +1));
  body.querySelectorAll('[data-dec]').forEach(b=>b.onclick=()=>changeQty(b.getAttribute('data-dec'), -1));
  body.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>removeFromCart(b.getAttribute('data-del')));
}

// Drawer events
function openCart(){ $('#cartDrawer')?.classList.add('open'); $('#overlay')?.classList.add('show'); }
function closeCart(){ $('#cartDrawer')?.classList.remove('open'); $('#overlay')?.classList.remove('show'); }

document.addEventListener('DOMContentLoaded', () => {
  seedProducts();
  renderProducts();
  renderCart();
  updateCartCount();

  $('#openCart')?.addEventListener('click', openCart);
  $('#closeCart')?.addEventListener('click', closeCart);
  $('#overlay')?.addEventListener('click', closeCart);
  $('#clearCart')?.addEventListener('click', () => { localStorage.removeItem(LS_CART); renderCart(); updateCartCount(); });
});
