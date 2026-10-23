const products = [
    {
        id: 1,
        title: "Equality",
        artist: "Lil2DrillX feat. Poppy",
        genre: "Metal",
        price: 24500,
        image: "img/albom1.jpeg",
        audioSrc: "audio/Redline_Panic.mp3",
        description: "Студийный альбом Исполнителя Lil2DrillX, выпущенный в 2026 году.трэш-метал на 180-граммовом тяжелом виниле."
    },
    {
        id: 2,
        title: "Reverse",
        artist: "Lil2DrillX",
        genre: "Phonk",
        price: 18900,
        image: "img/albom2.jpg",
        audioSrc: "audio/Confetti_and_Steel.mp3",
        description: "Мощный сборник агрессивного Drift Phonk. Лимитированное издание."
    },
    {
        id: 3,
        title: "Aegis Global shutdown",
        artist: "Lil2DrillX feat. ONEWYN ",
        genre: "Rock",
        price: 22000,
        image: "img/albom3.jpg",
        audioSrc: "audio/Grip_Slide.mp3",
        description: "Студийный альбом Исполнителя Lil2DrillX, выпущенный в марте 2026 года.прогрессивный рок."
    },
    {
        id: 4,
        title: "Nova-9",
        artist: "Lil2DrillX feat. Иван Золо",
        genre: "Metal",
        price: 21500,
        image: "img/albom4.jpg",
        audioSrc: "audio/Hydraulic_Apex.mp3",
        description: "Альбом Исполнителя Lil2DrillX. Сочетает в себе альтернативный метал, хардкор и элементы фолк-музыки."
    }
];

let cart = [];
let selectedGenre = "all";
let searchFilter = "";


let currentAudio = null;
let currentBtn = null;

const productsGrid = document.getElementById("productsGrid");
const searchInput = document.getElementById("searchInput");
const categoryList = document.getElementById("categoryList");

const cartCountEl = document.getElementById("cartCount");
const cartTotalEl = document.getElementById("cartTotal");
const cartDrawerTotal = document.getElementById("cartDrawerTotal");
const cartDrawerBody = document.getElementById("cartDrawerBody");

const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const openCartBtn = document.getElementById("openCartBtn");
const closeCartBtn = document.getElementById("closeCartBtn");

const productModal = document.getElementById("productModal");
const productModalBody = document.getElementById("productModalBody");
const closeProductModal = document.getElementById("closeProductModal");

const checkoutModal = document.getElementById("checkoutModal");
const checkoutBtn = document.getElementById("checkoutBtn");
const closeCheckoutModal = document.getElementById("closeCheckoutModal");
const checkoutForm = document.getElementById("checkoutForm");

function renderCatalog() {
    productsGrid.innerHTML = "";

    const filtered = products.filter(item => {
        const matchGenre = selectedGenre === "all" || item.genre === selectedGenre;
        const matchSearch = item.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
                            item.artist.toLowerCase().includes(searchFilter.toLowerCase());
        return matchGenre && matchSearch;
    });

    if (filtered.length === 0) {
        productsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
                Пластинки не найдены по вашему запросу
            </div>
        `;
        return;
    }

    filtered.forEach(item => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <div class="card-image-wrap">
                <img src="${item.image}" alt="${item.title}" onclick="openProductModal(${item.id})">
                <button class="preview-audio-btn" id="btn-audio-${item.id}" onclick="toggleAudioPreview('${item.audioSrc}', this)" title="Прослушать превью">▶</button>
            </div>
            <div class="card-title" onclick="openProductModal(${item.id})">${item.title}</div>
            <div class="card-artist">${item.artist}</div>
            <div class="card-footer">
                <div class="card-price">${item.price.toLocaleString()} ₸</div>
                <div class="card-btns">
                    <button class="btn-buy" onclick="addToCart(${item.id})">В корзину</button>
                    <button class="btn-detail" onclick="openProductModal(${item.id})">👁</button>
                </div>
            </div>
        `;
        productsGrid.appendChild(card);
    });
}


