let products = [];

const savedProducts = JSON.parse(localStorage.getItem("modaProducts"));
if (Array.isArray(savedProducts)) {
  products = [...products, ...savedProducts];
}

let cart = JSON.parse(localStorage.getItem("modaCart")) || [];
let activeCategory = "all";
let activeGender = "all";

const productGrid = document.getElementById("productGrid");
const emptyState = document.getElementById("emptyState");
const cartCount = document.getElementById("cartCount");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartDrawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");
const productModal = document.getElementById("productModal");
const checkoutModal = document.getElementById("checkoutModal");
const modalContent = document.getElementById("modalContent");

function formatPrice(price) {
  return new Intl.NumberFormat("uk-UA").format(price) + " грн";
}

function saveCart() {
  localStorage.setItem("modaCart", JSON.stringify(cart));
}

function saveProducts() {
  const customProducts = products.filter(product => product.isCustom);
  localStorage.setItem("modaProducts", JSON.stringify(customProducts));
}

function productImage(product, modal = false) {
  if (product.image) {
    return `<img src="${product.image}" alt="${product.name}">`;
  }
  return `<span>${product.emoji}</span>`;
}

function homeProductGallery(product) {
  const photos = product.photos && product.photos.length ? product.photos : product.image ? [product.image] : [];
  if (!photos.length) return `<div class="modal-product-image">${productImage(product, true)}</div>`;
  const controls = photos.length > 1 ? `<button class="gallery-arrow gallery-prev" type="button" onclick="changeHomeProductPhoto(${product.id}, -1)" aria-label="Попереднє фото">←</button><button class="gallery-arrow gallery-next" type="button" onclick="changeHomeProductPhoto(${product.id}, 1)" aria-label="Наступне фото">→</button>` : "";
  const thumbnails = photos.length > 1 ? `<div class="gallery-thumbnails">${photos.map((photo, index) => `<button class="gallery-thumb${index === 0 ? " active" : ""}" type="button" onclick="selectHomeProductPhoto(${product.id}, ${index})" aria-label="Фото ${index + 1}"><img src="${photo}" alt=""></button>`).join("")}</div>` : "";
  return `<div class="product-gallery"><div class="modal-product-image"><img id="homeGalleryMainImage" src="${photos[0]}" alt="${product.name}">${controls}</div>${thumbnails}</div>`;
}

function selectHomeProductPhoto(productId, index) {
  const product = products.find(item => item.id === productId);
  const photos = product && product.photos && product.photos.length ? product.photos : product && product.image ? [product.image] : [];
  if (!photos[index]) return;
  document.getElementById("homeGalleryMainImage").src = photos[index];
  document.querySelectorAll(".gallery-thumb").forEach((thumb, thumbIndex) => thumb.classList.toggle("active", thumbIndex === index));
}

function changeHomeProductPhoto(productId, direction) {
  const product = products.find(item => item.id === productId);
  const photos = product && product.photos && product.photos.length ? product.photos : product && product.image ? [product.image] : [];
  const activeThumb = [...document.querySelectorAll(".gallery-thumb")].findIndex(thumb => thumb.classList.contains("active"));
  selectHomeProductPhoto(productId, (activeThumb + direction + photos.length) % photos.length);
}

function renderProducts() {
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  const sort = document.getElementById("sortSelect").value;
  const priceFrom = Number(document.getElementById("priceFrom").value) || 0;
  const priceTo = Number(document.getElementById("priceTo").value) || Infinity;

  let filtered = products.filter(product => {
    const categoryMatch =
      activeCategory === "all" || product.category === activeCategory;

    const genderMatch =
      activeGender === "all" || !product.gender || product.gender === activeGender || product.gender === "unisex";

    const priceMatch = product.price >= priceFrom && product.price <= priceTo;

    const searchMatch =
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query);

    return categoryMatch && genderMatch && priceMatch && searchMatch;
  });

  if (sort === "cheap") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === "expensive") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sort === "name") {
    filtered.sort((a, b) => a.name.localeCompare(b.name, "uk"));
  }

  productGrid.innerHTML = filtered.map(product => `
    <article class="product-card">
      <div class="product-image">
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ""}
        ${productImage(product)}
      </div>
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3>${product.name}</h3>
        <div class="product-bottom">
          <span class="product-price">${formatPrice(product.price)}</span>
          <div class="product-actions">
            <button class="small-btn" onclick="openProduct(${product.id})">Деталі</button>
            <button class="small-btn add-btn" onclick="addToCart(${product.id})">У кошик</button>
          </div>
        </div>
      </div>
    </article>
  `).join("");

  emptyState.classList.toggle("hidden", filtered.length > 0);
}

