const baseProducts = [
  { id: 1, name: "Базова футболка Premium", category: "Одяг", price: 899, emoji: "👕", gender: "unisex", description: "Універсальна футболка з м’якої тканини." },
  { id: 2, name: "Куртка Urban", category: "Одяг", price: 2499, emoji: "🧥", gender: "unisex", description: "Легка міська куртка на щодень." },
  { id: 3, name: "Кросівки Street", category: "Взуття", price: 2899, emoji: "👟", gender: "unisex", description: "Зручні кросівки для міста та прогулянок." },
  { id: 4, name: "Міська сумка", category: "Аксесуари", price: 1299, emoji: "👜", gender: "female", description: "Практична сумка для щоденних речей." }
];

const products = [...(JSON.parse(localStorage.getItem("modaProducts")) || []), ...baseProducts];
const grid = document.getElementById("catalogGrid");
const empty = document.getElementById("catalogEmpty");
const modal = document.getElementById("catalogModal");
const modalContent = document.getElementById("catalogModalContent");
const cartDrawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");
let cart = JSON.parse(localStorage.getItem("modaCart")) || [];
products.forEach((product, index) => {
  if (!product.sizes) product.sizes = index === 3 ? ["One size"] : index === 2 ? ["38", "39", "40", "41", "42"] : ["S", "M", "L", "XL"];
});

const sizeFilterGroup = document.createElement("div");
sizeFilterGroup.className = "filter-group";
sizeFilterGroup.innerHTML = '<p class="filter-title">Розмір</p><div class="size-options" id="catalogSizeOptions"></div>';
document.querySelector(".filter-panel").append(sizeFilterGroup);

function renderSizeFilters() {
  const sizes = [...new Set(products.flatMap(product => product.sizes || []))];
  document.getElementById("catalogSizeOptions").innerHTML = sizes.map(size => `<label><input type="checkbox" name="catalogSize" value="${size}"> ${size}</label>`).join("");
}

function formatPrice(price) { return new Intl.NumberFormat("uk-UA").format(price) + " грн"; }
function saveCart() { localStorage.setItem("modaCart", JSON.stringify(cart)); }
function productVisual(product) { return product.image ? `<img src="${product.image}" alt="${product.name}">` : `<span>${product.emoji}</span>`; }

function renderCatalog() {
  const query = document.getElementById("catalogSearch").value.toLowerCase().trim();
  const gender = document.querySelector('input[name="catalogGender"]:checked').value;
  const from = Number(document.getElementById("catalogPriceFrom").value) || 0;
  const to = Number(document.getElementById("catalogPriceTo").value) || Infinity;
  const selectedSizes = [...document.querySelectorAll('input[name="catalogSize"]:checked')].map(input => input.value);
  const filtered = products.filter(product => (product.name.toLowerCase().includes(query) || product.category.toLowerCase().includes(query)) && (gender === "all" || product.gender === gender || product.gender === "unisex") && product.price >= from && product.price <= to && (!selectedSizes.length || (product.sizes || []).some(size => selectedSizes.includes(size))));
  grid.innerHTML = filtered.map(product => `<article class="product-card product-card-clickable" tabindex="0" role="button" data-product-id="${product.id}"><div class="product-image">${productVisual(product)}</div><div class="product-info"><span class="product-category">${product.category}</span><h3>${product.name}</h3><span class="product-price">${formatPrice(product.price)}</span></div></article>`).join("");
  empty.classList.toggle("hidden", filtered.length > 0);
}

function openProduct(id) {
  const product = products.find(item => item.id === id);
  if (!product) return;
  modalContent.innerHTML = `<div class="modal-product"><div class="modal-product-image">${productVisual(product)}</div><div class="modal-product-info"><span class="product-category">${product.category}</span><h2>${product.name}</h2><p>${product.description || "Деталі товару уточнюйте за контактним номером."}</p><p><strong>Розміри:</strong> ${(product.sizes || []).join(", ")}</p><div class="price">${formatPrice(product.price)}</div><button class="primary-btn full" type="button" onclick="addToCart(${product.id})">Додати до кошика</button></div></div>`;
  modal.classList.add("open"); document.body.style.overflow = "hidden";
}
function closeProduct() { modal.classList.remove("open"); document.body.style.overflow = ""; }

function renderCart() {
  const cartItems = document.getElementById("cartItems");
  document.getElementById("cartCount").textContent = cart.reduce((total, item) => total + item.quantity, 0);
  if (!cart.length) { cartItems.innerHTML = '<div class="cart-empty"><div style="font-size:48px;margin-bottom:15px">🛒</div><h3>Кошик порожній</h3><p>Додайте товари з каталогу.</p></div>'; document.getElementById("cartTotal").textContent = "0 грн"; return; }
  let total = 0;
  cartItems.innerHTML = cart.map(item => {
    const product = products.find(product => product.id === item.id);
    if (!product) return "";
    total += product.price * item.quantity;
    return `<div class="cart-item"><div class="cart-item-image">${product.image ? `<img src="${product.image}" alt="">` : product.emoji}</div><div><h4>${product.name}</h4><div class="cart-item-price">${formatPrice(product.price)}</div><div class="quantity"><button onclick="changeQuantity(${product.id}, -1)">−</button><strong>${item.quantity}</strong><button onclick="changeQuantity(${product.id}, 1)">+</button></div></div><button class="remove-item" onclick="removeFromCart(${product.id})" aria-label="Видалити">×</button></div>`;
  }).join("");
  document.getElementById("cartTotal").textContent = formatPrice(total);
}

