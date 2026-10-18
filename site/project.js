document.documentElement.classList.add('motion-ready');

const PROJECT_ORDER = ['philips', 'india', 'rotavirus', 'uno'];

const PROJECTS = {
  philips: {
    name: 'Philips TV & Audio',
    kicker: 'Campaign system / archival case study',
    status: 'Selected lead',
    type: 'Visual communication',
    title: 'A visual system that travels.',
    intro: 'Campaign language shaped across screen, shelf, strip and the point of purchase.',
    metaDescription: 'Campaign language shaped across screen, shelf, strip and the point of purchase.',
    hero: '/assets/actual/philips/case-study.jpg',
    heroAlt: 'Philips TV and Audio campaign case study spread',
    caption: 'Supplied asset / Philips TV & Audio campaign case study',
    closing: 'A system can move without losing its voice.',
    frames: [],
  },
  india: {
    name: 'India in Transition',
    kicker: 'Editorial system / developing work',
    status: 'Developing / WIP',
    type: 'Editorial communication',
    title: 'A country through everyday life.',
    intro: 'A large editorial system for six ways of seeing India in transition.',
    metaDescription: 'A large editorial system for six ways of seeing India in transition.',
    hero: '/assets/actual/india/cover-hero.jpg',
    heroAlt: 'India in Transition project cover',
    caption: 'Supplied source frame / cover direction',
    closing: 'The story changes when the crop changes.',
    frames: [
      { src: '/assets/actual/india/big-picture.jpg', alt: 'India in Transition big-picture editorial frame', label: '01 / Big picture' },
      { src: '/assets/actual/india/geography-map.jpg', alt: 'India in Transition geography map frame', label: '02 / Geography map' },
      { src: '/assets/actual/india/synthesis-montage.jpg', alt: 'India in Transition synthesis montage', label: '03 / Synthesis montage' },
    ],
  },
  rotavirus: {
    name: 'Rotavirus',
    kicker: 'Information design / public-health story',
    status: 'Selected work',
    type: 'Data storytelling',
    title: 'Make complexity readable.',
    intro: 'Information design for a public-health story that needs a clear way in.',
    metaDescription: 'Information design for a public-health story that needs a clear way in.',
    hero: '/assets/actual/rotavirus/cover.jpg',
    heroAlt: 'Rotavirus campaign cover about vaccine access',
    caption: 'Supplied source frame / campaign story',
    closing: 'One source. One decision visual.',
    frames: [
      { src: '/assets/actual/rotavirus/overview.jpg', alt: 'Rotavirus project overview', label: '01 / Project overview' },
      { src: '/assets/actual/rotavirus/slide-archive.jpg', alt: 'Rotavirus selected slide archive', label: '02 / Visual system archive' },
      { src: '/assets/actual/rotavirus/takeaways.png', alt: 'Rotavirus key takeaways', label: '03 / Key takeaways' },
    ],
  },
  uno: {
    name: 'Simulanis Uno',
    kicker: 'Experience design / 17-slide case study',
    status: 'Selected work',
    type: 'Experience design',
    title: 'One unified platform.',
    intro: 'Industrial training for a safer, smarter tomorrow.',
    metaDescription: 'Industrial training for a safer, smarter tomorrow.',
    hero: '/assets/actual/uno/case-study.jpg',
    heroAlt: 'Simulanis Uno 17-slide case study strip',
    caption: 'Supplied 17-slide case study strip',
    closing: 'The interface is the story.',
    portrait: true,
    frames: [],
  },
};

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

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

function getProjectSlug() {
  const projectMarker = ['', 'projects', ''].join('/');
  const projectIndex = window.location.pathname.indexOf(projectMarker);
  if (projectIndex < 0) return 'philips';

  const routePart = window.location.pathname.slice(projectIndex + projectMarker.length);
  const routeSlug = routePart.split('/').filter(Boolean)[0];
  return PROJECTS[routeSlug] ? routeSlug : 'philips';
}

function setProjectMeta(name, content) {
  const element = document.querySelector(`[data-project-meta="${name}"]`);
  if (element) element.setAttribute('content', content);
}

function setProjectLink(link, label, targetSlug, direction) {
  if (!link) return;

  const target = targetSlug ? PROJECTS[targetSlug] : null;
  if (!target) {
    link.hidden = true;
    link.removeAttribute('aria-label');
    return;
  }

  link.hidden = false;
  link.href = siteUrl(`projects/${targetSlug}`);
  link.setAttribute('aria-label', `${direction}: ${target.name}`);
  if (label) label.textContent = target.name;
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

const slug = getProjectSlug();
const project = PROJECTS[slug];
const projectUrl = siteUrl(`projects/${slug}`);
const projectImageUrl = new URL(project.hero, document.baseURI).href;

document.title = `${project.name} — Ashish Kumar Singh`;
document.body.classList.toggle('project-body--portrait', Boolean(project.portrait));

document.querySelector('[data-project-canonical]')?.setAttribute('href', projectUrl);
setProjectMeta('description', project.metaDescription);
setProjectMeta('og:title', `${project.name} — Ashish Kumar Singh`);
setProjectMeta('og:description', project.metaDescription);
setProjectMeta('og:url', projectUrl);
setProjectMeta('og:image', projectImageUrl);
setProjectMeta('og:image:alt', project.heroAlt);
setProjectMeta('twitter:title', `${project.name} — Ashish Kumar Singh`);
setProjectMeta('twitter:description', project.metaDescription);
setProjectMeta('twitter:image', projectImageUrl);

document.querySelector('[data-project-kicker]').textContent = project.kicker;
document.querySelector('[data-project-title]').textContent = project.title;
document.querySelector('[data-project-intro]').textContent = project.intro;
document.querySelector('[data-project-status]').textContent = project.status;
document.querySelector('[data-project-type]').textContent = project.type;
document.querySelector('[data-project-closing]').textContent = project.closing;

const heroImage = document.querySelector('[data-project-hero]');
heroImage.src = project.hero;
heroImage.alt = project.heroAlt;
document.querySelector('[data-project-caption]').textContent = project.caption;

const gallery = document.querySelector('[data-project-gallery]');
if (project.frames.length === 0) {
  gallery.hidden = true;
} else {
  gallery.innerHTML = project.frames
    .map(
      (frame) => `
        <figure class="project-detail__frame" data-reveal>
          <img src="${escapeHTML(frame.src)}" alt="${escapeHTML(frame.alt)}" loading="lazy" decoding="async" />
          <figcaption>${escapeHTML(frame.label)}</figcaption>
        </figure>`,
    )
    .join('');
}

const projectIndex = PROJECT_ORDER.indexOf(slug);
setProjectLink(
  document.querySelector('[data-project-previous]'),
  document.querySelector('[data-project-previous-name]'),
  projectIndex > 0 ? PROJECT_ORDER[projectIndex - 1] : null,
  'Open previous project',
);
setProjectLink(
  document.querySelector('[data-project-next]'),
  document.querySelector('[data-project-next-name]'),
  projectIndex < PROJECT_ORDER.length - 1 ? PROJECT_ORDER[projectIndex + 1] : null,
  'Open next project',
);

revealContent();
