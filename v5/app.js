(() => {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sections = [...document.querySelectorAll('[data-chapter-section]')];
  const chapterButtons = [...document.querySelectorAll('[data-chapter-target]')];
  const workScene = document.querySelector('[data-work-scene]');

  const stageStates = [
    {
      key: 'spread',
      number: '01',
      label: 'Full spread',
      frame: '01',
      caption: 'Full spread / campaign overview',
      title: 'The full spread sets the room.',
      copy: 'A supplied case-study spread that moves from room-scale image to campaign system.',
    },
    {
      key: 'detail',
      number: '02',
      label: 'Detail crop',
      frame: '04',
      caption: 'Detail crop / campaign language',
      title: 'The detail carries the language.',
      copy: 'Campaign language shaped across screen, shelf, strip and the point of purchase.',
    },
    {
      key: 'frame',
      number: '03',
      label: 'Tilted frame',
      frame: '06',
      caption: 'Tilted frame / retail experience',
      title: 'The frame has to travel.',
      copy: 'From the supplied retail scene back into a repeatable campaign system for Philips TV & Audio.',
    },
  ];

  let currentSectionId = sections[0]?.id || 'signal';
  let currentStageKey = 'spread';
  let scrollFrame = 0;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function setReady() {
    if (motionQuery.matches) {
      root.classList.add('is-ready');
      return;
    }
    window.setTimeout(() => root.classList.add('is-ready'), 60);
  }

  function setActiveChapter(id) {
    const index = Math.max(0, sections.findIndex((section) => section.id === id));
    const progress = (index / Math.max(1, sections.length - 1)) * 100;
    currentSectionId = sections[index]?.id || currentSectionId;
    root.style.setProperty('--chapter-progress', `${progress}%`);

    chapterButtons.forEach((button) => {
      const isActive = button.dataset.chapterTarget === currentSectionId;
      button.classList.toggle('is-active', isActive);
      if (isActive) {
        button.setAttribute('aria-current', 'location');
      } else {
        button.removeAttribute('aria-current');
      }
    });
  }

  function sectionFromViewport() {
    if (!sections.length) return;
    const anchor = window.innerHeight * 0.34;
    let active = sections[0];
    let closest = Number.POSITIVE_INFINITY;

    sections.forEach((section) => {
      const bounds = section.getBoundingClientRect();
      if (bounds.top <= anchor && bounds.bottom > anchor) {
        active = section;
        closest = -1;
      } else if (closest !== -1) {
        const distance = Math.abs(bounds.top - anchor);
        if (distance < closest) {
          closest = distance;
          active = section;
        }
      }
    });

    setActiveChapter(active.id);
  }

  function scrollToChapter(id) {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({
      behavior: motionQuery.matches ? 'auto' : 'smooth',
      block: 'start',
    });
  }

  function setStageState(key) {
    if (!workScene || key === currentStageKey) return;
    const state = stageStates.find((item) => item.key === key);
    if (!state) return;
    currentStageKey = key;
    workScene.dataset.stageState = state.key;

    const title = workScene.querySelector('[data-stage-title]');
    const copy = workScene.querySelector('[data-stage-copy]');
    const number = workScene.querySelector('[data-stage-number]');
    const label = workScene.querySelector('[data-stage-label]');
    const frame = workScene.querySelector('[data-stage-frame]');
    const caption = workScene.querySelector('[data-stage-caption]');

    if (title) title.textContent = state.title;
    if (copy) copy.textContent = state.copy;
    if (number) number.textContent = state.number;
    if (label) label.textContent = state.label;
    if (frame) frame.textContent = state.frame;
    if (caption) caption.textContent = state.caption;
  }

  function updateWorkScene() {
    if (!workScene) return;
    const bounds = workScene.getBoundingClientRect();
    const travel = Math.max(1, workScene.offsetHeight - window.innerHeight);
    const progress = clamp(-bounds.top / travel, 0, 1);
    workScene.style.setProperty('--scene-progress', progress.toFixed(3));

    const nextState = progress < 0.31 ? 'spread' : progress < 0.68 ? 'detail' : 'frame';
    setStageState(nextState);
  }

  function onScrollOrResize() {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(() => {
      scrollFrame = 0;
      sectionFromViewport();
      updateWorkScene();
    });
  }

  chapterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      scrollToChapter(button.dataset.chapterTarget);
      const mobileMenu = document.querySelector('[data-mobile-menu]');
      const mobileToggle = document.querySelector('[data-mobile-menu-toggle]');
      if (mobileMenu && mobileToggle && !mobileMenu.hidden) {
        mobileMenu.hidden = true;
        mobileToggle.setAttribute('aria-expanded', 'false');
        body.classList.remove('menu-open');
      }
    });
  });

  const mobileMenu = document.querySelector('[data-mobile-menu]');
  const mobileMenuToggle = document.querySelector('[data-mobile-menu-toggle]');
  mobileMenuToggle?.addEventListener('click', () => {
    if (!mobileMenu) return;
    const shouldOpen = mobileMenu.hidden;
    mobileMenu.hidden = !shouldOpen;
    mobileMenuToggle.setAttribute('aria-expanded', String(shouldOpen));
    body.classList.toggle('menu-open', shouldOpen);
  });

  const modeToggle = document.querySelector('[data-mode-toggle]');
  modeToggle?.addEventListener('click', () => {
    const isActive = body.classList.toggle('show-guides');
    modeToggle.setAttribute('aria-pressed', String(isActive));
    modeToggle.setAttribute(
      'aria-label',
      isActive ? 'Hide presentation guide mode' : 'Show presentation guide mode',
    );
    modeToggle.setAttribute(
      'title',
      isActive ? 'Hide presentation guide mode' : 'Show presentation guide mode',
    );
  });

  const contactToggle = document.querySelector('[data-contact-toggle]');
  const contactDisclosure = document.querySelector('#contact-disclosure');
  const contactSymbol = document.querySelector('[data-contact-symbol]');
  contactToggle?.addEventListener('click', () => {
    const isOpen = contactToggle.getAttribute('aria-expanded') === 'true';
    contactToggle.setAttribute('aria-expanded', String(!isOpen));
    if (contactDisclosure) contactDisclosure.hidden = isOpen;
    if (contactSymbol) contactSymbol.textContent = isOpen ? '+' : '−';
  });

  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize, { passive: true });
  motionQuery.addEventListener?.('change', onScrollOrResize);

  setReady();
  setActiveChapter(currentSectionId);
  updateWorkScene();
})();