function addToCart(id) { const item = cart.find(item => item.id === id); if (item) item.quantity += 1; else cart.push({ id, quantity: 1 }); saveCart(); renderCart(); closeProduct(); openCart(); }
function changeQuantity(id, amount) { const item = cart.find(item => item.id === id); if (!item) return; item.quantity += amount; if (item.quantity <= 0) cart = cart.filter(item => item.id !== id); saveCart(); renderCart(); }
function removeFromCart(id) { cart = cart.filter(item => item.id !== id); saveCart(); renderCart(); }
function openCart() { cartDrawer.classList.add("open"); overlay.classList.add("show"); document.body.style.overflow = "hidden"; }
function closeCart() { cartDrawer.classList.remove("open"); overlay.classList.remove("show"); document.body.style.overflow = ""; }
function openCheckout() { if (!cart.length) { alert("Спочатку додайте товар до кошика."); return; } closeCart(); document.getElementById("checkoutModal").classList.add("open"); document.body.style.overflow = "hidden"; }
function closeCheckout() { document.getElementById("checkoutModal").classList.remove("open"); document.body.style.overflow = ""; }

document.getElementById("catalogSearch").addEventListener("input", renderCatalog);
document.getElementById("catalogPriceFrom").addEventListener("input", renderCatalog);
document.getElementById("catalogPriceTo").addEventListener("input", renderCatalog);
document.querySelectorAll('input[name="catalogGender"]').forEach(input => input.addEventListener("change", renderCatalog));
document.getElementById("catalogSizeOptions").addEventListener("change", renderCatalog);
grid.addEventListener("click", event => { const card = event.target.closest(".product-card-clickable"); if (card) openProduct(Number(card.dataset.productId)); });
grid.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { const card = event.target.closest(".product-card-clickable"); if (card) { event.preventDefault(); openProduct(Number(card.dataset.productId)); } } });
document.getElementById("closeCatalogModal").addEventListener("click", closeProduct);
modal.addEventListener("click", event => { if (event.target === modal) closeProduct(); });
document.getElementById("cartBtn").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
document.getElementById("checkoutBtn").addEventListener("click", openCheckout);
document.getElementById("closeCheckout").addEventListener("click", closeCheckout);
document.getElementById("checkoutModal").addEventListener("click", event => { if (event.target === document.getElementById("checkoutModal")) closeCheckout(); });

// ⚙️ FORMSPREE ОБРОБКА ФОРМИ
const FORMSPREE_URL = "https://formspree.io/f/mdenyvwe";

document.getElementById("checkoutForm").addEventListener("submit", async event => {
  event.preventDefault();
  const submitBtn = event.target.querySelector("button[type='submit']");
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = "📧 Надсилаємо...";
  
  try {
    // Форматуємо дані замовлення
    const itemsList = cart.map(item => {
      const product = products.find(p => p.id === item.id);
      return `${product.name} (${item.quantity}x) - ${formatPrice(product.price * item.quantity)}`;
    }).join("\n");
    
    const cartTotal = cart.reduce((total, item) => {
      const product = products.find(p => p.id === item.id);
      return total + product.price * item.quantity;
    }, 0);
    
    // Збираємо дані форми
    const name = document.getElementById("customerName").value.trim();
    const phone = document.getElementById("customerPhone").value.trim();
    const viber = document.getElementById("customerViber").value.trim();
    const telegram = document.getElementById("customerTelegram").value.trim();
    const comment = document.getElementById("customerComment").value.trim();
    
    // Формуємо текст повідомлення для email
    const message = `
📦 НОВЕ ЗАМОВЛЕННЯ НА OUTFO

👤 Клієнт: ${name}
📞 Телефон: ${phone}
💬 Viber: ${viber || "не вказаний"}
✈️ Telegram: ${telegram || "не вказаний"}

📦 ТОВАРИ:
${itemsList}

💰 Разом: ${formatPrice(cartTotal)}

💭 Примітка: ${comment || "немає"}
    `.trim();
    
    // Надсилаємо на Formspree
    const response = await fetch(FORMSPREE_URL, {
      method: 'POST',
      body: JSON.stringify({
        name,
        phone,
        viber,
        telegram,
        comment,
        items_list: itemsList,
        cart_total: formatPrice(cartTotal),
        message
      }),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      console.log("✅ Замовлення успішно надіслано!");
      submitBtn.textContent = "✅ Надіслано!";
    } else {
      console.warn("⚠️ Formspree повернув помилку:", response.status);
      submitBtn.textContent = originalText;
      alert("⚠️ Помилка при надсиланні. Спробуйте ще раз.");
      return;
    }
    
    // Збереження в localStorage
    const orders = JSON.parse(localStorage.getItem("modaOrders")) || [];
    orders.unshift({
      name, phone, viber, telegram, comment,
      items: cart,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem("modaOrders", JSON.stringify(orders));
    
    // Очищення кошика
    cart = []; saveCart(); renderCart();
    
    // Показ успіху
    document.getElementById("checkoutForm").classList.add("hidden");
    document.getElementById("successMessage").classList.remove("hidden");
    setTimeout(() => { 
      closeCheckout(); 
      document.getElementById("checkoutForm").reset(); 
      document.getElementById("checkoutForm").classList.remove("hidden"); 
      document.getElementById("successMessage").classList.add("hidden"); 
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }, 3000);
    
  } catch (error) {
    console.error("❌ Помилка при обробці замовлення:", error);
    alert("❌ Помилка: " + error.message);
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});

renderSizeFilters();
renderCatalog();
renderCart();
