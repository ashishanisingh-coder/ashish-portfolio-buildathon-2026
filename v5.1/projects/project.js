(() => {
  'use strict';

  const root = document.documentElement;
  const sequence = document.querySelector('[data-project-sequence]');
  const sequenceScroll = sequence?.querySelector('.sequence-scroll');
  const panels = [...document.querySelectorAll('[data-scene-panel]')];
  const steps = [...document.querySelectorAll('[data-scene-step]')];
  const progressReadout = document.querySelector('[data-progress-readout]');
  const sceneKind = sequence?.dataset.projectKind || 'gallery';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const beats = steps.map((step) => ({
    label: step.querySelector('.scene-index__label')?.textContent || '',
    title: step.dataset.sceneTitle || '',
    copy: step.dataset.sceneCopy || '',
  }));
  const sceneEyebrow = document.querySelector('[data-scene-eyebrow]');
  const sceneTitle = document.querySelector('[data-scene-reading-title]');
  const sceneCopy = document.querySelector('[data-scene-reading-copy]');
  const sceneNumber = document.querySelector('[data-scene-number]');
  const sceneState = document.querySelector('[data-scene-state]');
  const sceneCaption = document.querySelector('[data-scene-caption]');
  let frame = 0;
  let currentBeat = 0;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function smoothStep(value) {
    const t = clamp(value, 0, 1);
    return t * t * (3 - 2 * t);
  }

  function updateDocumentProgress() {
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = clamp(window.scrollY / scrollable, 0, 1);
    root.style.setProperty('--document-progress', `${(progress * 100).toFixed(2)}%`);
    if (progressReadout) progressReadout.textContent = `${Math.round(progress * 100)}%`;
  }

  function setActiveBeat(index) {
    if (!steps.length || index === currentBeat && steps[index]?.classList.contains('is-active')) return;
    currentBeat = index;
    steps.forEach((step, stepIndex) => {
      const active = stepIndex === currentBeat;
      step.classList.toggle('is-active', active);
      if (active) {
        step.setAttribute('aria-current', 'step');
      } else {
        step.removeAttribute('aria-current');
      }
    });

    const beat = beats[currentBeat];
    if (!beat) return;
    if (sceneEyebrow) sceneEyebrow.textContent = beat.label;
    if (sceneTitle) sceneTitle.textContent = beat.title;
    if (sceneCopy) sceneCopy.textContent = beat.copy;
    if (sceneNumber) sceneNumber.textContent = String(currentBeat + 1).padStart(2, '0');
    if (sceneState) sceneState.textContent = beat.label;
    if (sceneCaption) sceneCaption.textContent = beat.label;
  }

  function updateGallery(progress) {
    if (!panels.length) return;
    const scaledProgress = clamp(progress, 0, 1) * Math.max(1, panels.length - 1);
    const leftIndex = Math.min(panels.length - 1, Math.floor(scaledProgress));
    const rightIndex = Math.min(panels.length - 1, leftIndex + 1);
    const localProgress = leftIndex === rightIndex ? 0 : smoothStep(scaledProgress - leftIndex);

    panels.forEach((panel, index) => {
      const center = panels.length > 1 ? index / (panels.length - 1) : 0;
      const shift = (center - progress) * 24;
      let clip = 100;
      if (index === leftIndex) clip = 0;
      if (index === rightIndex) clip = (1 - localProgress) * 100;
      panel.style.setProperty('--panel-shift', `${shift.toFixed(2)}px`);
      panel.style.setProperty('--panel-clip', `${clip.toFixed(2)}%`);
      panel.setAttribute('aria-hidden', String(index !== currentBeat));
    });
  }

  function updateStrip(progress) {
    const strip = document.querySelector('[data-strip-image]');
    if (!strip || !sequence) return;
    const windowElement = strip.closest('.scene-window');
    const availableTravel = Math.max(0, strip.getBoundingClientRect().height - windowElement.clientHeight);
    const shift = -availableTravel * progress;
    strip.style.setProperty('--strip-shift', `${shift.toFixed(2)}px`);
  }

  function updateSequence() {
    if (!sequence || !sequenceScroll) return;
    const bounds = sequenceScroll.getBoundingClientRect();
    const travel = Math.max(1, sequenceScroll.offsetHeight - window.innerHeight);
    const progress = clamp(-bounds.top / travel, 0, 1);
    const beatIndex = steps.length > 1
      ? Math.min(steps.length - 1, Math.round(progress * (steps.length - 1)))
      : 0;
    root.style.setProperty('--sequence-progress', progress.toFixed(4));
    setActiveBeat(beatIndex);

    if (sceneKind === 'strip') {
      updateStrip(progress);
      return;
    }

    updateGallery(smoothStep(progress));
  }

  function updateView() {
    frame = 0;
    updateDocumentProgress();
    if (!reducedMotion.matches) {
      updateSequence();
      return;
    }
    if (sequence) {
      root.style.setProperty('--sequence-progress', '0');
      if (sceneKind === 'strip') updateStrip(0);
      else updateGallery(0);
    }
  }

  function requestUpdate() {
    if (frame) return;
    frame = window.requestAnimationFrame(updateView);
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  reducedMotion.addEventListener?.('change', requestUpdate);

  updateView();
})();
