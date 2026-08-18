let products = [
  {
    id: 1,
    name: "Базова футболка Premium",
    category: "Одяг",
    price: 899,
    emoji: "👕",
    badge: "Хіт",
    description: "Універсальна футболка прямого крою з м'якої тканини. Підійде для повсякденних образів."
  },
  {
    id: 2,
    name: "Куртка Urban",
    category: "Одяг",
    price: 2499,
    emoji: "🧥",
    badge: "Новинка",
    description: "Легка міська куртка для прохолодної погоди. Зручний крій та мінімалістичний дизайн."
  },
  {
    id: 3,
    name: "Джинси Classic",
    category: "Одяг",
    price: 1799,
    emoji: "👖",
    badge: "",
    description: "Класичні джинси з комфортною посадкою. Легко поєднуються з повсякденним одягом."
  },
  {
    id: 4,
    name: "Худі Basic",
    category: "Одяг",
    price: 1599,
    emoji: "🧢",
    badge: "Хіт",
    description: "Тепле худі в базовому стилі. М'який матеріал та зручний капюшон."
  },
  {
    id: 5,
    name: "Кросівки Street",
    category: "Взуття",
    price: 2899,
    emoji: "👟",
    badge: "Новинка",
    description: "Повсякденні кросівки з легкою підошвою. Для міста, прогулянок та активного дня."
  },
  {
    id: 6,
    name: "Кеди Classic",
    category: "Взуття",
    price: 1899,
    emoji: "👟",
    badge: "",
    description: "Лаконічні кеди на кожен день. Класичний дизайн, який не виходить з моди."
  },
  {
    id: 7,
    name: "Шкіряний ремінь",
    category: "Аксесуари",
    price: 799,
    emoji: "🪢",
    badge: "",
    description: "Класичний ремінь, який доповнить як джинси, так і більш формальний образ."
  },
  {
    id: 8,
    name: "Міська сумка",
    category: "Аксесуари",
    price: 1299,
    emoji: "👜",
    badge: "Хіт",
    description: "Практична сумка для міста з достатнім місцем для щоденних речей."
  },
  {
    id: 9,
    name: "Кепка Logo",
    category: "Аксесуари",
    price: 649,
    emoji: "🧢",
    badge: "",
    description: "Базова кепка з регульованим розміром. Простий аксесуар для завершення образу."
  },
  {
    id: 10,
    name: "Світшот Comfort",
    category: "Одяг",
    price: 1399,
    emoji: "👚",
    badge: "",
    description: "Комфортний світшот вільного крою для прохолодних вечорів та щоденних образів."
  },
  {
    id: 11,
    name: "Черевики City",
    category: "Взуття",
    price: 3299,
    emoji: "🥾",
    badge: "Новинка",
    description: "Міцні міські черевики для осіннього та зимового сезону."
  },
  {
    id: 12,
    name: "Гаманець Compact",
    category: "Аксесуари",
    price: 999,
    emoji: "👛",
    badge: "",
    description: "Компактний гаманець для карток, готівки та щоденного використання."
  }
];

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
      <div class="modal-product-image">${productImage(product, true)}</div>
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

document.getElementById("year").textContent = new Date().getFullYear();

renderProducts();
renderCart();
