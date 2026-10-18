(() => {
  'use strict';

  const root = document.documentElement;
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const chapterButtons = [...document.querySelectorAll('[data-chapter-target]')];
  const chapterSections = [...document.querySelectorAll('[data-chapter-section]')];
  const railProgress = document.querySelector('[data-rail-progress]');
  const currentChapter = document.querySelector('[data-current-chapter]');
  const currentLabel = document.querySelector('[data-current-label]');
  const chapterLabels = new Map(
    chapterButtons.map((button) => [
      button.dataset.chapterTarget,
      button.querySelector('.chapter-button__label')?.textContent || '',
    ]),
  );

  const wait = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration));

  function startHeroSequence() {
    if (reducedMotionQuery.matches) {
      root.classList.add('hero-ready');
      return;
    }

    window.requestAnimationFrame(() => {
      window.setTimeout(() => root.classList.add('hero-ready'), 80);
    });
  }

  startHeroSequence();

  function updateChapter(id) {
    const index = Math.max(0, chapterSections.findIndex((section) => section.id === id));
    const number = String(index + 1).padStart(2, '0');
    chapterButtons.forEach((button) => {
      const isActive = button.dataset.chapterTarget === id;
      button.classList.toggle('is-active', isActive);
      if (isActive) {
        button.setAttribute('aria-current', 'location');
      } else {
        button.removeAttribute('aria-current');
      }
    });
    if (currentChapter) currentChapter.textContent = number;
    if (currentLabel) currentLabel.textContent = chapterLabels.get(id) || '';
    if (railProgress) {
      railProgress.style.setProperty(
        '--rail-progress',
        `${(index / Math.max(1, chapterSections.length - 1)) * 100}%`,
      );
    }
  }

  function setChapterFromViewport() {
    if (!chapterSections.length) return;
    const anchor = window.innerHeight * 0.38;
    let closestSection = chapterSections[0];
    let closestDistance = Number.POSITIVE_INFINITY;

    chapterSections.forEach((section) => {
      const bounds = section.getBoundingClientRect();
      const distance = Math.abs(bounds.top - anchor);
      if (bounds.top <= anchor && bounds.bottom > anchor) {
        closestSection = section;
        closestDistance = -1;
      } else if (closestDistance !== -1 && distance < closestDistance) {
        closestSection = section;
        closestDistance = distance;
      }
    });

    updateChapter(closestSection.id);
  }

  function scrollToChapter(id) {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: reducedMotionQuery.matches ? 'auto' : 'smooth', block: 'start' });
  }

  chapterButtons.forEach((button) => {
    button.addEventListener('click', () => scrollToChapter(button.dataset.chapterTarget));
  });

  let scrollFrame = 0;
  function handleScroll() {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(() => {
      scrollFrame = 0;
      setChapterFromViewport();
    });
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', handleScroll, { passive: true });
  setChapterFromViewport();

  const projects = {
    philips: {
      number: '01',
      title: 'Philips TV & Audio',
      discipline: 'Campaign system',
      status: 'Archival case study',
      image: '../assets/actual/philips/case-study.jpg',
      alt: 'Philips TV and Audio campaign case study spread',
      page: '01 / 08',
      frame: 'Frame 01',
      caption: 'Supplied case-study material',
      summary:
        'A campaign sequence that carries Philips TV & Audio from room-scale images into print, social, retail and catalogue formats.',
      source: 'Actual project asset / state shown: supplied source frame',
    },
    india: {
      number: '02',
      title: 'India in Transition',
      discipline: 'Editorial system',
      status: 'Developing / WIP',
      image: '../assets/actual/india/cover-hero.jpg',
      alt: 'India in Transition project cover showing people, landscapes and city life',
      page: '01 / 40',
      frame: 'Cover frame',
      caption: 'Supplied project material',
      summary: 'An editorial view of India in transition, moving between people, places and everyday systems.',
      source: 'Actual project asset / state shown: developing work',
    },
    rotavirus: {
      number: '03',
      title: 'Rotavirus',
      discipline: 'Information design',
      status: 'Selected work',
      image: '../assets/actual/rotavirus/cover.jpg',
      alt: 'Rotavirus information design cover about protecting children through vaccine access',
      page: '01 / 18',
      frame: 'Cover frame',
      caption: 'Supplied case-study material',
      summary: 'A public-health narrative about vaccine access, framed through a clear presentation sequence.',
      source: 'Actual project asset / state shown: supplied source frame',
    },
    uno: {
      number: '04',
      title: 'Simulanis Uno',
      discipline: 'Experience design',
      status: 'Selected work',
      image: '../assets/actual/uno/case-study.jpg',
      alt: 'Simulanis Uno case study strip showing industrial training product screens',
      page: '01 / 17',
      frame: 'Cover frame',
      caption: 'Supplied case-study material',
      summary: 'A case-study system for industrial training, with product screens and a route from learning to authoring.',
      source: 'Actual project asset / state shown: supplied source frame',
    },
  };

  const projectButtons = [...document.querySelectorAll('[data-project-key]')];
  const stagePanel = document.querySelector('#stage-panel');
  const stageFigure = document.querySelector('.stage-figure');
  const stageCopy = document.querySelector('.stage-copy');
  const stageImage = document.querySelector('[data-stage-image]');
  const stageTitle = document.querySelector('#stage-title');
  const stageSummary = document.querySelector('[data-stage-summary]');
  const stageSource = document.querySelector('[data-stage-source]');
  const stageCount = document.querySelector('[data-stage-count]');
  const stageStatus = document.querySelector('[data-stage-status]');
  const stageDiscipline = [...document.querySelectorAll('[data-stage-discipline]')];
  const stageDisciplineCopy = document.querySelector('[data-stage-discipline-copy]');
  const stagePage = document.querySelector('[data-stage-page]');
  const stageFrame = document.querySelector('[data-stage-frame]');
  const stageCaption = document.querySelector('[data-stage-caption]');
  let activeProject = 'philips';
  let transitionToken = 0;

  async function setProject(key) {
    const project = projects[key];
    if (!project || key === activeProject) return;
    activeProject = key;
    transitionToken += 1;
    const token = transitionToken;

    projectButtons.forEach((button) => {
      const isActive = button.dataset.projectKey === key;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });

    stagePanel?.classList.add('is-changing');
    stageFigure?.classList.add('is-changing');
    stageCopy?.classList.add('is-changing');

    if (stageTitle) stageTitle.textContent = project.title;
    if (stageSummary) stageSummary.textContent = project.summary;
    if (stageSource) stageSource.textContent = project.source;
    if (stageStatus) stageStatus.textContent = project.status;
    if (stageCount) stageCount.textContent = `${project.number} / 04`;
    stageDiscipline.forEach((element) => {
      element.textContent = project.discipline;
    });
    if (stageDisciplineCopy) stageDisciplineCopy.textContent = project.discipline;
    if (stagePage) stagePage.textContent = project.page;
    if (stageFrame) stageFrame.textContent = project.frame;
    if (stageCaption) stageCaption.textContent = project.caption;

    const preloadedImage = new Image();
    preloadedImage.src = project.image;
    try {
      if (preloadedImage.decode) await preloadedImage.decode();
    } catch (_error) {
      // The load event below remains the fallback for browsers without decode support.
    }

    if (token !== transitionToken) return;
    if (stageImage) {
      stageImage.src = project.image;
      stageImage.alt = project.alt;
    }
    await wait(reducedMotionQuery.matches ? 0 : 120);
    if (token === transitionToken) {
      stagePanel?.classList.remove('is-changing');
      stageFigure?.classList.remove('is-changing');
      stageCopy?.classList.remove('is-changing');
    }
  }

  projectButtons.forEach((button, index) => {
    button.addEventListener('click', () => setProject(button.dataset.projectKey));
    button.addEventListener('keydown', (event) => {
      const horizontalNext = event.key === 'ArrowRight' || event.key === 'ArrowDown';
      const horizontalPrevious = event.key === 'ArrowLeft' || event.key === 'ArrowUp';
      if (!horizontalNext && !horizontalPrevious && event.key !== 'Home' && event.key !== 'End') return;
      event.preventDefault();
      let nextIndex = index;
      if (horizontalNext) nextIndex = (index + 1) % projectButtons.length;
      if (horizontalPrevious) nextIndex = (index - 1 + projectButtons.length) % projectButtons.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = projectButtons.length - 1;
      projectButtons[nextIndex].focus();
      setProject(projectButtons[nextIndex].dataset.projectKey);
    });
  });

  const contactButton = document.querySelector('[data-contact-cta]');
  const contactDisclosure = document.querySelector('#contact-disclosure');
  const contactSymbol = document.querySelector('[data-contact-symbol]');
  contactButton?.addEventListener('click', () => {
    const isOpen = contactButton.getAttribute('aria-expanded') === 'true';
    contactButton.setAttribute('aria-expanded', String(!isOpen));
    if (contactDisclosure) contactDisclosure.hidden = isOpen;
    if (contactSymbol) contactSymbol.textContent = isOpen ? '+' : '−';
  });

  reducedMotionQuery.addEventListener?.('change', () => {
    if (reducedMotionQuery.matches) root.classList.add('hero-ready');
  });
})();
