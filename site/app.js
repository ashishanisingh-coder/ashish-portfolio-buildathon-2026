const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('#primary-nav');
const navLinks = [...document.querySelectorAll('[data-nav-link]')];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

function setMenu(open) {
  if (!menuToggle || !primaryNav) return;
  menuToggle.classList.toggle('is-open', open);
  primaryNav.classList.toggle('is-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('is-menu-open', open);
}

menuToggle?.addEventListener('click', () => {
  setMenu(!primaryNav.classList.contains('is-open'));
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => setMenu(false));
});

window.addEventListener(
  'scroll',
  () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 24);
  },
  { passive: true },
);

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: '-28% 0px -62% 0px', threshold: 0 },
);

sections.forEach((section) => sectionObserver.observe(section));

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenu(false);
});
