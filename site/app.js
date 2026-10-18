document.documentElement.classList.add('motion-ready');

const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('#primary-nav');
const navLinks = [...document.querySelectorAll('[data-nav-link]')];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);
const mobileNavQuery = window.matchMedia?.('(max-width: 760px)');

function getSiteBasePath() {
  const pathname = window.location.pathname;
  const projectMarker = ['', 'projects', ''].join('/');
  const projectIndex = pathname.indexOf(projectMarker);

  if (projectIndex >= 0) {
    return pathname.slice(0, projectIndex).replace(/\/+$/, '');
  }

  if (pathname === '/') return '';
  if (pathname.endsWith('/')) return pathname.slice(0, -1);
  if (pathname.startsWith('/site/')) return '';
  return pathname.slice(0, pathname.lastIndexOf('/')).replace(/\/+$/, '');
}

function siteUrl(pathname) {
  const basePath = getSiteBasePath();
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${window.location.origin}${basePath}${normalizedPath}`;
}

function setSiteMeta(name, content) {
  const element = document.querySelector(`[data-site-meta="${name}"]`);
  if (element) element.setAttribute('content', content);
}

const homeUrl = siteUrl('/');
const homeImageUrl = siteUrl('assets/actual/philips/case-study.jpg');
document.querySelector('[data-site-canonical]')?.setAttribute('href', homeUrl);
setSiteMeta('og:url', homeUrl);
setSiteMeta('og:image', homeImageUrl);
document.querySelector('meta[name="twitter:image"]')?.setAttribute('content', homeImageUrl);

function syncNavAccessibility() {
  if (!primaryNav) return;
  if (mobileNavQuery?.matches) {
    primaryNav.setAttribute('aria-hidden', String(!primaryNav.classList.contains('is-open')));
  } else {
    primaryNav.removeAttribute('aria-hidden');
  }
}

function setMenu(open, { restoreFocus = false } = {}) {
  if (!menuToggle || !primaryNav) return;
  menuToggle.classList.toggle('is-open', open);
  primaryNav.classList.toggle('is-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  document.body.classList.toggle('is-menu-open', open);
  syncNavAccessibility();

  if (open && mobileNavQuery?.matches) {
    window.requestAnimationFrame(() => navLinks[0]?.focus());
  } else if (restoreFocus) {
    menuToggle.focus();
  }
}

menuToggle?.addEventListener('click', () => {
  setMenu(!primaryNav?.classList.contains('is-open'));
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => setMenu(false));
});

function updateHeader() {
  header?.classList.toggle('is-scrolled', window.scrollY > 24);
}

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

function setActiveNav(sectionId) {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute('href') === `#${sectionId}`;
    link.classList.toggle('is-active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'location');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveNav(entry.target.id);
      });
    },
    { rootMargin: '-28% 0px -62% 0px', threshold: 0 },
  );

  sections.forEach((section) => sectionObserver.observe(section));
} else if (sections[0]) {
  setActiveNav(sections[0].id);
}

function revealContent() {
  const targets = [...document.querySelectorAll('[data-reveal]')];
  if (targets.length === 0) return;

  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    targets.forEach((target) => target.classList.add('is-revealed'));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.08 },
  );

  targets.forEach((target) => revealObserver.observe(target));
}

revealContent();

const contactCta = document.querySelector('[data-contact-cta]');
const contactNote = document.querySelector('#contact-note');
contactCta?.addEventListener('click', () => {
  const isExpanded = contactCta.getAttribute('aria-expanded') === 'true';
  contactCta.setAttribute('aria-expanded', String(!isExpanded));
  if (contactNote) contactNote.hidden = isExpanded;
});

const syncViewport = () => {
  if (!mobileNavQuery?.matches) setMenu(false);
  syncNavAccessibility();
};

mobileNavQuery?.addEventListener?.('change', syncViewport);
window.addEventListener('resize', syncViewport, { passive: true });
syncNavAccessibility();

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && primaryNav?.classList.contains('is-open')) {
    setMenu(false, { restoreFocus: true });
  }
});
