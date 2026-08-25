let tg = window.Telegram.WebApp;
tg.expand();

// База данных товаров с привязкой реальных изображений
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
            compatibility: 'Windows Vista/XP/7/8/10/11 та Mac'
        }
    }
];

let cart = [];
let orders = JSON.parse(localStorage.getItem('milip_orders')) || [];

// Состояние текущего просмотра товара
let currentSelectedColor = null;
let currentQuantity = 1;

document.addEventListener('DOMContentLoaded', () => {
    renderProducts(products);
    updateCartUI();
    updateAdminStats();
});

// Рендеринг карточек в каталоге
function renderProducts(list) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    if (list.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Нічого не знайдено</p>';
        return;
    }

    let html = '';
    list.forEach((p, index) => {
        html += `
            <div class="product-card" onclick="openProduct(${p.id - 1})">
                <span class="badge hot">${p.badge}</span>
                <div class="product-img-wrap">
                    <img src="${p.image}" alt="${p.name}" style="max-height: 140px; max-width: 100%; object-fit: contain;">
                </div>
                <span style="font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">${p.brand}</span>
                <h3 class="card-title">${p.name}</h3>
                <p class="card-desc">${p.tagline}</p>
                <div class="card-footer-row">
                    <span class="price">${p.price} ₴</span>
                    <button class="buy-card-btn" onclick="event.stopPropagation(); quickAdd(${p.id - 1})">Купити</button>
                </div>
            </div>
        `;
    });
    grid.innerHTML = html;
}

// Открытие полноценной страницы товара
function openProduct(index) {
    const p = products[index];
    const container = document.getElementById('productDetailContent');
    
    // Сбрасываем выбор на первый цвет по умолчанию
    currentSelectedColor = p.colors[0].name;
    currentQuantity = 1;
    let activeImage = p.colors[0].img;

    let colorsHtml = '';
    p.colors.forEach((c, i) => {
        colorsHtml += `
            <div class="color-swatch ${i === 0 ? 'active' : ''}" 
                 style="background: ${c.hex}; ${c.hex === '#ffffff' ? 'border: 1px solid #ccc;' : ''}" 
                 onclick="changeProductColor(this, '${c.name}', '${c.img}')" 
                 title="${c.name}">
            </div>`;
    });

    container.innerHTML = `
        <div class="detail-gallery-box">
            <div class="main-detail-img-wrap">
                <img id="activeDetailImg" src="${activeImage}" alt="${p.name}" style="max-height: 320px; max-width: 100%; object-fit: contain; transition: 0.3s;">
            </div>
            <div class="box-preview-section" style="margin-top: 20px;">
                <p style="font-size: 12px; font-weight: 700; color: var(--text-muted); margin-bottom: 8px; text-transform: uppercase;">Комплектація та коробка:</p>
                <img src="${p.boxImage}" alt="Box" style="height: 80px; border-radius: 8px; border: 1px solid var(--border-color); object-fit: cover;">
            </div>
        </div>

        <div class="detail-info">
            <span style="font-size: 11px; font-weight: 700; color: var(--accent); text-transform: uppercase;">${p.brand} • IN STOCK 🟢</span>
            <h1 style="margin-top: 6px;">${p.name}</h1>
            <div class="detail-price">${p.price} ₴</div>
            <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 20px; line-height: 1.5;">${p.tagline}. Забезпечує максимальну точність в іграх та комфорт при щоденному використанні.</p>
            
            <div class="options-title">Виберіть колір: <b id="selectedColorName" style="color: var(--text-main);">${currentSelectedColor}</b></div>
            <div class="color-options">${colorsHtml}</div>

            <div class="options-title" style="margin-top: 16px;">Кількість:</div>
            <div class="quantity-selector" style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
                <button onclick="decrementQty()" class="qty-btn">−</button>
                <span id="qtyDisplay" style="font-size: 16px; font-weight: 700; min-width: 20px; text-align: center;">1</span>
                <button onclick="incrementQty()" class="qty-btn">+</button>
            </div>

            <div class="options-title">Технічні характеристики:</div>
            <ul class="specs-list">
                <li><b>Сенсор:</b> ${p.specs.sensor}</li>
                <li><b>Вага:</b> ${p.specs.weight}</li>
                <li><b>Підключення:</b> ${p.specs.connection}</li>
                <li><b>Акумулятор:</b> ${p.specs.battery}</li>
                <li><b>Мікроперемикачі:</b> ${p.specs.switches}</li>
                <li><b>Частота оновлення:</b> ${p.specs.pollingRate}</li>
                <li><b>Сумісність:</b> ${p.specs.compatibility}</li>
                <li><b>Гарантія:</b> 1 місяць</li>
            </ul>

            <div class="detail-actions" style="margin-top: 24px;">
                <button class="btn-primary" style="flex: 1; padding: 14px; font-size: 15px;" onclick="addToCartFromDetail(${index})">Додати в кошик</button>
            </div>
        </div>
    `;

    switchView('product-detail');
}

