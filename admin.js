// في ملف admin.js - استبدال الكود الحالي بالكامل بهذا الكود
const LS_PRODUCTS = 'store.products';
const $ = (s) => document.querySelector(s);
function getProducts(){ return JSON.parse(localStorage.getItem(LS_PRODUCTS) || '[]'); }
function setProducts(v){ localStorage.setItem(LS_PRODUCTS, JSON.stringify(v)); }

// دالة لتحويل الصورة إلى base64
function convertImageToBase64(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        callback(e.target.result);
    };
    reader.readAsDataURL(file);
}

function renderAdmin(){
  const wrap = $('#adminProducts');
  const products = getProducts();
  if (!products.length){ wrap.innerHTML = '<p class="muted">لا توجد منتجات بعد.</p>'; return; }
  wrap.innerHTML = products.map(p => `
    <div class="card product">
      <img loading="lazy" src="${p.image || 'https://placehold.co/600x400?text=Product'}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p class="muted">$${Number(p.price).toFixed(2)}</p>
      <div class="row">
        <button class="btn" data-edit="${p.id}">تعديل</button>
        <button class="btn danger ghost" data-del="${p.id}">حذف</button>
      </div>
    </div>
  `).join('');

  wrap.querySelectorAll('[data-del]').forEach(b => b.onclick = () => {
    const id = b.getAttribute('data-del');
    const list = getProducts().filter(x => x.id !== id);
    setProducts(list);
    renderAdmin();
  });

  wrap.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => {
    const id = b.getAttribute('data-edit');
    const p = getProducts().find(x => x.id === id);
    if (!p) return;
    $('#name').value = p.name;
    $('#price').value = p.price;
    $('#desc').value = p.desc || '';
    $('#productForm').dataset.editing = id;
    
    // إظهار معاينة الصورة عند التعديل
    const imagePreview = $('#imagePreview');
    if (imagePreview) {
        imagePreview.innerHTML = p.image ? 
            `<img src="${p.image}" alt="معاينة" style="max-width:200px;max-height:150px;margin-top:10px;">` : 
            '';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function seed(){
  const exists = getProducts();
  if (exists.length) return alert('هناك منتجات بالفعل.');
  const demo = [
    { id: crypto.randomUUID(), name: 'قميص قطني', price: 19.99, image: 'https://images.unsplash.com/photo-1520974699644-0a56c1a8a9bf?q=80&w=800&auto=format&fit=crop', desc:'قميص مريح 100% قطن.' },
    { id: crypto.randomUUID(), name: 'حقيبة يد', price: 34.50, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop', desc:'حقيبة أنيقة للاستخدام اليومي.' },
  ];
  setProducts(demo);
  renderAdmin();
}

document.addEventListener('DOMContentLoaded', () => {
  renderAdmin();

  // إضافة معاينة للصورة عند اختيارها
  const imageInput = $('#image');
  if (imageInput) {
      imageInput.addEventListener('change', function(e) {
          const file = e.target.files[0];
          if (file) {
              const imagePreview = $('#imagePreview') || (() => {
                  const div = document.createElement('div');
                  div.id = 'imagePreview';
                  imageInput.parentNode.appendChild(div);
                  return div;
              })();
              
              convertImageToBase64(file, function(base64) {
                  imagePreview.innerHTML = `<img src="${base64}" alt="معاينة" style="max-width:200px;max-height:150px;margin-top:10px;">`;
              });
          }
      });
  }

  $('#productForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const idEditing = e.currentTarget.dataset.editing;
    const name = $('#name').value.trim();
    const price = parseFloat($('#price').value || '0');
    const desc = $('#desc').value.trim();
    const imageFile = $('#image').files[0];

    if (!name || isNaN(price) || price < 0) return alert('يرجى إدخال اسم وسعر صحيحين.');

    const processProduct = (imageData) => {
        let list = getProducts();
        if (idEditing){
            list = list.map(p => p.id === idEditing ? { ...p, name, price, image: imageData || p.image, desc } : p);
            delete e.currentTarget.dataset.editing;
        } else {
            list.push({ id: crypto.randomUUID(), name, price, image: imageData, desc });
        }
        setProducts(list);
        e.currentTarget.reset();
        const imagePreview = $('#imagePreview');
        if (imagePreview) imagePreview.innerHTML = '';
        renderAdmin();
        alert('تم حفظ المنتج ✅');
    };

    if (imageFile) {
        // إذا تم تحميل صورة جديدة
        convertImageToBase64(imageFile, processProduct);
    } else if (idEditing) {
        // إذا كان تعديل ولم يتم تغيير الصورة
        const existingProduct = getProducts().find(p => p.id === idEditing);
        processProduct(existingProduct?.image);
    } else {
        // إذا كان منتج جديد ولم يتم تحميل صورة
        processProduct('');
    }
  });

  $('#seedBtn')?.addEventListener('click', seed);
  $('#clearBtn')?.addEventListener('click', () => {
    if (confirm('هل تريد حذف جميع المنتجات؟')){
      localStorage.removeItem(LS_PRODUCTS);
      renderAdmin();
    }
  });
});