function setCategory(category) {
  activeCategory = category;

  document.querySelectorAll(".filter").forEach(button => {
    button.classList.toggle("active", button.dataset.filter === category);
  });

  renderProducts();

  document.getElementById("catalog").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function addToCart(id) {
  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id, quantity: 1 });
  }

  saveCart();
  renderCart();
  openCart();
}

function changeQuantity(id, amount) {
  const item = cart.find(item => item.id === id);
  if (!item) return;

  item.quantity += amount;

  if (item.quantity <= 0) {
    cart = cart.filter(item => item.id !== id);
  }

  saveCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  renderCart();
}

function renderCart() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="cart-empty">
        <div style="font-size:48px;margin-bottom:15px">🛒</div>
        <h3>Кошик порожній</h3>
        <p>Додайте товари з каталогу.</p>
      </div>
    `;
    cartTotal.textContent = "0 грн";
    return;
  }

  let total = 0;

  cartItems.innerHTML = cart.map(item => {
    const product = products.find(p => p.id === item.id);
    const itemTotal = product.price * item.quantity;
    total += itemTotal;

    return `
      <div class="cart-item">
        <div class="cart-item-image">${product.emoji}</div>
        <div>
          <h4>${product.name}</h4>
          <div class="cart-item-price">${formatPrice(product.price)}</div>
          <div class="quantity">
            <button onclick="changeQuantity(${product.id}, -1)">−</button>
            <strong>${item.quantity}</strong>
            <button onclick="changeQuantity(${product.id}, 1)">+</button>
          </div>
        </div>
        <button class="remove-item" onclick="removeFromCart(${product.id})" aria-label="Видалити">×</button>
      </div>
    `;
  }).join("");

  cartTotal.textContent = formatPrice(total);
}

function openCart() {
  cartDrawer.classList.add("open");
  overlay.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  cartDrawer.classList.remove("open");
  overlay.classList.remove("show");
  document.body.style.overflow = "";
}

function openProduct(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  modalContent.innerHTML = `
    <div class="modal-product">
      ${homeProductGallery(product)}
      <div class="modal-product-info">
        <span class="product-category">${product.category}</span>
        <h2>${product.name}</h2>
        <p>${product.description}</p>
        <div class="price">${formatPrice(product.price)}</div>
        <button class="primary-btn full" onclick="addToCart(${product.id}); closeProductModal();">
          Додати до кошика
        </button>
      </div>
    </div>
  `;

  productModal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeProductModal() {
  productModal.classList.remove("open");
  if (!cartDrawer.classList.contains("open")) {
    document.body.style.overflow = "";
  }
}

function openCheckout() {
  if (cart.length === 0) {
    alert("Спочатку додайте хоча б один товар до кошика.");
    return;
  }

  checkoutModal.classList.add("open");
  closeCart();
  document.body.style.overflow = "hidden";
}

function closeCheckout() {
  checkoutModal.classList.remove("open");
  document.body.style.overflow = "";
}

document.getElementById("cartBtn").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

document.getElementById("closeModal").addEventListener("click", closeProductModal);

productModal.addEventListener("click", event => {
  if (event.target === productModal) closeProductModal();
});

document.getElementById("checkoutBtn").addEventListener("click", openCheckout);
document.getElementById("closeCheckout").addEventListener("click", closeCheckout);

checkoutModal.addEventListener("click", event => {
  if (event.target === checkoutModal) closeCheckout();
});

document.getElementById("checkoutForm").addEventListener("submit", event => {
  event.preventDefault();

  const name = document.getElementById("customerName").value.trim();
  const phone = document.getElementById("customerPhone").value.trim();
  const comment = document.getElementById("customerComment").value.trim();

  if (!name || !phone) return;

  const order = {
    name,
    phone,
    comment,
    items: cart.map(item => {
      const product = products.find(p => p.id === item.id);
      return {
        name: product.name,
        quantity: item.quantity,
        price: product.price
      };
    }),
    createdAt: new Date().toISOString()
  };

  console.log("Нове замовлення:", order);

  document.getElementById("checkoutForm").classList.add("hidden");
  document.getElementById("successMessage").classList.remove("hidden");

  cart = [];
  saveCart();
  renderCart();

  setTimeout(() => {
    closeCheckout();
    document.getElementById("checkoutForm").reset();
    document.getElementById("checkoutForm").classList.remove("hidden");
    document.getElementById("successMessage").classList.add("hidden");
  }, 3000);
});

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => setCategory(button.dataset.filter));
});

document.querySelectorAll(".category-card").forEach(card => {
  card.addEventListener("click", () => setCategory(card.dataset.category));
});

document.getElementById("searchInput").addEventListener("input", renderProducts);
document.getElementById("sortSelect").addEventListener("change", renderProducts);

document.querySelectorAll('input[name="gender"]').forEach(input => {
  input.addEventListener("change", () => {
    activeGender = input.value;
    renderProducts();
  });
});

document.getElementById("priceFrom").addEventListener("input", renderProducts);
document.getElementById("priceTo").addEventListener("input", renderProducts);

document.getElementById("filterToggle").addEventListener("click", () => {
  const sidebar = document.getElementById("catalogSidebar");
  const isCollapsed = sidebar.classList.toggle("is-collapsed");
  document.getElementById("filterToggle").setAttribute("aria-expanded", String(!isCollapsed));
});

document.getElementById("resetFilters").addEventListener("click", () => {
  activeCategory = "all";
  activeGender = "all";
  document.getElementById("priceFrom").value = "";
  document.getElementById("priceTo").value = "";
  document.querySelector('input[name="gender"][value="all"]').checked = true;
  document.querySelectorAll(".filter").forEach(button => {
    button.classList.toggle("active", button.dataset.filter === "all");
  });
  renderProducts();
});

document.getElementById("searchBtn").addEventListener("click", () => {
  document.getElementById("searchInput").focus();
  document.getElementById("catalog").scrollIntoView({
    behavior: "smooth"
  });
});

document.getElementById("menuBtn").addEventListener("click", () => {
  document.getElementById("mobileMenu").classList.toggle("open");
});

document.querySelectorAll(".mobile-menu a").forEach(link => {
  link.addEventListener("click", () => {
    document.getElementById("mobileMenu").classList.remove("open");
  });
});

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

renderProducts();
renderCart();

/* =========================
   INSTAGRAM BUTTON
========================= */
const instagramBtn = document.getElementById("instagramBtn");
const instagramModal = document.getElementById("instagramModal");
const closeInstagram = document.getElementById("closeInstagram");

if (instagramBtn && instagramModal && closeInstagram) {

  // Відкрити вікно
  instagramBtn.addEventListener("click", function (e) {
    e.preventDefault();
    instagramModal.classList.add("show");
  });

  // Закрити по хрестику
  closeInstagram.addEventListener("click", function () {
    instagramModal.classList.remove("show");
  });

  // Закрити при натисканні за межами вікна
  instagramModal.addEventListener("click", function (e) {
    if (e.target === instagramModal) {
      instagramModal.classList.remove("show");
    }
  });

  // Закрити клавішею Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      instagramModal.classList.remove("show");
    }
  });
}