// Интерактивное переменение картинки при выборе цвета на странице товара
function changeProductColor(el, colorName, imgPath) {
    document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
    el.classList.add('active');
    currentSelectedColor = colorName;
    document.getElementById('selectedColorName').innerText = colorName;
    
    const imgEl = document.getElementById('activeDetailImg');
    imgEl.style.opacity = '0';
    setTimeout(() => {
        imgEl.src = imgPath;
        imgEl.style.opacity = '1';
    }, 150);
}

// Управление количеством
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

// Переключение разделов
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

// Фильтрация категорий
function filterCategory(cat) {
    switchView('home');
    if (cat === 'all') {
        renderProducts(products);
    } else {
        const filtered = products.filter(p => p.category === cat);
        renderProducts(filtered);
    }
}

// Быстрое добавление из каталога
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

// Добавление со страницы детального просмотра с учетом выбранного цвета и количества
function addToCartFromDetail(index) {
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

// Управление корзиной
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
document.getElementById('mobCartTrigger').addEventListener('click', (e) => { e.preventDefault(); openCartSidebar(); });
document.getElementById('closeCart').addEventListener('click', closeCartSidebar);
cartOverlay.addEventListener('click', closeCartSidebar);

function updateCartUI() {
    const list = document.getElementById('cartItemsList');
    const badge = document.getElementById('cartCount');
    const mobBadge = document.getElementById('mobCartBadge');
    const totalEl = document.getElementById('cartTotalPrice');

    let totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (cart.length === 0) {
        list.innerHTML = '<div class="empty-cart">Кошик порожній</div>';
        badge.style.display = 'none';
        mobBadge.style.display = 'none';
        totalEl.innerText = '0 ₴';
        return;
    }

    badge.style.display = 'flex';
    badge.innerText = totalItemsCount;
    mobBadge.style.display = 'flex';
    mobBadge.innerText = totalItemsCount;

    let html = '';
    let totalSum = 0;
    cart.forEach((item, idx) => {
        let itemTotal = item.price * item.quantity;
        totalSum += itemTotal;
        html += `
            <div class="cart-item" style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-secondary); padding: 12px; border-radius: 10px; margin-bottom: 10px;">
                <div>
                    <h4 style="font-size: 14px; font-weight: 700;">${item.name}</h4>
                    <p style="font-size: 12px; color: var(--text-muted);">Колір: ${item.color} | Кількість: ${item.quantity}</p>
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

// Оформление заказа
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
        alert('Будь ласка, вкажіть ім\'я та контакт (Telegram / телефон)');
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

    let message = `Доброго дня! Бажаю оформити замовлення:\n\n${itemsText}\n\nЗагальна сума: ${totalPrice} ₴\nІм'я: ${name}\nКонтакт: ${contact}\nКоментар: ${comment}`;

    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        tg.sendData(message);
    } else {
        alert('Замовлення успішно сформовано!\n\n' + message);
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

function toggleSearchMobile() {
    searchContainer.classList.toggle('active');
    if (searchContainer.classList.contains('active')) searchInput.focus();
}

searchInput.addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(val) || p.brand.toLowerCase().includes(val) || p.specs.sensor.toLowerCase().includes(val));
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
                <p style="font-size: 13px; margin: 4px 0; white-space: pre-line;">${o.items}</p>
                <p style="font-size: 13px;"><b>Сума:</b> ${o.total} ₴ | <b>Клієнт:</b> ${o.name} (${o.contact})</p>
                <p style="font-size: 12px; color: var(--text-muted);">Коментар: ${o.comment}</p>
            </div>
        `;
    });
    list.innerHTML = html;
}