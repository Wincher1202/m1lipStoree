let tg = window.Telegram.WebApp;
tg.expand();

let cart = [];
let favorites = [];

// Переключение цвета товара
function selectColor(element) {
    const swatches = element.parentElement.querySelectorAll('.swatch');
    swatches.forEach(s => s.classList.remove('active'));
    element.classList.add('active');
    
    const colorName = element.getAttribute('data-color');
    const card = element.closest('.product-card');
    card.querySelector('.selected-color-name').innerText = colorName;
}

// Выбор комплектации (меняет цену)
function selectBundle(element) {
    const buttons = element.parentElement.querySelectorAll('.bundle-btn');
    buttons.forEach(b => b.classList.remove('active'));
    element.classList.add('active');

    const newPrice = element.getAttribute('data-price');
    const card = element.closest('.product-card');
    card.querySelector('.price-val').innerText = newPrice;
}

// Добавление в корзину
function addToCart(button) {
    const card = button.closest('.product-card');
    const title = card.querySelector('.product-title').innerText;
    const price = parseInt(card.querySelector('.price-val').innerText);
    const color = card.querySelector('.selected-color-name').innerText;
    const bundle = card.querySelector('.bundle-btn.active').innerText;

    const item = { title, price, color, bundle };
    cart.push(item);
    
    updateCartUI();
    
    // Анимация кнопки
    button.innerHTML = '<span class="material-symbols-outlined">check</span> Додано';
    button.style.background = '#10b981';
    setTimeout(() => {
        button.innerHTML = '<span class="material-symbols-outlined">shopping_bag</span> Купити';
        button.style.background = '';
    }, 1200);
}

// Обновление интерфейса корзины
function updateCartUI() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalPrice = document.getElementById('cartTotalPrice');
    const badge = document.getElementById('favCount'); // на всякий
    const mobCartCount = document.getElementById('mobCartCount');

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart">Кошик порожній</div>';
        cartTotalPrice.innerText = '0 UAH';
        document.getElementById('cartSidebar').classList.remove('active');
        document.getElementById('cartOverlay').classList.remove('active');
        if(mobCartCount) mobCartCount.style.display = 'none';
        return;
    }

    if(mobCartCount) {
        mobCartCount.style.display = 'flex';
        mobCartCount.innerText = cart.length;
    }

    let html = '';
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price;
        html += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.title}</h4>
                    <p>Колір: ${item.color} | Комплект: ${item.bundle}</p>
                    <div class="cart-item-price">${item.price} UAH</div>
                </div>
                <button class="remove-item" onclick="removeFromCart(${index})">
                    <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
                </button>
            </div>
        `;
    });

    cartItemsContainer.innerHTML = html;
    cartTotalPrice.innerText = total + ' UAH';
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

// Открытие / закрытие корзины
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');

document.getElementById('mobCartBtn').addEventListener('click', (e) => {
    e.preventDefault();
    if(cart.length > 0) {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
    }
});

document.getElementById('closeCart').addEventListener('click', () => {
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
});

cartOverlay.addEventListener('click', () => {
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
});

// Отправка заказа в бот Telegram
function sendOrder() {
    if (cart.length === 0) return;
    
    // Передаем данные обратно боту через Telegram WebApp API
    tg.sendData(JSON.stringify(cart));
}

// Поиск
const searchToggle = document.getElementById('searchToggle');
const searchContainer = document.getElementById('searchContainer');
const searchInput = document.getElementById('searchInput');

searchToggle.addEventListener('click', () => {
    searchContainer.classList.toggle('active');
    if(searchContainer.classList.contains('active')) searchInput.focus();
});

document.getElementById('mobSearchBtn').addEventListener('click', (e) => {
    e.preventDefault();
    searchContainer.classList.toggle('active');
    if(searchContainer.classList.contains('active')) searchInput.focus();
});

searchInput.addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.product-card');
    
    cards.forEach(card => {
        const name = card.getAttribute('data-name').toLowerCase();
        const brand = card.getAttribute('data-brand').toLowerCase();
        if(name.includes(val) || brand.includes(val)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
});

// Фильтрация по категориям
const categoryCards = document.querySelectorAll('.category-card');
categoryCards.forEach(btn => {
    btn.addEventListener('click', () => {
        categoryCards.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        
        const cat = btn.getAttribute('data-category');
        const cards = document.querySelectorAll('.product-card');
        
        cards.forEach(card => {
            if(cat === 'all' || card.getAttribute('data-category') === cat) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// Избранное
function toggleFavorite(btn) {
    btn.classList.toggle('active');
}