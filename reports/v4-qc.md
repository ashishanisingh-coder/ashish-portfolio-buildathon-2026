# V4 homepage prototype QC

## Prototype

- URL: http://127.0.0.1:4182/
- Source: `v4/`
- Status: isolated, un-deployed, review-only
- Existing V3 production site: unchanged

## Screenshots

- `reports/v4/home-desktop.png` — opening signal, desktop
- `reports/v4/home-mobile.png` — opening signal, mobile
- `reports/v4/working-surface-desktop.png` — project stage, desktop
- `reports/v4/method-desktop.png` — method/story chapter, desktop
- `reports/v4/closing-desktop.png` — closing contact chapter, desktop

## Reference study

See `reports/v4-reference-study.md` for the live-browser observations from Allgood Studio, Metic Studio, Crency Agency, and the current Fold V3 site, plus the original V4 art direction.

## Functional checks

- `node --check v4/app.js` — passed
- `node --check v4/serve.js` — passed
- `node --check v4/test.js` — passed
- V4 server asset/route smoke test — passed
- Browser console after reload — 0 errors / 0 warnings
- Desktop viewport checked at `1440 × 900`
- Mobile viewport checked at `390 × 844`
- No horizontal overflow at desktop or mobile
- All four real project assets load
- Chapter rail buttons scroll to the correct chapters
- Project stage button changes image, title, discipline, status, and summary
- Project stage arrow-key navigation changes the active project and focus
- Contact disclosure opens with `aria-expanded` and a live status message
- Reduced-motion CSS rule present

## Design review

### Preserved

- Editorial contrast between carbon and paper surfaces.
- Actual project material as the dominant visual content.
- AS identity as a visual communication practice, not a generic web studio.
- One signal-orange accent and presentation mechanics: crop marks, page counts, line guides, and source labels.

### Borrowed as principles, not assets

- Allgood: chapter progression, pinned editorial logic, and scene-based storytelling.
- Metic: authored working philosophy and precise pacing.
- Crency: immediate typographic energy and one committed accent language.

### Deliberately not copied

- No reference-site logos, source code, artwork, exact copy, exact navigation, gradients, or client claims.
