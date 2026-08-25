let tg = window.Telegram.WebApp;
tg.expand();

// Прелоадер с исчезновением через 2.2 секунды
window.addEventListener('load', () => {
    setTimeout(() => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.classList.add('fade-out');
        }
    }, 2200);
});

// База данных товаров с вашими фотографиями
let products = [
    {
        id: 1,
        category: 'mice',
        brand: 'ATTACK SHARK',
        name: 'ATTACK SHARK X3',
        tagline: 'Ігрова мишка з сенсором PAW3395 • 49г',
        price: 1549,
        badge: 'HOT',
        image: 'images/attack-shark-x3-white.jpg',
        colors: [
            { name: 'Білий', hex: '#ffffff', img: 'images/attack-shark-x3-white.jpg' },
            { name: 'Чорний', hex: '#111111', img: 'images/attack-shark-x3-black.jpg' }
        ],
        boxImage: 'images/attack-shark-x3-box.jpg',
        specs: {
            sensor: 'PAW3395 (до 26000 DPI)',
            weight: '49 грамів (ультралегка)',
            connection: 'Бездротове 2.4G / Bluetooth 5.4 / Дротове',
            battery: 'До 65 годин (300mAh)',
            switches: 'Kailh Black Mamba (80 млн кліків)',
            pollingRate: '125-1000 Hz',
            compatibility: 'Windows / Mac'
        }
    }
];

let cart = [];
let wishlist = [];
let orders = JSON.parse(localStorage.getItem('milip_orders')) || [];

let currentSelectedColor = null;
let currentQuantity = 1;

document.addEventListener('DOMContentLoaded', () => {
    renderProducts(products);
    updateCartUI();
    updateAdminStats();
});

// Рендеринг карточек
function renderProducts(list) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    if (list.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Нічого не знайдено</p>';
        return;
    }

    let html = '';
    list.forEach((p, index) => {
        let isWish = wishlist.includes(p.id);
        html += `
            <div class="product-card" onclick="openProduct(${index})">
                <span class="badge">${p.badge}</span>
                <button class="wishlist-btn-card" onclick="event.stopPropagation(); toggleWishlist(${p.id})">
                    <span class="material-symbols-outlined" style="font-size: 18px; color: ${isWish ? '#ff3b30' : 'inherit'};">${isWish ? 'favorite' : 'favorite'}</span>
                </button>
                <div class="product-img-wrap">
                    <img src="${p.image}" alt="${p.name}">
                </div>
                <span style="font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">${p.brand}</span>
                <h3 class="card-title">${p.name}</h3>
                <p class="card-desc">${p.tagline}</p>
                <div class="card-footer-row">
                    <span class="price">${p.price} ₴</span>
                    <button class="buy-card-btn" onclick="event.stopPropagation(); quickAdd(${index})">Купити</button>
                </div>
            </div>
        `;
    });
    grid.innerHTML = html;
}

// Избранное
function toggleWishlist(id) {
    const idx = wishlist.indexOf(id);
    if (idx > -1) {
        wishlist.splice(idx, 1);
    } else {
        wishlist.push(id);
    }
    renderProducts(products);
}

