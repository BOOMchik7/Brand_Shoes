const ADMIN_CODE = "Pasakstas123";
const loginForm = document.getElementById("loginForm");
const loginSection = document.getElementById("adminLogin");
const dashboard = document.getElementById("adminDashboard");
const adminForm = document.getElementById("adminProductForm");
const adminPhoto = document.getElementById("adminPhoto");
const photoPreview = document.getElementById("photoPreview");
const productList = document.getElementById("adminProductList");
let selectedPhotos = [];
adminPhoto.multiple = true;
adminPhoto.accept = "image/*";
const previewStrip = document.createElement("div");
previewStrip.className = "admin-photo-previews";
photoPreview.after(previewStrip);
const categorySelect = document.getElementById("adminCategory");
const sizePicker = document.createElement("fieldset");
sizePicker.className = "size-picker";
sizePicker.innerHTML = '<legend>Розміри товару</legend><div class="size-options" id="sizeOptions"></div>';
document.getElementById("adminPrice").closest("label").after(sizePicker);
const sizeSets = [["XS", "S", "M", "L", "XL", "XXL"], ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"], ["One size"]];
function renderSizeOptions() {
  const sizes = sizeSets[categorySelect.selectedIndex] || sizeSets[2];
  document.getElementById("sizeOptions").innerHTML = sizes.map(size => `<label><input type="checkbox" name="productSize" value="${size}"> ${size}</label>`).join("");
}
categorySelect.addEventListener("change", renderSizeOptions);
renderSizeOptions();

function getProducts() {
  return JSON.parse(localStorage.getItem("modaProducts")) || [];
}

function saveProducts(products) {
  localStorage.setItem("modaProducts", JSON.stringify(products));
}

function showDashboard() {
  loginSection.classList.add("hidden");
  dashboard.classList.remove("hidden");
  renderProducts();
}

function renderProducts() {
  const products = getProducts();
  if (!products.length) {
    productList.innerHTML = '<p class="admin-empty">Тут ще немає доданих товарів.</p>';
    return;
  }

  productList.innerHTML = products.map(product => `
    <article class="admin-product-item">
      <img src="${product.image}" alt="${product.name}">
      <div><h3>${product.name}</h3><p>${new Intl.NumberFormat("uk-UA").format(product.price)} грн · ${product.description}</p></div>
      <button class="remove-item" type="button" onclick="deleteProduct(${product.id})" aria-label="Видалити товар">×</button>
    </article>
  `).join("");
}

function deleteProduct(id) {
  saveProducts(getProducts().filter(product => product.id !== id));
  renderProducts();
}

loginForm.addEventListener("submit", event => {
  event.preventDefault();
  if (document.getElementById("adminCode").value === ADMIN_CODE) {
    sessionStorage.setItem("modaAdmin", "true");
    showDashboard();
  } else {
    document.getElementById("loginError").classList.remove("hidden");
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  sessionStorage.removeItem("modaAdmin");
  dashboard.classList.add("hidden");
  loginSection.classList.remove("hidden");
  loginForm.reset();
});

adminPhoto.addEventListener("change", async () => {
  const files = [...adminPhoto.files].filter(file => file.type.startsWith("image/")).slice(0, 5);
  if (!files.length) return;
  selectedPhotos = await Promise.all(files.map(file => new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  })));
  photoPreview.src = selectedPhotos[0];
  photoPreview.classList.remove("hidden");
  previewStrip.innerHTML = selectedPhotos.map((photo, index) => `<img src="${photo}" alt="Фото ${index + 1}">`).join("");
});

adminForm.addEventListener("submit", event => {
  event.preventDefault();
  if (!selectedPhotos.length) { alert("Додайте хоча б одне фото."); return; }
  const sizes = [...document.querySelectorAll('input[name="productSize"]:checked')].map(input => input.value);
  if (!sizes.length) { alert("Виберіть хоча б один розмір."); return; }
  const products = getProducts();
  products.unshift({
    id: Date.now(),
    name: document.getElementById("adminName").value.trim(),
    category: document.getElementById("adminCategory").value,
    gender: document.getElementById("adminGender").value,
    sizes,
    price: Number(document.getElementById("adminPrice").value),
    image: selectedPhotos[0],
    photos: selectedPhotos,
    badge: "Новинка",
    description: document.getElementById("adminDescription").value.trim(),
    isCustom: true
  });
  saveProducts(products);
  adminForm.reset();
  selectedPhotos = [];
  photoPreview.classList.add("hidden");
  previewStrip.innerHTML = "";
  renderSizeOptions();
  renderProducts();
});

if (sessionStorage.getItem("modaAdmin") === "true") showDashboard();
