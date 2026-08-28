import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc
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
   ADMIN
========================= */

const ADMIN_CODE = "Pasakstas123";

const loginForm = document.getElementById("loginForm");
const loginSection = document.getElementById("adminLogin");
const dashboard = document.getElementById("adminDashboard");
const adminForm = document.getElementById("adminProductForm");

const adminPhoto = document.getElementById("adminPhoto");
const photoPreview = document.getElementById("photoPreview");
const productList = document.getElementById("adminProductList");
const productSearch =
  document.getElementById("adminProductSearch");

let allAdminProducts = [];
const CLOUD_NAME = "nice-gamer";
const UPLOAD_PRESET = "my-shop";


/* =========================
   PHOTOS
========================= */

let selectedPhotos = [];
let activePhotoIndex = 0;

adminPhoto.multiple = true;
adminPhoto.accept = "image/*";

const previewStrip = document.createElement("div");
previewStrip.className = "admin-photo-previews";
photoPreview.after(previewStrip);


function renderPhotoPreviews() {

  if (!selectedPhotos.length) {

    photoPreview.classList.add("hidden");
    photoPreview.src = "";

    previewStrip.innerHTML = "";

    activePhotoIndex = 0;

    return;
  }

  if (activePhotoIndex >= selectedPhotos.length) {
    activePhotoIndex = selectedPhotos.length - 1;
  }

  photoPreview.src = selectedPhotos[activePhotoIndex];
  photoPreview.classList.remove("hidden");


  previewStrip.innerHTML = selectedPhotos.map((photo, index) => `

    <div class="admin-photo-thumb-wrap${index === activePhotoIndex ? " active" : ""}">

      <img
        src="${photo}"
        alt="Фото ${index + 1}"
        onclick="setActivePhoto(${index})"
        title="Натисніть для перегляду"
        style="cursor:pointer;"
      >

      <button
        type="button"
        class="admin-photo-remove-btn"
        onclick="removeSelectedPhoto(event, ${index})"
        title="Видалити це фото"
        aria-label="Видалити фото"
      >
        ×
      </button>

      ${index === 0
        ? '<span class="admin-photo-badge">Головне</span>'
        : ""
      }

    </div>

  `).join("");
}


window.setActivePhoto = function(index) {

  const photo = selectedPhotos[index];

  selectedPhotos.splice(index, 1);
  selectedPhotos.unshift(photo);

  activePhotoIndex = 0;

  renderPhotoPreviews();
};


window.removeSelectedPhoto = function(event, index) {

  if (event) {
    event.stopPropagation();
  }

  selectedPhotos.splice(index, 1);

  if (activePhotoIndex >= selectedPhotos.length) {

    activePhotoIndex =
      Math.max(0, selectedPhotos.length - 1);

  }

  renderPhotoPreviews();
};


/* =========================
   CATEGORIES / SIZES
========================= */

const categorySelect =
  document.getElementById("adminCategory");


const sizePicker = document.createElement("fieldset");

sizePicker.className = "size-picker";

sizePicker.innerHTML = `
  <legend>Розміри товару</legend>
  <div class="size-options" id="sizeOptions"></div>
`;

document
  .getElementById("adminPrice")
  .closest("label")
  .after(sizePicker);


const clothingCategories = new Set([
  "Футболки",
  "Комплекти",
  "Сорочки",
  "Світшоти та худі",
  "Светри та кофти",
  "Куртки та вітровки",
  "Пальта та плащі",
  "Штани",
  "Шорти",
  "Спідниці",
  "Сукні",
  "Комбінезони",
  "Жилетки",
  "Спортивний одяг",
  "Нижня білизна",
  "Домашній одяг",
  "Купальники"
]);


const footwearCategories = new Set([
  "Кросівки",
  "Кеди",
  "Черевики та чоботи",
  "Туфлі та лофери",
  "Сандалі та босоніжки",
  "Шльопанці та капці"
]);


const jeansCategories = new Set([
  "Джинси"
]);


