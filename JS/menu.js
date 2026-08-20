// Отримуємо елементи
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const menuBackdrop = document.getElementById('menuBackdrop');
const menuLinks = mobileMenu.querySelectorAll('a');

// Функція для відкриття меню
function openMenu() {
  menuBtn.classList.add('is-open');
  menuBtn.setAttribute('aria-expanded', 'true');
  mobileMenu.classList.add('open');
  menuBackdrop.classList.add('show');
  document.body.style.overflow = 'hidden'; // Блокуємо скролінг сторінки
}

// Функція для закриття меню
function closeMenu() {
  menuBtn.classList.remove('is-open');
  menuBtn.setAttribute('aria-expanded', 'false');
  mobileMenu.classList.remove('open');
  menuBackdrop.classList.remove('show');
  document.body.style.overflow = ''; // Відновлюємо скролінг
}

// Слухач на кнопку бургер
menuBtn.addEventListener('click', () => {
  if (menuBtn.classList.contains('is-open')) {
    closeMenu();
  } else {
    openMenu();
  }
});

// Закриття меню при натиканні на посилання
menuLinks.forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Закриття меню при натиканні на фон
menuBackdrop.addEventListener('click', closeMenu);

// Закриття меню при натиканні на ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menuBtn.classList.contains('is-open')) {
    closeMenu();
  }
});
