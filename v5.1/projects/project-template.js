'use strict';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderMetadata(metadata) {
  return metadata
    .map(
      ([label, value]) => `
        <div class="project-meta__item">
          <dt>${escapeHtml(label)}</dt>
          <dd>${escapeHtml(value)}</dd>
        </div>`,
    )
    .join('');
}

function renderBeatList(project) {
  return project.beats
    .map(
      (beat, index) => `
        <li class="scene-index__item${index === 0 ? ' is-active' : ''}" data-scene-step="${index}" data-scene-title="${escapeHtml(beat.title)}" data-scene-copy="${escapeHtml(beat.copy)}"${index === 0 ? ' aria-current="step"' : ''}>
          <span class="scene-index__number">${String(index + 1).padStart(2, '0')}</span>
          <span class="scene-index__label">${escapeHtml(beat.label)}</span>
        </li>`,
    )
    .join('');
}

function renderBeatReading(project) {
  const first = project.beats[0];
  return `
        <p class="scene-reading__eyebrow" data-scene-eyebrow>${escapeHtml(project.beats[0].label)}</p>
        <h3 data-scene-reading-title>${escapeHtml(first.title)}</h3>
        <p class="scene-reading__copy" data-scene-reading-copy>${escapeHtml(first.copy)}</p>
        <div class="scene-reading__state">
          <span data-scene-number>01</span>
          <span class="scene-reading__state-line" aria-hidden="true"></span>
          <span data-scene-state>${escapeHtml(first.label)}</span>
        </div>`;
}

function renderGalleryPanels(project) {
  return project.beats
    .map(
      (beat, beatIndex) => `
        <div class="scene-panel${beat.images.length > 1 ? ' scene-panel--multi' : ''}" data-scene-panel="${beatIndex}" style="--panel-alpha: ${beatIndex === 0 ? '1' : '0'}" aria-hidden="${beatIndex === 0 ? 'false' : 'true'}">
          <div class="scene-panel__images">
            ${beat.images
              .map(
                (image) => `
                  <img
                    src="${escapeHtml(image.src)}"
                    alt="${escapeHtml(image.alt)}"
                    class="scene-panel__image scene-panel__image--${escapeHtml(image.fit || 'cover')}"
                    style="object-position: ${escapeHtml(image.position || 'center')}"
                  />`,
              )
              .join('')}
          </div>
        </div>`,
    )
    .join('');
}

function renderSceneVisual(project) {
  const isStrip = project.sequence.kind === 'strip';
  if (isStrip) {
    return `
          <div class="scene-window scene-window--strip">
            <img
              class="scene-strip-image"
              data-strip-image
              src="${escapeHtml(project.hero.src)}"
              alt="${escapeHtml(project.hero.alt)}"
            />
            <span class="scene-window__rule" aria-hidden="true"></span>
          </div>`;
  }

  return `
          <div class="scene-window">
            ${renderGalleryPanels(project)}
            <span class="scene-window__rule" aria-hidden="true"></span>
          </div>`;
}