// Открытие страницы товара
function openProduct(index) {
    const p = products[index];
    const container = document.getElementById('productDetailContent');
    
    currentSelectedColor = null; // Сброшено до выбора
    currentQuantity = 1;
    let activeImage = p.image;

    let colorsHtml = '';
    p.colors.forEach((c) => {
        colorsHtml += `
            <div class="color-swatch" 
                 style="background: ${c.hex}; ${c.hex === '#ffffff' ? 'border: 1px solid #ccc;' : ''}" 
                 onclick="changeProductColor(this, '${c.name}', '${c.img}')" 
                 title="${c.name}">
            </div>`;
    });

    container.innerHTML = `
        <div class="detail-gallery-box" style="background: var(--bg-secondary); border-radius: 20px; padding: 30px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div style="height: 300px; display: flex; align-items: center; justify-content: center; width: 100%;">
                <img id="activeDetailImg" src="${activeImage}" alt="${p.name}" style="max-height: 280px; max-width: 100%; object-fit: contain; transition: 0.3s;">
            </div>
            <div style="margin-top: 20px; width: 100%;">
                <p style="font-size: 12px; font-weight: 700; color: var(--text-muted); margin-bottom: 8px; text-transform: uppercase;">Комплектація та коробка:</p>
                <img src="${p.boxImage}" alt="Box" style="height: 70px; border-radius: 8px; border: 1px solid var(--border-color); object-fit: cover;">
            </div>
        </div>

        <div class="detail-info">
            <span style="font-size: 11px; font-weight: 700; color: var(--accent); text-transform: uppercase;">${p.brand} • IN STOCK 🟢</span>
            <h1 style="margin-top: 6px; font-size: 32px; font-weight: 800;">${p.name}</h1>
            <div style="font-size: 24px; font-weight: 800; margin: 12px 0; color: var(--text-main);">${p.price} ₴</div>
            <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 24px; line-height: 1.5;">${p.tagline}. Створено для безальтернативної перемоги у будь-яких кіберспортивних баталіях.</p>
            
            <div style="font-size: 13px; font-weight: 700; margin-bottom: 8px;">ВИБЕРИТЕ КОЛІР: <span id="selectedColorName" style="color: var(--accent);">Не вибрано</span></div>
            <div class="color-options">${colorsHtml}</div>

            <div style="font-size: 13px; font-weight: 700; margin: 16px 0 8px 0;">КІЛЬКІСТЬ:</div>
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
                <button onclick="decrementQty()" style="width: 36px; height: 36px; border-radius: 8px; background: var(--bg-secondary); border: 1px solid var(--border-color); font-weight: 700; cursor: pointer;">−</button>
                <span id="qtyDisplay" style="font-size: 16px; font-weight: 700; min-width: 20px; text-align: center;">1</span>
                <button onclick="incrementQty()" style="width: 36px; height: 36px; border-radius: 8px; background: var(--bg-secondary); border: 1px solid var(--border-color); font-weight: 700; cursor: pointer;">+</button>
            </div>

            <div style="font-size: 13px; font-weight: 700; margin-bottom: 8px;">ТЕХНІЧНІ ХАРАКТЕРИСТИКИ:</div>
            <ul class="specs-list">
                <li><b>Сенсор:</b> <span>${p.specs.sensor}</span></li>
                <li><b>Вага:</b> <span>${p.specs.weight}</span></li>
                <li><b>Підключення:</b> <span>${p.specs.connection}</span></li>
                <li><b>Акумулятор:</b> <span>${p.specs.battery}</span></li>
                <li><b>Перемикачі:</b> <span>${p.specs.switches}</span></li>
                <li><b>Гарантія:</b> <span>1 місяць</span></li>
            </ul>

            <div style="margin-top: 30px; display: flex; gap: 12px;">
                <button id="addToCartDetailBtn" class="btn-primary" style="flex: 1; padding: 16px; opacity: 0.6; cursor: not-allowed;" disabled onclick="addToCartFromDetail(${index})">SELECT COLOR FIRST</button>
            </div>
        </div>
    `;

    switchView('product-detail');
}

function changeProductColor(el, colorName, imgPath) {
    document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
    el.classList.add('active');
    currentSelectedColor = colorName;
    document.getElementById('selectedColorName').innerText = colorName;
    
    const btn = document.getElementById('addToCartDetailBtn');
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.innerText = 'ADD TO CART →';

    const imgEl = document.getElementById('activeDetailImg');
    imgEl.style.opacity = '0';
    setTimeout(() => {
        imgEl.src = imgPath;
        imgEl.style.opacity = '1';
    }, 150);
}

function incrementQty() {
    currentQuantity++;
    document.getElementById('qtyDisplay').innerText = currentQuantity;
}

function decrementQty() {
    if (currentQuantity > 1) {
        currentQuantity--;
        document.getElementById('qtyDisplay').innerText = currentQuantity;
    }
}