const sizeSets = {

  clothing: [
    "XXS",
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "XXL",
    "XXXL"
  ],

  jeans: [
    "26",
    "27",
    "28",
    "29",
    "30",
    "31",
    "32",
    "33",
    "34",
    "36",
    "38",
    "26S",
    "26R",
    "26L",
    "27S",
    "27R",
    "27L",
    "28S",
    "28R",
    "28L",
    "29S",
    "29R",
    "29L",
    "30S",
    "30R",
    "30L",
    "31S",
    "31R",
    "31L",
    "32S",
    "32R",
    "32L",
    "33S",
    "33R",
    "33L",
    "34S",
    "34R",
    "34L",
    "36S",
    "36R",
    "36L",
    "38S",
    "38R",
    "38L",
    "26/30",
    "26/32",
    "27/30",
    "27/32",
    "28/30",
    "28/32",
    "29/30",
    "29/32",
    "30/30",
    "30/32",
    "30/34",
    "31/32",
    "31/34",
    "32/30",
    "32/32",
    "32/34",
    "33/32",
    "33/34",
    "34/32",
    "34/34",
    "36/32",
    "36/34",
    "38/32",
    "38/34"
  ],

  footwear: [
    "36",
    "37",
    "38",
    "39",
    "40",
    "41",
    "42",
    "43",
    "44",
    "45",
    "46"
  ],

  accessory: [
    "One size"
  ]

};


function getSizesForCategory() {

  const category = categorySelect.value;

  if (jeansCategories.has(category)) {
    return sizeSets.jeans;
  }

  if (clothingCategories.has(category)) {
    return sizeSets.clothing;
  }

  if (footwearCategories.has(category)) {
    return sizeSets.footwear;
  }

  return sizeSets.accessory;
}


function renderSizeOptions() {

  const sizes = getSizesForCategory();

  document.getElementById("sizeOptions").innerHTML =
    sizes.map(size => `

      <label>
        <input
          type="checkbox"
          name="productSize"
          value="${size}"
        >
        ${size}
      </label>

    `).join("");


  document
    .querySelectorAll('input[name="productSize"]')
    .forEach(checkbox => {

      checkbox.addEventListener(
        "change",
        renderSizeStockPanel
      );

    });
}


const sizeStockPanel =
  document.getElementById("sizeStockPanel");


function renderSizeStockPanel() {

  const selectedSizes =
    [
      ...document.querySelectorAll(
        'input[name="productSize"]:checked'
      )
    ].map(
      input => input.value
    );


  const previousValues = {};

  sizeStockPanel
    .querySelectorAll(".size-stock-input")
    .forEach(input => {

      previousValues[input.dataset.size] =
        input.value;

    });


  if (!selectedSizes.length) {

    sizeStockPanel.innerHTML =
      '<p class="admin-empty">Спочатку виберіть розміри вище.</p>';

    return;
  }


  sizeStockPanel.innerHTML =
    selectedSizes.map(size => `

      <label style="margin-bottom:8px;">

        ${size}

        <input
          type="number"
          class="size-stock-input"
          data-size="${size}"
          min="0"
          value="${previousValues[size] ?? 0}"
          required
        >

      </label>

    `).join("");
}


categorySelect.addEventListener("change", () => {

  renderSizeOptions();

  renderSizeStockPanel();

});


renderSizeOptions();
renderSizeStockPanel();


/* =========================
   FIREBASE PRODUCTS
========================= */

async function getProducts() {

  try {

    const snapshot =
      await getDocs(collection(db, "products"));

    return snapshot.docs.map(productDoc => ({

      id: productDoc.id,

      ...productDoc.data()

    }));

  } catch (error) {

  console.error("FIREBASE ERROR:", error);

  alert(
    "Помилка Firebase:\n\n" +
    error.code +
    "\n\n" +
    error.message
  );


    return [];
  }
}


/* =========================
   ADD PRODUCT
========================= */

async function addProduct(product) {

  try {

    const docRef =
      await addDoc(
        collection(db, "products"),
        product
      );

    return docRef.id;

  } catch (error) {

    console.error(
      "Помилка додавання товару:",
      error
    );

    throw error;
  }
}