function renderProject(project) {
  const isStrip = project.sequence.kind === 'strip';
  const heroClass = isStrip ? ' project-hero--strip' : '';
  const heroFitClass = project.hero.fit === 'contain' ? ' project-hero--contain' : '';
  const sequenceClass = isStrip ? ' project-sequence--strip' : '';
  const firstBeat = project.beats[0];

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="${escapeHtml(project.projectName)} — ${escapeHtml(project.intro)}" />
    <meta name="theme-color" content="#171c1e" />
    <title>${escapeHtml(project.projectName)} — Ashish Kumar Singh</title>
    <link rel="icon" href="/v5.1/favicon.svg" type="image/svg+xml" />
    <link rel="stylesheet" href="/v5.1/projects/project.css" />
    <script>
      document.documentElement.classList.add('js');
    </script>
    <script src="/v5.1/projects/project.js" defer></script>
  </head>
  <body class="project-page project-page--${escapeHtml(project.slug)}">
    <a class="skip-link" href="#main-content">Skip to content</a>

    <header class="project-header" data-project-header>
      <div class="project-header__shell">
        <a class="project-header__back" href="/v5.1/">
          <span aria-hidden="true">↙</span>
          <span>Back to work</span>
        </a>
        <a class="project-header__name" href="#project-start">${escapeHtml(project.projectName)}</a>
        <div class="project-header__progress" aria-label="Reading progress">
          <span class="project-header__progress-label">Scroll</span>
          <span class="project-progress" aria-hidden="true">
            <span class="project-progress__base"></span>
            <span class="project-progress__fill"></span>
          </span>
          <span class="project-header__progress-value" data-progress-readout>0%</span>
        </div>
      </div>
    </header>

    <main id="main-content" tabindex="-1">
      <section class="project-hero${heroClass}${heroFitClass}" id="project-start" aria-labelledby="project-title">
        <div class="project-hero__shell">
          <div class="project-hero__copy">
            <p class="section-kicker"><span aria-hidden="true"></span>${escapeHtml(project.sectionNumber)} / ${escapeHtml(project.projectName)}</p>
            <h1 id="project-title">${escapeHtml(project.title)}</h1>
            <p class="project-hero__intro">${escapeHtml(project.intro)}</p>
            <a class="signal-link" href="#story">
              <span>Move through the story</span>
              <span aria-hidden="true">↘</span>
            </a>
          </div>

          <figure class="project-hero__figure" aria-labelledby="hero-caption">
            <div class="project-hero__image-window">
              <img
                class="project-hero__image project-hero__image--${escapeHtml(project.hero.fit || 'cover')}"
                src="${escapeHtml(project.hero.src)}"
                alt="${escapeHtml(project.hero.alt)}"
              />
              <span class="project-hero__image-rule" aria-hidden="true"></span>
            </div>
            <figcaption id="hero-caption">
              <span>${escapeHtml(project.hero.caption)}</span>
              <span>${escapeHtml(project.projectName)}</span>
            </figcaption>
          </figure>
        </div>

        <div class="project-hero__rule" aria-hidden="true"></div>
        <dl class="project-meta" aria-label="Project details">
          ${renderMetadata(project.metadata)}
        </dl>
      </section>

      <section
        class="project-sequence${sequenceClass}"
        id="story"
        data-project-sequence
        data-project-kind="${escapeHtml(project.sequence.kind || 'gallery')}"
        aria-labelledby="story-title"
      >
        <div class="project-sequence__intro">
          <div>
            <p class="section-kicker"><span aria-hidden="true"></span>${escapeHtml(project.sectionNumber)} / Sequence</p>
            <h2 id="story-title">${escapeHtml(project.sequence.title)}</h2>
          </div>
          <p>${escapeHtml(project.sequence.copy)}</p>
        </div>

        <div class="sequence-scroll">
          <div class="sequence-sticky">
            <aside class="scene-index" aria-labelledby="scene-index-title">
              <div class="scene-index__head">
                <span id="scene-index-title">Scroll sequence</span>
                <span>01—${String(project.beats.length).padStart(2, '0')}</span>
              </div>
              <ol>
                ${renderBeatList(project)}
              </ol>
            </aside>

            <figure class="scene-visual" aria-labelledby="scene-caption">
              ${renderSceneVisual(project)}
              <figcaption id="scene-caption">
                <span data-scene-caption>${escapeHtml(firstBeat.label)}</span>
                <span>${escapeHtml(project.projectName)}</span>
              </figcaption>
            </figure>

            <div class="scene-reading" data-scene-reading aria-live="polite">
              ${renderBeatReading(project)}
            </div>
          </div>
        </div>
      </section>

      <section class="project-close" id="project-close" aria-labelledby="close-title">
        <div class="project-close__shell">
          <div class="project-close__heading">
            <p class="section-kicker"><span aria-hidden="true"></span>Close / ${escapeHtml(project.projectName)}</p>
            <h2 id="close-title">${escapeHtml(project.closing.title)}</h2>
          </div>
          <div class="project-close__copy">
            <p>${escapeHtml(project.closing.copy)}</p>
            <nav class="project-nav" aria-label="Project navigation">
              <a href="${escapeHtml(project.previous.href)}">
                <span class="project-nav__label">Previous</span>
                <strong><span aria-hidden="true">↖</span>${escapeHtml(project.previous.label)}</strong>
              </a>
              <a href="/v5.1/">
                <span class="project-nav__label">Return</span>
                <strong><span aria-hidden="true">↑</span>V5.1 opening</strong>
              </a>
              <a href="${escapeHtml(project.next.href)}">
                <span class="project-nav__label">Next</span>
                <strong>${escapeHtml(project.next.label)}<span aria-hidden="true">↘</span></strong>
              </a>
            </nav>
          </div>
        </div>
        <footer class="project-footer">
          <span>Ashish Kumar Singh / Presentation and visual communication</span>
          <a href="#project-start">Back to top <span aria-hidden="true">↑</span></a>
          <span>© 2026</span>
        </footer>
      </section>
    </main>
  </body>
</html>
`;
}

module.exports = { renderProject };