// Навигация
function switchView(viewName) {
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    if (viewName === 'home') document.getElementById('homeView').classList.add('active');
    if (viewName === 'product-detail') document.getElementById('productDetailView').classList.add('active');
    if (viewName === 'admin') {
        document.getElementById('adminView').classList.add('active');
        renderAdminOrders();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function filterCategory(cat) {
    switchView('home');
    if (cat === 'all') {
        renderProducts(products);
    } else {
        const filtered = products.filter(p => p.category === cat);
        renderProducts(filtered);
    }
}

function quickAdd(index) {
    const p = products[index];
    cart.push({
        name: p.name,
        price: p.price,
        color: p.colors[0].name,
        quantity: 1
    });
    updateCartUI();
    openCartSidebar();
}

function addToCartFromDetail(index) {
    if (!currentSelectedColor) return;
    const p = products[index];
    cart.push({
        name: p.name,
        price: p.price,
        color: currentSelectedColor,
        quantity: currentQuantity
    });
    updateCartUI();
    openCartSidebar();
}

// Корзина
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');

function openCartSidebar() {
    cartSidebar.classList.add('active');
    cartOverlay.classList.add('active');
}

function closeCartSidebar() {
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
}

document.getElementById('cartBtn').addEventListener('click', openCartSidebar);
document.getElementById('closeCart').addEventListener('click', closeCartSidebar);
cartOverlay.addEventListener('click', closeCartSidebar);

function updateCartUI() {
    const list = document.getElementById('cartItemsList');
    const badge = document.getElementById('cartCount');
    const totalEl = document.getElementById('cartTotalPrice');

    let totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (cart.length === 0) {
        list.innerHTML = '<div style="text-align: center; color: var(--text-muted); margin-top: 40px;">Кошик порожній</div>';
        badge.style.display = 'none';
        totalEl.innerText = '0 ₴';
        return;
    }

    badge.style.display = 'flex';
    badge.innerText = totalItemsCount;

    let html = '';
    let totalSum = 0;
    cart.forEach((item, idx) => {
        let itemTotal = item.price * item.quantity;
        totalSum += itemTotal;
        html += `
            <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-secondary); padding: 12px; border-radius: 10px; margin-bottom: 10px;">
                <div>
                    <h4 style="font-size: 14px; font-weight: 700;">${item.name}</h4>
                    <p style="font-size: 12px; color: var(--text-muted);">Колір: ${item.color} | К-сть: ${item.quantity}</p>
                    <b style="font-size: 13px; color: var(--accent);">${itemTotal} ₴</b>
                </div>
                <button onclick="removeFromCart(${idx})" style="background:none; border:none; color:var(--text-muted); cursor:pointer;"><span class="material-symbols-outlined">delete</span></button>
            </div>
        `;
    });
    list.innerHTML = html;
    totalEl.innerText = totalSum + ' ₴';
}

function removeFromCart(idx) {
    cart.splice(idx, 1);
    updateCartUI();
}

function openCheckoutModal() {
    if (cart.length === 0) return;
    closeCartSidebar();
    document.getElementById('checkoutModal').classList.add('active');
}

function closeCheckoutModal() {
    document.getElementById('checkoutModal').classList.remove('active');
}

function submitOrderToTelegram() {
    const name = document.getElementById('orderName').value.trim();
    const contact = document.getElementById('orderContact').value.trim();
    const comment = document.getElementById('orderComment').value.trim();

    if (!name || !contact) {
        alert('Будь ласка, вкажіть ім\'я та контакт!');
        return;
    }

    let itemsText = cart.map(i => `- ${i.name} (${i.color}) x ${i.quantity} шт. — ${i.price * i.quantity} ₴`).join('\n');
    let totalPrice = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);

    let orderData = {
        id: Date.now().toString().slice(-4),
        items: itemsText,
        total: totalPrice,
        name: name,
        contact: contact,
        comment: comment || 'немає',
        date: new Date().toLocaleDateString()
    };

    orders.push(orderData);
    localStorage.setItem('milip_orders', JSON.stringify(orders));
    updateAdminStats();

    let message = `Нове замовлення Milip Store:\n\n${itemsText}\n\nСума: ${totalPrice} ₴\nІм'я: ${name}\nКонтакт: ${contact}\nКоментар: ${comment}`;

    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        tg.sendData(message);
    } else {
        alert('Замовлення успішно створено!\n\n' + message);
        cart = [];
        updateCartUI();
        closeCheckoutModal();
        switchView('home');
    }
}

// Поиск
const searchToggle = document.getElementById('searchToggle');
const searchContainer = document.getElementById('searchContainer');
const searchInput = document.getElementById('searchInput');

searchToggle.addEventListener('click', () => {
    searchContainer.classList.toggle('active');
    if (searchContainer.classList.contains('active')) searchInput.focus();
});

searchInput.addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(val) || p.brand.toLowerCase().includes(val));
    renderProducts(filtered);
});

// Админ панель
function openAdminPanel() {
    switchView('admin');
}

function updateAdminStats() {
    const ordCount = document.getElementById('adminOrdersCount');
    if (ordCount) ordCount.innerText = orders.length;
}

function renderAdminOrders() {
    const list = document.getElementById('adminOrdersList');
    if (orders.length === 0) {
        list.innerHTML = '<p style="color: var(--text-muted);">Поки що замовлень немає.</p>';
        return;
    }
    let html = '';
    orders.slice().reverse().forEach(o => {
        html += `
            <div class="admin-order-card">
                <b>Замовлення #${o.id} від ${o.date}</b>
                <p style="font-size: 13px; margin: 6px 0; white-space: pre-line;">${o.items}</p>
                <p style="font-size: 13px;"><b>Сума:</b> ${o.total} ₴ | <b>Клієнт:</b> ${o.name} (${o.contact})</p>
                <p style="font-size: 12px; color: var(--text-muted);">Коментар: ${o.comment}</p>
            </div>
        `;
    });
    list.innerHTML = html;
}