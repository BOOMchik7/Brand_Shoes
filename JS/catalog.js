import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/* =========================
   FIREBASE
========================= */

const firebaseConfig = {
  apiKey: "AIzaSyAzrEHz_xY4ZOGaIYxXy7V8NLz8d5cEpoI",
  authDomain: "outfo-694c7.firebaseapp.com",
  projectId: "outfo-694c7",
  storageBucket: "outfo-694c7.firebasestorage.app",
  messagingSenderId: "340695163007",
  appId: "1:340695163007:web:e525549333be192e5c1f4a",
  measurementId: "G-T179WT7S0L"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


/* =========================
   PRODUCTS
========================= */

// Тут будуть товари з Firebase
let products = [];


/* =========================
   FIREBASE PRODUCTS
========================= */

async function loadProducts() {

  try {

    const snapshot = await getDocs(
      collection(db, "products")
    );

    products = snapshot.docs.map(productDoc => ({
      id: productDoc.id,
      ...productDoc.data()
    }));

    products.forEach(product => {

      if (!product.sizes) {
        product.sizes = [];
      }

      if (!product.photos) {
        product.photos = product.image
          ? [product.image]
          : [];
      }

    });

    console.log("✅ Товари Firebase:", products);

    renderSizeFilters();
    renderCatalog();
    renderCart();

  } catch (error) {

    console.error(
      "❌ Помилка завантаження товарів Firebase:",
      error
    );

    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:40px;">
        <h3>Не вдалося завантажити товари</h3>
        <p>${error.message}</p>
      </div>
    `;

  }

}


/* =========================
   ELEMENTS
========================= */

const grid =
  document.getElementById("catalogGrid");

const empty =
  document.getElementById("catalogEmpty");

const modal =
  document.getElementById("catalogModal");

const modalContent =
  document.getElementById("catalogModalContent");

const cartDrawer =
  document.getElementById("cartDrawer");

const overlay =
  document.getElementById("overlay");


/* =========================
   CART
========================= */

let cart =
  JSON.parse(
    localStorage.getItem("modaCart")
  ) || [];


function saveCart() {

  localStorage.setItem(
    "modaCart",
    JSON.stringify(cart)
  );

}


/* =========================
   SIZE FILTER
========================= */

const sizeFilterGroup =
  document.createElement("div");

sizeFilterGroup.className =
  "filter-group";

sizeFilterGroup.innerHTML = `
  <p class="filter-title">Розмір</p>
  <div
    class="size-options"
    id="catalogSizeOptions"
  ></div>
`;

document
  .querySelector(".filter-panel")
  .append(sizeFilterGroup);


function renderSizeFilters() {

  const sizes = [
    ...new Set(
      products.flatMap(
        product => product.sizes || []
      )
    )
  ];

  document
    .getElementById("catalogSizeOptions")
    .innerHTML = sizes.map(size => `
      <label>
        <input
          type="checkbox"
          name="catalogSize"
          value="${size}"
        >
        ${size}
      </label>
    `).join("");

}


/* =========================
   HELPERS
========================= */

function formatPrice(price) {

  return new Intl.NumberFormat(
    "uk-UA"
  ).format(price) + " грн";

}


function productVisual(product) {

  if (product.image) {

    return `
      <img
        src="${product.image}"
        alt="${product.name}"
        loading="lazy"
      >
    `;

  }

  return `<span>${product.emoji || "🛍️"}</span>`;

}


/* =========================
   PRODUCT GALLERY
========================= */

function productGallery(product) {

  const photos =
    product.photos &&
    product.photos.length
      ? product.photos
      : product.image
        ? [product.image]
        : [];


  if (!photos.length) {

    return `
      <div class="modal-product-image">
        ${productVisual(product)}
      </div>
    `;

  }


  const controls =
    photos.length > 1
      ? `
        <button
          class="gallery-arrow gallery-prev"
          type="button"
          onclick="changeProductPhoto('${product.id}', -1)"
          aria-label="Попереднє фото"
        >
          ←
        </button>

        <button
          class="gallery-arrow gallery-next"
          type="button"
          onclick="changeProductPhoto('${product.id}', 1)"
          aria-label="Наступне фото"
        >
          →
        </button>
      `
      : "";


  const thumbnails =
    photos.length > 1
      ? `
        <div class="gallery-thumbnails">

          ${photos.map((photo, index) => `

            <button
              class="gallery-thumb${index === 0 ? " active" : ""}"
              type="button"
              onclick="selectProductPhoto('${product.id}', ${index})"
              aria-label="Фото ${index + 1}"
            >

              <img
                src="${photo}"
                alt=""
              >

            </button>

          `).join("")}

        </div>
      `
      : "";


  return `
    <div class="product-gallery">

      <div class="modal-product-image">

        <img
          id="galleryMainImage"
          src="${photos[0]}"
          alt="${product.name}"
        >

        ${controls}

      </div>

      ${thumbnails}

    </div>
  `;

}


/* =========================
   GALLERY CONTROLS
========================= */

function selectProductPhoto(
  productId,
  index
) {

  const product =
    products.find(
      item => item.id === productId
    );

  if (!product) return;


  const photos =
    product.photos &&
    product.photos.length
      ? product.photos
      : product.image
        ? [product.image]
        : [];


  if (!photos[index]) return;


  const mainImage =
    document.getElementById(
      "galleryMainImage"
    );

  if (mainImage) {
    mainImage.src = photos[index];
  }


  document
    .querySelectorAll(".gallery-thumb")
    .forEach(
      (thumb, thumbIndex) => {

        thumb.classList.toggle(
          "active",
          thumbIndex === index
        );

      }
    );

}


function changeProductPhoto(
  productId,
  direction
) {

  const product =
    products.find(
      item => item.id === productId
    );

  if (!product) return;


  const photos =
    product.photos &&
    product.photos.length
      ? product.photos
      : product.image
        ? [product.image]
        : [];


  if (photos.length <= 1) return;


  const activeThumb =
    [
      ...document.querySelectorAll(
        ".gallery-thumb"
      )
    ].findIndex(
      thumb =>
        thumb.classList.contains("active")
    );


  const currentIndex =
    activeThumb >= 0
      ? activeThumb
      : 0;


  const nextIndex =
    (
      currentIndex +
      direction +
      photos.length
    ) % photos.length;


  selectProductPhoto(
    productId,
    nextIndex
  );

}


window.selectProductPhoto =
  selectProductPhoto;

window.changeProductPhoto =
  changeProductPhoto;


/* =========================
   CATALOG
========================= */

function renderCatalog() {

  const query =
    document
      .getElementById("catalogSearch")
      .value
      .toLowerCase()
      .trim();


  const category =
    document
      .getElementById("catalogCategory")
      .value;


  const season =
    document
      .querySelector(
        'input[name="catalogSeason"]:checked'
      )
      .value;


  const gender =
    document
      .querySelector(
        'input[name="catalogGender"]:checked'
      )
      .value;


  const from =
    Number(
      document
        .getElementById("catalogPriceFrom")
        .value
    ) || 0;


  const to =
    Number(
      document
        .getElementById("catalogPriceTo")
        .value
    ) || Infinity;


  const selectedSizes =
    [
      ...document.querySelectorAll(
        'input[name="catalogSize"]:checked'
      )
    ].map(
      input => input.value
    );


  const filtered =
    products.filter(product => {

      const productName =
        (product.name || "")
          .toLowerCase();

      const productCategory =
        (product.category || "")
          .toLowerCase();


      const matchesSearch =
        productName.includes(query) ||
        productCategory.includes(query);


      const matchesCategory =
        category === "all" ||
        product.category === category;


      const matchesSeason =
        season === "all" ||
        product.season === season;


      const matchesGender =
        gender === "all" ||
        product.gender === gender ||
        product.gender === "unisex";


      const matchesPrice =
        Number(product.price) >= from &&
        Number(product.price) <= to;


      const matchesSize =
        !selectedSizes.length ||
        (product.sizes || []).some(
          size =>
            selectedSizes.includes(size)
        );


      return (
        matchesSearch &&
        matchesCategory &&
        matchesSeason &&
        matchesGender &&
        matchesPrice &&
        matchesSize
      );

    });


  grid.innerHTML =
    filtered.map(product => `

      <article
        class="product-card product-card-clickable"
        tabindex="0"
        role="button"
        data-product-id="${product.id}"
      >

        <div class="product-image">

          ${productVisual(product)}

        </div>

        <div class="product-info">

          <span class="product-category">
            ${product.category || ""}
          </span>

          <h3>
            ${product.name || ""}
          </h3>

          <span class="product-price">
            ${formatPrice(product.price || 0)}
          </span>

        </div>

      </article>

    `).join("");


  empty.classList.toggle(
    "hidden",
    filtered.length > 0
  );

}


/* =========================
   OPEN PRODUCT
========================= */

function openProduct(id) {

  const product =
    products.find(
      item => item.id === id
    );

  if (!product) return;


  const sizeStockInfo =
    product.sizeStock || {};


  const sizeSelector =
    (product.sizes || [])
      .map(size => {

        const stock =
          Number(
            sizeStockInfo[size] || 0
          );


        const available =
          stock > 0;


        return `
          <label
            style="
              display:block;
              margin:8px 0;
              padding:8px;
              border:1px solid #ddd;
              border-radius:4px;
              cursor:${available ? "pointer" : "not-allowed"};
              opacity:${available ? "1" : "0.5"};
            "
          >

            <input
              type="radio"
              name="selectedSize_${product.id}"
              value="${size}"
              ${available ? "" : "disabled"}
              style="margin-right:8px;"
            >

            <strong>${size}</strong>

            —
            ${
              available
                ? `✅ ${stock} шт.`
                : "❌ Немає"
            }

          </label>
        `;

      })
      .join("");


  const canAddToCart =
    Object.values(sizeStockInfo)
      .some(
        qty => Number(qty) > 0
      );


  const buttonState =
    canAddToCart

      ? `
        <button
          class="primary-btn full"
          type="button"
          onclick="addToCartWithSize('${product.id}')"
        >
          Додати до кошика
        </button>
      `

      : `
        <button
          class="primary-btn full"
          type="button"
          disabled
          style="opacity:0.5;cursor:not-allowed;"
        >
          Немає в наявності
        </button>
      `;


  const seasonInfo =
    product.season
      ? `<p><strong>Сезон:</strong> ${product.season}</p>`
      : "";


  modalContent.innerHTML = `

    <div class="modal-product">

      ${productGallery(product)}

      <div class="modal-product-info">

        <span class="product-category">
          ${product.category || ""}
        </span>

        <h2>
          ${product.name || ""}
        </h2>

        <p>
          ${
            product.description ||
            "Деталі товару уточнюйте за контактним номером."
          }
        </p>

        ${seasonInfo}

        <p>
          <strong>
            Виберіть розмір:
          </strong>
        </p>

        ${sizeSelector}

        <div class="price">
          ${formatPrice(product.price || 0)}
        </div>

        ${buttonState}

      </div>

    </div>

  `;


  modal.classList.add("open");

  document.body.style.overflow =
    "hidden";

}


function closeProduct() {

  modal.classList.remove("open");

  document.body.style.overflow =
    "";

}


/* =========================
   CART
========================= */

function renderCart() {

  const cartItems =
    document.getElementById(
      "cartItems"
    );


  document.getElementById(
    "cartCount"
  ).textContent =
    cart.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );


  if (!cart.length) {

    cartItems.innerHTML = `
      <div class="cart-empty">

        <div
          style="
            font-size:48px;
            margin-bottom:15px
          "
        >
          🛒
        </div>

        <h3>
          Кошик порожній
        </h3>

        <p>
          Додайте товари з каталогу.
        </p>

      </div>
    `;

    document.getElementById(
      "cartTotal"
    ).textContent =
      "0 грн";

    return;

  }


  let total = 0;


  cartItems.innerHTML =
    cart.map(item => {

      const product =
        products.find(
          product =>
            product.id === item.id
        );


      if (!product) return "";


      total +=
        Number(product.price) *
        item.quantity;


      const sizeInfo =
        item.size
          ? ` (розмір: ${item.size})`
          : "";


      return `
        <div class="cart-item">

          <div class="cart-item-image">

            ${
              product.image
                ? `<img src="${product.image}" alt="">`
                : product.emoji || "🛍️"
            }

          </div>

          <div>

            <h4>
              ${product.name}${sizeInfo}
            </h4>

            <div class="cart-item-price">
              ${formatPrice(product.price)}
            </div>

            <div class="quantity">

              <button
                onclick="changeQuantity('${item.cartKey || item.id}', -1)"
              >
                −
              </button>

              <strong>
                ${item.quantity}
              </strong>

              <button
                onclick="changeQuantity('${item.cartKey || item.id}', 1)"
              >
                +
              </button>

            </div>

          </div>

          <button
            class="remove-item"
            onclick="removeFromCart('${item.cartKey || item.id}')"
            aria-label="Видалити"
          >
            ×
          </button>

        </div>
      `;

    })
    .join("");


  document.getElementById(
    "cartTotal"
  ).textContent =
    formatPrice(total);

}


/* =========================
   ADD TO CART
========================= */

function addToCartWithSize(
  productId
) {

  const selectedSize =
    document.querySelector(
      `input[name="selectedSize_${productId}"]:checked`
    );


  if (!selectedSize) {

    alert(
      "⚠️ Будь ласка, виберіть розмір"
    );

    return;

  }


  const size =
    selectedSize.value;


  const product =
    products.find(
      p => p.id === productId
    );


  if (!product) return;


  const sizeStock =
    Number(
      (product.sizeStock || {})[size] ||
      0
    );


  if (sizeStock <= 0) {

    alert(
      `❌ На жаль, розмір ${size} закінчився`
    );

    return;

  }


  const cartKey =
    `${productId}_${size}`;


  const item =
    cart.find(
      item =>
        item.cartKey === cartKey
    );


  if (item) {

    if (
      item.quantity >=
      sizeStock
    ) {

      alert(
        `❌ Максимум можна замовити ${sizeStock} шт. розміру ${size}`
      );

      return;

    }

    item.quantity += 1;

  } else {

    cart.push({
      cartKey,
      id: productId,
      size,
      quantity: 1
    });

  }


  saveCart();

  renderCart();

  closeProduct();

  openCart();

}


window.addToCartWithSize =
  addToCartWithSize;


/* =========================
   QUANTITY
========================= */

function changeQuantity(
  cartKey,
  amount
) {

  const item =
    cart.find(
      item =>
        item.cartKey === cartKey ||
        (!item.cartKey &&
          String(item.id) === String(cartKey))
    );


  if (!item) return;


  const product =
    products.find(
      p =>
        String(p.id) ===
        String(item.id)
    );


  if (!product) return;


  const sizeStock =
    item.size
      ? Number(
          (product.sizeStock || {})[
            item.size
          ] || 0
        )
      : Object.values(
          product.sizeStock || {}
        ).reduce(
          (a, b) =>
            a + Number(b),
          0
        );


  item.quantity += amount;


  if (
    sizeStock &&
    item.quantity > sizeStock
  ) {

    item.quantity =
      sizeStock;

    alert(
      `⚠️ На складі лише ${sizeStock} шт. розміру ${item.size || "One size"}`
    );

  }


  if (
    item.quantity <= 0
  ) {

    cart =
      cart.filter(
        i =>
          i.cartKey !== cartKey &&
          !(
            !i.cartKey &&
            String(i.id) ===
            String(cartKey)
          )
      );

  }


  saveCart();

  renderCart();

}


window.changeQuantity =
  changeQuantity;


/* =========================
   REMOVE FROM CART
========================= */

function removeFromCart(
  cartKey
) {

  cart =
    cart.filter(
      item =>
        item.cartKey !== cartKey &&
        !(
          !item.cartKey &&
          String(item.id) ===
          String(cartKey)
        )
    );


  saveCart();

  renderCart();

}


window.removeFromCart =
  removeFromCart;


/* =========================
   CART UI
========================= */

function openCart() {

  cartDrawer.classList.add(
    "open"
  );

  overlay.classList.add(
    "show"
  );

  document.body.style.overflow =
    "hidden";

}


function closeCart() {

  cartDrawer.classList.remove(
    "open"
  );

  overlay.classList.remove(
    "show"
  );

  document.body.style.overflow =
    "";

}


function openCheckout() {

  if (!cart.length) {

    alert(
      "Спочатку додайте товар до кошика."
    );

    return;

  }


  closeCart();

  document
    .getElementById(
      "checkoutModal"
    )
    .classList.add("open");

  document.body.style.overflow =
    "hidden";

}


function closeCheckout() {

  document
    .getElementById(
      "checkoutModal"
    )
    .classList.remove("open");

  document.body.style.overflow =
    "";

}


/* =========================
   EVENTS
========================= */

document
  .getElementById(
    "catalogSearch"
  )
  .addEventListener(
    "input",
    renderCatalog
  );


document
  .getElementById(
    "catalogCategory"
  )
  .addEventListener(
    "change",
    renderCatalog
  );


document
  .getElementById(
    "catalogPriceFrom"
  )
  .addEventListener(
    "input",
    renderCatalog
  );


document
  .getElementById(
    "catalogPriceTo"
  )
  .addEventListener(
    "input",
    renderCatalog
  );


document
  .querySelectorAll(
    'input[name="catalogSeason"]'
  )
  .forEach(
    input =>
      input.addEventListener(
        "change",
        renderCatalog
      )
  );


document
  .querySelectorAll(
    'input[name="catalogGender"]'
  )
  .forEach(
    input =>
      input.addEventListener(
        "change",
        renderCatalog
      )
  );


document
  .getElementById(
    "catalogSizeOptions"
  )
  .addEventListener(
    "change",
    renderCatalog
  );


grid.addEventListener(
  "click",
  event => {

    const card =
      event.target.closest(
        ".product-card-clickable"
      );


    if (card) {

      openProduct(
        card.dataset.productId
      );

    }

  }
);


grid.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Enter" ||
      event.key === " "
    ) {

      const card =
        event.target.closest(
          ".product-card-clickable"
        );


      if (card) {

        event.preventDefault();

        openProduct(
          card.dataset.productId
        );

      }

    }

  }
);


document
  .getElementById(
    "closeCatalogModal"
  )
  .addEventListener(
    "click",
    closeProduct
  );


modal.addEventListener(
  "click",
  event => {

    if (
      event.target === modal
    ) {

      closeProduct();

    }

  }
);


document
  .getElementById(
    "cartBtn"
  )
  .addEventListener(
    "click",
    openCart
  );


document
  .getElementById(
    "closeCart"
  )
  .addEventListener(
    "click",
    closeCart
  );


overlay.addEventListener(
  "click",
  closeCart
);


document
  .getElementById(
    "checkoutBtn"
  )
  .addEventListener(
    "click",
    openCheckout
  );


document
  .getElementById(
    "closeCheckout"
  )
  .addEventListener(
    "click",
    closeCheckout
  );


document
  .getElementById(
    "checkoutModal"
  )
  .addEventListener(
    "click",
    event => {

      if (
        event.target ===
        document.getElementById(
          "checkoutModal"
        )
      ) {

        closeCheckout();

      }

    }
  );


/* =========================
   FORMSPREE
========================= */

const FORMSPREE_URL =
  "https://formspree.io/f/mdenyvwe";


document
  .getElementById(
    "checkoutForm"
  )
  .addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      const submitBtn =
        event.target.querySelector(
          "button[type='submit']"
        );


      const originalText =
        submitBtn.textContent;


      submitBtn.disabled =
        true;

      submitBtn.textContent =
        "📧 Надсилаємо...";


      try {

        const itemsList =
          cart
            .map(item => {

              const product =
                products.find(
                  p =>
                    p.id ===
                    item.id
                );


              if (!product) {
                return "";
              }


              const sizeInfo =
                item.size
                  ? ` розмір ${item.size}`
                  : "";


              return `
                ${product.name}${sizeInfo}
                (${item.quantity}x) -
                ${formatPrice(
                  Number(product.price) *
                  item.quantity
                )}
              `;

            })
            .join("\n");


        const cartTotal =
          cart.reduce(
            (total, item) => {

              const product =
                products.find(
                  p =>
                    p.id ===
                    item.id
                );


              if (!product) {
                return total;
              }


              return (
                total +
                Number(product.price) *
                item.quantity
              );

            },
            0
          );


        const name =
          document
            .getElementById(
              "customerName"
            )
            .value
            .trim();


        const phone =
          document
            .getElementById(
              "customerPhone"
            )
            .value
            .trim();


        const comment =
          document
            .getElementById(
              "customerComment"
            )
            .value
            .trim();


        const message = `
📦 НОВЕ ЗАМОВЛЕННЯ НА OUTFO

👤 Клієнт: ${name}
📞 Телефон: ${phone}

📦 ТОВАРИ:
${itemsList}

💰 Разом: ${formatPrice(cartTotal)}

💭 Примітка: ${comment || "немає"}
        `.trim();


        const response =
          await fetch(
            FORMSPREE_URL,
            {
              method: "POST",

              body:
                JSON.stringify({
                  name,
                  phone,
                  comment,
                  items_list:
                    itemsList,
                  cart_total:
                    formatPrice(
                      cartTotal
                    ),
                  message
                }),

              headers: {
                "Content-Type":
                  "application/json",

                "Accept":
                  "application/json"
              }

            }
          );


        if (!response.ok) {

          console.warn(
            "Formspree error:",
            response.status
          );

          submitBtn.textContent =
            originalText;

          alert(
            "⚠️ Помилка при надсиланні. Спробуйте ще раз."
          );

          return;

        }


        console.log(
          "✅ Замовлення надіслано!"
        );


        submitBtn.textContent =
          "✅ Надіслано!";


        const orders =
          JSON.parse(
            localStorage.getItem(
              "modaOrders"
            )
          ) || [];


        orders.unshift({
          name,
          phone,
          comment,
          items: cart,
          createdAt:
            new Date().toISOString()
        });


        localStorage.setItem(
          "modaOrders",
          JSON.stringify(orders)
        );


        cart = [];

        saveCart();

        renderCart();


        document
          .getElementById(
            "checkoutForm"
          )
          .classList.add(
            "hidden"
          );


        document
          .getElementById(
            "successMessage"
          )
          .classList.remove(
            "hidden"
          );


        setTimeout(() => {

          closeCheckout();

          document
            .getElementById(
              "checkoutForm"
            )
            .reset();

          document
            .getElementById(
              "checkoutForm"
            )
            .classList.remove(
              "hidden"
            );

          document
            .getElementById(
              "successMessage"
            )
            .classList.add(
              "hidden"
            );


          submitBtn.disabled =
            false;

          submitBtn.textContent =
            originalText;

        }, 3000);


      } catch (error) {

        console.error(
          "❌ Помилка замовлення:",
          error
        );

        alert(
          "❌ Помилка: " +
          error.message
        );

        submitBtn.disabled =
          false;

        submitBtn.textContent =
          originalText;

      }

    }
  );


/* =========================
   START
========================= */

loadProducts();

renderCart();