/* =========================
   DELETE PRODUCT
========================= */

async function deleteProduct(id) {

  if (!confirm("Ви точно хочете видалити цей товар?")) {
    return;
  }

  try {

    await deleteDoc(
      doc(db, "products", id)
    );

    await renderProducts();

  } catch (error) {

    console.error(
      "Помилка видалення:",
      error
    );

    alert(
      "Не вдалося видалити товар."
    );
  }
}


window.deleteProduct = deleteProduct;


/* =========================
   RENDER PRODUCTS
========================= */

async function renderProducts() {

  productList.innerHTML =
    '<p class="admin-empty">Завантаження товарів...</p>';

  try {

    allAdminProducts = await getProducts();

    renderAdminProductList();

  } catch (error) {

    console.error(
      "Помилка завантаження товарів:",
      error
    );

    productList.innerHTML =
      '<p class="admin-empty">Не вдалося завантажити товари.</p>';

  }

}
function renderAdminProductList() {

  const search =
    productSearch.value
      .toLowerCase()
      .trim();

  const filteredProducts =
    allAdminProducts.filter(product =>
      (product.name || "")
        .toLowerCase()
        .includes(search)
    );


  /* Лічильник */

  const productCount =
    document.getElementById("adminProductCount");

  if (productCount) {

    if (search) {

      productCount.textContent =
        `${filteredProducts.length} з ${allAdminProducts.length}`;

    } else {

      const count =
        allAdminProducts.length;

      productCount.textContent =
        `${count} ${
          count === 1
            ? "товар"
            : count < 5
              ? "товари"
              : "товарів"
        }`;
    }
  }


  /* Нічого не знайдено */

  if (!filteredProducts.length) {

    productList.innerHTML = search
      ? `
        <div class="admin-empty">
          <div style="font-size:35px;margin-bottom:10px;">
            🔍
          </div>

          <strong>Товар не знайдено</strong>

          <p>
            За запитом «${search}» нічого немає.
          </p>
        </div>
      `
      : `
        <p class="admin-empty">
          Тут ще немає доданих товарів.
        </p>
      `;

    return;
  }


  /* Виводимо товари */

  productList.innerHTML =
    filteredProducts.map(product => `

      <article class="admin-product-item">

        <img
          src="${product.image || ""}"
          alt="${product.name || ""}"
        >

        <div>

          <h3 title="${product.name || ""}">
            ${product.name || "Без назви"}
          </h3>

          <p>
            ${
              new Intl.NumberFormat("uk-UA")
                .format(product.price || 0)
            } грн
            ·
            ${product.description || ""}
          </p>

          <p style="font-size:12px;color:#666;">

            ${
              product.season
                ? `Сезон: ${product.season}`
                : "Сезон не вказано"
            }

            · 📦

            ${
              Object.entries(product.sizeStock || {})
                .map(
                  ([size, qty]) =>
                    `${size}: ${qty}`
                )
                .join(" | ")
              || "не вказано"
            }

          </p>

        </div>

        <button
          class="remove-item"
          type="button"
          onclick="deleteProduct('${product.id}')"
          aria-label="Видалити товар"
          title="Видалити товар"
        >
          ×
        </button>

      </article>

    `).join("");
}
productSearch.addEventListener("input", () => {
  renderAdminProductList();
});
/* =========================
   DASHBOARD
========================= */

async function showDashboard() {

  loginSection.classList.add("hidden");

  dashboard.classList.remove("hidden");

  await renderProducts();
}


/* =========================
   LOGIN
========================= */

loginForm.addEventListener("submit", event => {

  event.preventDefault();

  const code =
    document.getElementById("adminCode").value;


  if (code === ADMIN_CODE) {

    sessionStorage.setItem(
      "modaAdmin",
      "true"
    );

    showDashboard();

  } else {

    document
      .getElementById("loginError")
      .classList.remove("hidden");

  }

});


/* =========================
   LOGOUT
========================= */

