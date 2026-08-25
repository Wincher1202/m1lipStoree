let tg = window.Telegram.WebApp;
tg.expand();

// База данных товаров (первым идет ваш главный товар Attack Shark X3)
let products = [
    {
        id: 1,
        category: 'mice',
        brand: 'ATTACK SHARK',
        name: 'ATTACK SHARK X3',
        tagline: 'Ігрова мишка з сенсором PAW3395',
        price: 1549,
        badge: 'HOT',
        colors: [
            { name: 'Білий', hex: '#ffffff' },
            { name: 'Чорний', hex: '#111111' }
        ],
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
let orders = JSON.parse(localStorage.getItem('milip_orders')) || [];
let selectedColor = products[0].colors[0].name;

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    renderProducts(products);
    updateCartUI();
    updateAdminStats();
});

// Рендеринг карточек товаров в каталог
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
                    <span class="material-symbols-outlined" style="font-size: 56px; color: var(--accent);">mouse</span>
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

// Открытие страницы детального просмотра товара
function openProduct(index) {
    const p = products[index];
    const container = document.getElementById('productDetailContent');
    
    let colorsHtml = '';
    p.colors.forEach((c, i) => {
        colorsHtml += `<div class="color-swatch ${i === 0 ? 'active' : ''}" style="background: ${c.hex};" onclick="selectDetailColor(this, '${c.name}')" title="${c.name}"></div>`;
    });

    container.innerHTML = `
        <div class="detail-gallery">
            <span class="material-symbols-outlined" style="font-size: 120px; color: var(--accent);">mouse</span>
        </div>
        <div class="detail-info">
            <span style="font-size: 11px; font-weight: 700; color: var(--accent); text-transform: uppercase;">${p.brand}</span>
            <h1>${p.name}</h1>
            <div class="detail-price">${p.price} ₴</div>
            <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 16px;">${p.tagline}</p>
            
            <div class="options-title">Виберіть колір: <b id="selectedColorName">${p.colors[0].name}</b></div>
            <div class="color-options">${colorsHtml}</div>

            <div class="options-title">Характеристики:</div>
            <ul class="specs-list">
                <li><b>Сенсор:</b> ${p.specs.sensor}</li>
                <li><b>Вага:</b> ${p.specs.weight}</li>
                <li><b>Підключення:</b> ${p.specs.connection}</li>
                <li><b>Акумулятор:</b> ${p.specs.battery}</li>
                <li><b>Мікроперемикачі:</b> ${p.specs.switches}</li>
                <li><b>Гарантія:</b> 1 місяць</li>
            </ul>

            <div class="detail-actions">
                <button class="btn-primary" style="flex: 1;" onclick="addToCartFromDetail(${index})">Додати в кошик</button>
            </div>
        </div>
    `;

    switchView('product-detail');
}

// Переключение цвета в деталях
function selectDetailColor(el, colorName) {
    document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
    el.classList.add('active');
    selectedColor = colorName;
    document.getElementById('selectedColorName').innerText = colorName;
}

// Переключение разделов сайта (home, product-detail, admin)
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

// Быстрое добавление в корзину из каталога
function quickAdd(index) {
    const p = products[index];
    cart.push({
        name: p.name,
        price: p.price,
        color: p.colors[0].name
    });
    updateCartUI();
    openCartSidebar();
}

// Добавление со страницы товара
function addToCartFromDetail(index) {
    const p = products[index];
    cart.push({
        name: p.name,
        price: p.price,
        color: selectedColor
    });
    updateCartUI();
    openCartSidebar();
}

// Управление корзиной (Sidebar)
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

    if (cart.length === 0) {
        list.innerHTML = '<div class="empty-cart">Кошик порожній</div>';
        badge.style.display = 'none';
        mobBadge.style.display = 'none';
        totalEl.innerText = '0 ₴';
        return;
    }

    badge.style.display = 'flex';
    badge.innerText = cart.length;
    mobBadge.style.display = 'flex';
    mobBadge.innerText = cart.length;

    let html = '';
    let total = 0;
    cart.forEach((item, idx) => {
        total += item.price;
        html += `
            <div class="cart-item">
                <div>
                    <h4 style="font-size: 14px; font-weight: 700;">${item.name}</h4>
                    <p style="font-size: 12px; color: var(--text-muted);">Колір: ${item.color}</p>
                    <b style="font-size: 13px; color: var(--accent);">${item.price} ₴</b>
                </div>
                <button onclick="removeFromCart(${idx})" style="background:none; border:none; color:var(--text-muted); cursor:pointer;"><span class="material-symbols-outlined">delete</span></button>
            </div>
        `;
    });
    list.innerHTML = html;
    totalEl.innerText = total + ' ₴';
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

    let itemsText = cart.map(i => `- ${i.name} (${i.color}) — ${i.price} ₴`).join('\n');
    let totalPrice = cart.reduce((sum, i) => sum + i.price, 0);

    let orderData = {
        id: Date.now().toString().slice(-4),
        items: itemsText,
        total: totalPrice,
        name: name,
        contact: contact,
        comment: comment || 'немає',
        date: new Date().toLocaleDateString()
    };

    // Сохраняем в локальную базу админки
    orders.push(orderData);
    localStorage.setItem('milip_orders', JSON.stringify(orders));
    updateAdminStats();

    // Формируем текст для отправки менеджеру
    let message = `Доброго дня! Бажаю оформити замовлення:\n\n${itemsText}\n\nЗагальна сума: ${totalPrice} ₴\nІм'я: ${name}\nКонтакт: ${contact}\nКоментар: ${comment}`;

    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        // Если открыто внутри Telegram Mini App
        tg.sendData(message);
    } else {
        // Резерв для обычной версии браузера (открытие чата или алерт)
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

// Админ панель функции
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