function toggleAudioPreview(src, btnElement) {
    if (currentAudio) {
     
        if (currentBtn === btnElement) {
            if (currentAudio.paused) {
                currentAudio.play();
                btnElement.textContent = "❚❚"; 
            } else {
                currentAudio.pause();
                btnElement.textContent = "▶"; 
            }
            return;
        } else {
          
            currentAudio.pause();
            currentAudio.currentTime = 0;
            if (currentBtn) currentBtn.textContent = "▶";
        }
    }


    currentAudio = new Audio(src);
    currentBtn = btnElement;

    currentAudio.play().then(() => {
        btnElement.textContent = "❚❚";
    }).catch(() => {
        alert("Не удалось воспроизвести файл. Проверьте путь к аудиофайлу в коде.");
        btnElement.textContent = "▶";
    });


    currentAudio.addEventListener("ended", () => {
        btnElement.textContent = "▶";
        currentAudio = null;
        currentBtn = null;
    });
}

function addToCart(id) {
    const product = products.find(p => p.id === id);
    const inCart = cart.find(item => item.id === id);

    if (inCart) {
        inCart.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCartUI();
    toggleCartDrawer(true);
}

function changeQuantity(id, delta) {
    const item = cart.find(p => p.id === id);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
        cart = cart.filter(p => p.id !== id);
    }
    updateCartUI();
}

function updateCartUI() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    cartCountEl.textContent = totalCount;
    cartTotalEl.textContent = totalPrice.toLocaleString();
    cartDrawerTotal.textContent = `${totalPrice.toLocaleString()} ₸`;

    if (cart.length === 0) {
        cartDrawerBody.html = ""; // очистка
        cartDrawerBody.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 40px 0;">Ваша корзина пуста</p>`;
        return;
    }

    cartDrawerBody.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.title}">
            <div class="cart-item-details">
                <div class="cart-item-title">${item.title}</div>
                <div class="cart-item-price">${item.price.toLocaleString()} ₸</div>
                <div class="cart-item-controls">
                    <button class="btn-qty" onclick="changeQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="btn-qty" onclick="changeQuantity(${item.id}, 1)">+</button>
                </div>
            </div>
        </div>
    `).join("");
}

function openProductModal(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    productModalBody.innerHTML = `
        <div class="product-detail-grid">
            <img class="product-detail-img" src="${product.image}" alt="${product.title}">
            <div class="product-detail-info">
                <h2>${product.title}</h2>
                <div class="product-detail-artist">Исполнитель: ${product.artist}</div>
                <div class="product-detail-price">${product.price.toLocaleString()} ₸</div>
                <p class="product-detail-desc">${product.description}</p>
                <button class="btn-checkout" onclick="addToCart(${product.id}); closeProductModalFunc();">Добавить в корзину</button>
            </div>
        </div>
    `;
    productModal.classList.add("active");
}

function closeProductModalFunc() {
    productModal.classList.remove("active");
}

function toggleCartDrawer(open) {
    if (open) {
        cartDrawer.classList.add("active");
        cartOverlay.classList.add("active");
    } else {
        cartDrawer.classList.remove("active");
        cartOverlay.classList.remove("active");
    }
}

searchInput.addEventListener("input", (e) => {
    searchFilter = e.target.value;
    renderCatalog();
});

categoryList.addEventListener("click", (e) => {
    const li = e.target.closest("li");
    if (li) {
        document.querySelectorAll("#categoryList li").forEach(el => el.classList.remove("active"));
        li.classList.add("active");
        selectedGenre = li.dataset.genre;
        renderCatalog();
    }
});

openCartBtn.addEventListener("click", () => toggleCartDrawer(true));
closeCartBtn.addEventListener("click", () => toggleCartDrawer(false));
cartOverlay.addEventListener("click", () => toggleCartDrawer(false));
closeProductModal.addEventListener("click", closeProductModalFunc);

checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) {
        alert("Корзина пуста!");
        return;
    }
    toggleCartDrawer(false);
    checkoutModal.classList.add("active");
});

closeCheckoutModal.addEventListener("click", () => checkoutModal.classList.remove("active"));

checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Заказ успешно оформлен! Спасибо за покупку.");
    cart = [];
    updateCartUI();
    checkoutModal.classList.remove("active");
});

renderCatalog();
updateCartUI();