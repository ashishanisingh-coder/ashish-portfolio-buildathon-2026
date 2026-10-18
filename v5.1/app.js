(() => {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sections = [...document.querySelectorAll('[data-chapter-section]')];
  const chapterButtons = [...document.querySelectorAll('[data-chapter-target]')];
  const philipsScene = document.querySelector('[data-philips-scene]');
  const beatCaptions = {
    overview: 'Campaign overview / full composite',
    catalogue: 'Catalogue / print and social crop',
    retail: 'Retail experience / format adaptations crop',
  };
  const beatContent = {
    overview: {
      eyebrow: 'Philips TV & Audio / campaign system',
      title: 'The whole campaign sets the context.',
      copy: 'A retail brand campaign that brings product, atmosphere and a connected home into one clear view.',
      number: '01',
      state: 'Campaign overview',
    },
    catalogue: {
      eyebrow: 'Catalogue / print and social',
      title: 'The catalogue carries the invitation.',
      copy: 'Print catalogue, festive offers and social formats keep the product story consistent across everyday and seasonal moments.',
      number: '02',
      state: 'Catalogue / print',
    },
    retail: {
      eyebrow: 'Retail / format adaptations',
      title: 'The system travels into the room.',
      copy: 'Retail displays and adapted formats bring the same campaign language to shelves, standees and in-store experiences.',
      number: '03',
      state: 'Retail / adaptations',
    },
  };
  const beatOrder = ['overview', 'catalogue', 'retail'];
  const chapterLabels = {
    opening: '01 / Opening',
    philips: '02 / Philips',
    contact: '06 / Contact',
  };

  let currentSectionId = sections[0]?.id || 'opening';
  let currentBeat = 'overview';
  let scrollFrame = 0;
  let captionTimer = 0;
  let copyTimer = 0;
  let philipsSceneMetrics = null;
  let philipsSceneMetricsDirty = true;
  let philipsSceneProgress = null;
  const philipsBeatValues = {};

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function smoothStep(value) {
    const t = clamp(value, 0, 1);
    return t * t * (3 - 2 * t);
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
    currentSectionId = sections[index]?.id || currentSectionId;

    chapterButtons.forEach((button) => {
      const isActive = button.dataset.chapterTarget === currentSectionId;
      button.classList.toggle('is-active', isActive);
      if (isActive) {
        button.setAttribute('aria-current', 'location');
      } else {
        button.removeAttribute('aria-current');
      }
    });

    const label = chapterLabels[currentSectionId] || chapterLabels.opening;
    document.querySelector('[data-progress-readout]')?.replaceChildren(document.createTextNode(label));
    document.querySelector('[data-mobile-current]')?.replaceChildren(document.createTextNode(label));
  }

  function updateDocumentProgress() {
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = clamp(window.scrollY / scrollable, 0, 1);
    root.style.setProperty('--document-progress', `${(progress * 100).toFixed(2)}%`);
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

  function setBeatAccessibility(activeBeat) {
    document.querySelectorAll('[data-beat-image]').forEach((image) => {
      image.setAttribute('aria-hidden', String(image.dataset.beatImage !== activeBeat));
    });
  }

  function setBeatCopy(beat) {
    const content = beatContent[beat];
    const copy = document.querySelector('[data-philips-copy]');
    if (!content || !copy) return;

    const applyContent = () => {
      copy.querySelector('[data-beat-eyebrow]').textContent = content.eyebrow;
      copy.querySelector('[data-beat-title]').textContent = content.title;
      copy.querySelector('[data-beat-copy]').textContent = content.copy;
      copy.querySelector('[data-beat-number]').textContent = content.number;
      copy.querySelector('[data-beat-state]').textContent = content.state;
      copy.classList.remove('is-switching');
    };

    window.clearTimeout(copyTimer);
    if (motionQuery.matches) {
      applyContent();
      return;
    }

    copy.classList.add('is-switching');
    copyTimer = window.setTimeout(applyContent, 140);
  }

  function setBeatLabel(beat) {
    const caption = document.querySelector('[data-beat-caption]');
    if (!caption || caption.textContent === beatCaptions[beat]) return;
    window.clearTimeout(captionTimer);
    caption.classList.add('is-switching');
    captionTimer = window.setTimeout(() => {
      caption.textContent = beatCaptions[beat];
      window.requestAnimationFrame(() => caption.classList.remove('is-switching'));
    }, motionQuery.matches ? 0 : 110);
  }

  function refreshPhilipsSceneMetrics() {
    if (!philipsScene) return;
    const bounds = philipsScene.getBoundingClientRect();
    philipsSceneMetrics = {
      start: bounds.top + window.scrollY,
      travel: Math.max(1, philipsScene.offsetHeight - window.innerHeight),
    };
    philipsSceneMetricsDirty = false;
  }

  function updatePhilipsScene() {
    if (!philipsScene) return;
    if (!philipsSceneMetrics || philipsSceneMetricsDirty) refreshPhilipsSceneMetrics();
    if (!philipsSceneMetrics) return;

    const progress = clamp(
      (window.scrollY - philipsSceneMetrics.start) / philipsSceneMetrics.travel,
      0,
      1,
    );
    const progressValue = progress.toFixed(4);
    if (progressValue === philipsSceneProgress) return;
    philipsSceneProgress = progressValue;

    const transition = smoothStep((progress - 0.04) / 0.46);
    const finish = smoothStep((progress - 0.5) / 0.46);
    const weights = progress < 0.5
      ? { overview: 1 - transition, catalogue: transition, retail: 0 }
      : { overview: 0, catalogue: 1 - finish, retail: finish };

    beatOrder.forEach((beat) => {
      const value = weights[beat].toFixed(4);
      if (philipsBeatValues[beat] === value) return;
      philipsBeatValues[beat] = value;
      philipsScene.style.setProperty(`--beat-${beat}`, value);
    });

    const nextBeat = beatOrder[weights.catalogue > weights.overview && weights.catalogue >= weights.retail ? 1 : weights.retail > weights.overview ? 2 : 0];
    if (nextBeat !== currentBeat) {
      currentBeat = nextBeat;
      philipsScene.dataset.sceneBeat = currentBeat;
      setBeatAccessibility(currentBeat);
      setBeatCopy(currentBeat);
      setBeatLabel(currentBeat);
    }
  }

  function updateView() {
    scrollFrame = 0;
    updateDocumentProgress();
    sectionFromViewport();
    updatePhilipsScene();
  }

  function scheduleViewUpdate() {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(updateView);
  }

  function onScroll() {
    scheduleViewUpdate();
  }

  function onResize() {
    philipsSceneMetricsDirty = true;
    scheduleViewUpdate();
  }

  function closeMobileMenu({ restoreFocus = false } = {}) {
    const mobileMenu = document.querySelector('[data-mobile-menu]');
    const mobileMenuToggle = document.querySelector('[data-mobile-menu-toggle]');
    if (!mobileMenu || !mobileMenuToggle) return;
    mobileMenu.hidden = true;
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
    body.classList.remove('menu-open');
    if (restoreFocus) mobileMenuToggle.focus();
  }

  const mobileMenu = document.querySelector('[data-mobile-menu]');
  const mobileMenuToggle = document.querySelector('[data-mobile-menu-toggle]');

  chapterButtons.filter((button) => button.tagName === 'BUTTON').forEach((button) => {
    button.addEventListener('click', () => {
      const menuWasOpen = Boolean(mobileMenu && !mobileMenu.hidden);
      setActiveChapter(button.dataset.chapterTarget);
      scrollToChapter(button.dataset.chapterTarget);
      closeMobileMenu({ restoreFocus: menuWasOpen });
    });
  });

  mobileMenuToggle?.addEventListener('click', () => {
    if (!mobileMenu) return;
    const shouldOpen = mobileMenu.hidden;
    mobileMenu.hidden = !shouldOpen;
    mobileMenuToggle.setAttribute('aria-expanded', String(shouldOpen));
    body.classList.toggle('menu-open', shouldOpen);
    if (shouldOpen) mobileMenu.querySelector('button')?.focus();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobileMenu && !mobileMenu.hidden) {
      closeMobileMenu({ restoreFocus: true });
    }
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

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
  motionQuery.addEventListener?.('change', scheduleViewUpdate);

  setReady();
  setActiveChapter(currentSectionId);
  setBeatAccessibility(currentBeat);
  setBeatCopy(currentBeat);
  setBeatLabel(currentBeat);
  updateView();
})();
