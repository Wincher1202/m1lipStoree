let tg = window.Telegram.WebApp;
tg.expand(); // Розгортаємо міні-апп на весь екран

let cart = [];

// Вибір кольору
document.querySelectorAll('.colors').forEach(container => {
    container.addEventListener('click', (e) => {
        if (e.target.classList.contains('color-dot')) {
            container.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
            e.target.classList.add('active');
        }
    });
});

// Додавання в кошик
function addToCart(button) {
    const card = button.closest('.product-card');
    const title = card.getAttribute('data-title');
    const price = parseInt(card.getAttribute('data-price'));
    const color = card.querySelector('.color-dot.active').getAttribute('data-color');

    cart.push({ title, price, color });
    updateCartUI();
    
    button.innerText = "Додано ✓";
    setTimeout(() => { button.innerText = "Додати в кошик"; }, 1000);
}

// Оновлення вигляду кошика
function updateCartUI() {
    const cartBar = document.getElementById('cartBar');
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');

    if (cart.length > 0) {
        cartBar.style.display = 'flex';
        cartCount.innerText = cart.length;
        cartTotal.innerText = cart.reduce((sum, item) => sum + item.price, 0);
    } else {
        cartBar.style.display = 'none';
    }
}

// Відправка замовлення в Telegram-бота
function sendOrder() {
    if (cart.length === 0) return;
    
    // Відправляємо дані у форматі JSON назад у бота
    tg.sendData(JSON.stringify(cart));
}