document
  .getElementById("logoutBtn")
  .addEventListener("click", () => {

    sessionStorage.removeItem(
      "modaAdmin"
    );

    dashboard.classList.add("hidden");

    loginSection.classList.remove("hidden");

    loginForm.reset();

  });


/* =========================
   CLOUDINARY
========================= */

async function uploadToCloudinary(file) {

  const formData =
    new FormData();

  formData.append(
    "file",
    file
  );

  formData.append(
    "upload_preset",
    UPLOAD_PRESET
  );


  const response =
    await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData
      }
    );


  if (!response.ok) {

    const errorText =
      await response.text();

    console.error(
      "Cloudinary error:",
      errorText
    );

    throw new Error(
      "Помилка завантаження фото"
    );
  }


  const data =
    await response.json();

  return data.secure_url;
}


/* =========================
   PHOTO SELECT
========================= */

adminPhoto.addEventListener(
  "change",
  async () => {

    const files =
      [...adminPhoto.files]
        .filter(file =>
          file.type.startsWith("image/")
        );


    if (!files.length) {
      return;
    }


    try {

      const uploadedUrls =
        await Promise.all(
          files.map(
            file =>
              uploadToCloudinary(file)
          )
        );


      selectedPhotos =
        [
          ...selectedPhotos,
          ...uploadedUrls
        ];


      activePhotoIndex =
        selectedPhotos.length -
        uploadedUrls.length;


      renderPhotoPreviews();


    } catch (error) {

      console.error(error);

      alert(
        "Не вдалося завантажити фото в Cloudinary."
      );

    }


    adminPhoto.value = "";

  }
);


/* =========================
   ADD PRODUCT FORM
========================= */

adminForm.addEventListener(
  "submit",
  async event => {

    event.preventDefault();


    if (!selectedPhotos.length) {

      alert(
        "Додайте хоча б одне фото товару."
      );

      return;
    }


    const sizes =
      [
        ...document.querySelectorAll(
          'input[name="productSize"]:checked'
        )
      ].map(
        input => input.value
      );


    if (!sizes.length) {

      alert(
        "Виберіть хоча б один розмір."
      );

      return;
    }


    const sizeStock =
      Object.fromEntries(

        [
          ...document.querySelectorAll(
            ".size-stock-input"
          )
        ].map(input => [

          input.dataset.size,

          Number(input.value)

        ])

      );


    const product = {

      name:
        document
          .getElementById("adminName")
          .value
          .trim(),

      category:
        document
          .getElementById("adminCategory")
          .value,

      gender:
        document
          .getElementById("adminGender")
          .value,

      season:
        document
          .getElementById("adminSeason")
          .selectedOptions[0]
          .textContent,

      sizes,

      price:
        Number(
          document
            .getElementById("adminPrice")
            .value
        ),

      sizeStock,

      image:
        selectedPhotos[0],

      photos:
        selectedPhotos,

      badge:
        "Новинка",

      description:
        document
          .getElementById("adminDescription")
          .value
          .trim(),

      isCustom:
        true,

      createdAt:
        new Date().toISOString()

    };


    try {

      const submitButton =
        adminForm.querySelector(
          'button[type="submit"]'
        );


      if (submitButton) {

        submitButton.disabled = true;

        submitButton.textContent =
          "Збереження...";

      }


      await addProduct(product);


      alert(
        "Товар успішно додано!"
      );


      adminForm.reset();

      selectedPhotos = [];

      activePhotoIndex = 0;

      renderPhotoPreviews();

      renderSizeOptions();

      renderSizeStockPanel();

      await renderProducts();


    } catch (error) {

      console.error(error);

      alert(
        "Не вдалося зберегти товар у Firebase."
      );


    } finally {

      const submitButton =
        adminForm.querySelector(
          'button[type="submit"]'
        );


      if (submitButton) {

        submitButton.disabled = false;

        submitButton.textContent =
          "Додати товар";

      }

    }

  }
);


/* =========================
   START
========================= */

if (
  sessionStorage.getItem(
    "modaAdmin"
  ) === "true"
) {

  showDashboard();

}