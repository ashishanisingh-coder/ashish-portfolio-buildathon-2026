# V4 reference study

Research captured from live browser sessions at desktop and mobile sizes on 18 October 2026. This is a directional study, not a source-code or visual-copying exercise.

## Reference 01 — Allgood Studio

URL: https://allgoodstudio.com

### What the experience does

- Opens with a preloader/identity moment before the page resolves into a quiet white canvas.
- Uses a persistent chapter navigation: numbered sections, a thin progress line, and a moving circular marker that turns the long page into a sequence rather than a scroll dump.
- Hero is an authored statement, not a portfolio grid: very large sans words paired with one italic editorial phrase, a short positioning paragraph, a single CTA, and a small looping visual mark.
- A fixed side rail shows the current chapter number and its short argument while the right side changes material: project cards, service cards, process states, benefits, and testimonials.
- The project/service sections behave like designed scenes. Large cards, soft transitions, blurred outgoing content, and subtle image/illustration movement create a sense of pacing without relying on loud effects.
- A linear animated wave field gives the page a signature material. It is restrained, repeated, and tied to the studio's visual language rather than used as a generic gradient.
- Mobile preserves the chapter idea with a compact header, a menu that exposes the same numbered story, a large statement, and a vertical narrative that remains easy to follow.
- The footer is treated as another chapter with clear contact intent rather than as a legal afterthought.

### Motion / interaction notes

- Scroll is the primary input. The current chapter updates continuously and the progress line follows it.
- The circular chapter marker changes iconography by chapter, which makes state change visible without using a modal or a toast.
- The page uses long, deliberate transitions, blur as a passage between chapters, and small secondary movement in cards/images.
- There is a scrub affordance on desktop: navigation feels like a timeline that can be dragged, not only a menu that can be clicked.
- The motion personality is premium: slow enough to feel authored, but with a clear response to scroll.

### What to adapt

- Build V4 as a sequence of editorial chapters with a persistent progress rail.
- Let the left side carry the argument and the right side carry the evidence.
- Give the page one signature motion material, but derive it from Ashish's work: alignment lines, slide edges, crop marks, or presentation guides rather than a copied wave.
- Use the actual projects as scenes, not as identical cards.

### What not to copy

- Allgood's wording, logo, green wave language, service claims, trust marks, testimonial structure, and exact navigation geometry.

## Reference 02 — Metic Studio

URL: https://metic.studio/en/studio

### What the experience does

- Starts with a precise one-person introduction: name, role, location, and a short statement about doing both design and development.
- Uses a workbench image and long-form copy to make the studio feel lived-in and authored.
- Turns the studio's process into a story about timing: room, desk, decks, speakers, music, transition, website.
- Treats a few tiny details as proof of craft: sound control, X-ray mode, a clear start-project action, a scroll counter, and careful microcopy.
- On mobile, it keeps the same editorial honesty: simple header, readable paragraph measure, large image, and a quiet progress indicator.

### Motion / interaction notes

- Motion is narrative and temporal rather than decorative. The scrolling story reveals each thought in order.
- The page uses short, precise transitions and a strong sense of timing; the copy itself explains why timing matters.
- The interface does not need many visible controls because the scroll sequence is the main interaction.

### What to adapt

- Give Ashish a point of view about how he works, not a generic skills list.
- Make the progression of a project legible: frame the brief, find the structure, build the visual system, make it land.
- Use copy that sounds like a designer with a practice, not a list of services.

### What not to copy

- Metic's personal biography, studio images, sound/X-ray controls, and exact narrative language.

## Reference 03 — Crency Agency

URL: https://crency.agency

### What the experience does

- Opens with immediate energy: a dark purple field, expressive oversized typography, floating sticker-like proof points, and a compact central logo/navigation system.
- Uses typographic composition as the hero image. Words split, shift, and lock into place instead of waiting for a photograph to do the work.
- Uses small colored objects and badges as a visual rhythm against the large headline.
- Navigation labels use a two-state hover treatment: the text visibly changes on hover rather than only changing color.
- A persistent bottom action bar keeps the user oriented toward cases, a website action, or the menu on mobile.

### Motion / interaction notes

- The energy is immediate and playful, with text and badges moving as a single composition.
- The palette is committed and recognizable. It does not try to be neutral.
- On mobile, the hero remains expressive rather than collapsing into a standard stacked marketing layout.

### What to adapt

- Commit to one recognizable AS signal color and use it sparingly.
- Let the hero communicate the specialty through a designed phrase, not a generic “selected work” heading.
- Use small proof marks derived from real work: slide crop marks, image labels, presentation page numbers, and project disciplines.

### What not to copy

- The purple field, sticker shapes, stats/claims, iconography, logo treatment, and exact letter choreography.

## Current Fold V3 diagnosis

### What is strong

- The real project imagery is now the right foundation.
- The Philips-led folio is a credible AS object and communicates presentation craft quickly.
- The dark/light contrast and careful paper treatment are worth preserving as material references.

### What is unfinished

- The hero still reads primarily as a composed landing section, not as an experience with a point of view that unfolds.
- The four projects are mostly presented as page sections; they do not yet feel like chapters in one argument.
- The typography is clear but not yet distinctive enough to carry the personality of a senior designer.
- The project index is useful but static. It does not create an authored transition into the work.
- Motion is currently limited to reveal/hover behavior; it does not yet connect the hero, scroll, and project storytelling.

## V4 direction — “Signal to Story”

### Core idea

The homepage behaves like a presentation deck becoming a visual system in real time. A single signal line moves through four actual projects. Each project is a different answer to the same practice: make complex ideas visible, legible, and memorable.

### Palette

- Carbon — `#0b0f10`: the opening surface and quiet contrast.
- Paper — `#f4f1e8`: the reading surface and image mat.
- Signal orange — `#f26b3a`: one active marker, never a decoration layer.
- Electric blue — `#4b5ee8`: information-design / structure signal.
- Soft graphite — `#5a6662`: supporting copy and rules.

No gradients, no glow, no generic glass layer. Depth comes from paper, crop marks, line movement, and controlled image scale.

### Type

- Display: one calm grotesk already compatible with the current AS system, set with slightly tighter tracking and fewer words per line.
- Editorial voice: a restrained serif italic used only for the one phrase that needs human emphasis.
- UI: sentence case, compact, readable, and never a wall of tracked-out labels.

### Homepage flow

1. **Opening signal** — the hero states the practice: “I turn complex ideas into visual systems people can move through.” The phrase “move through” becomes a live slot that resolves through a controlled line/word transition.
2. **The working surface** — a quiet light section introduces the four real projects as a single sequence with one active project stage and a chapter rail.
3. **Four ways to make an idea hold** — project transition interaction: click/scroll through Philips, India, Rotavirus, Uno. Each state changes the large image, discipline, crop, and one sentence, not just a card color.
4. **The method** — three verbs (distill / structure / deliver) appear as an editorial rhythm with crops from supplied project material.
5. **Closing signal** — a dark contact chapter with a direct, honest CTA and no invented email address.

### Motion system

- Personality: premium editorial with one energetic accent.
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)` for most transitions; ease-out for entry.
- Hero: one 900–1200ms load sequence — line draws, image mat settles, headline resolves. No perpetual animation.
- Project transition: 500–650ms image crossfade/scale, 350ms copy shift, line marker moves independently by a small distance.
- Scroll: chapter rail and section progress change; images use restrained 1–2% scale only.
- Reduced motion: all transitions collapse to opacity/color changes and no looping animation.

### Originality guardrails

- Do not reproduce Allgood's green wave, chapter labels, or service narrative.
- Do not reproduce Metic's biography or sound/X-ray interaction.
- Do not reproduce Crency's purple stickers, stats, or letter-by-letter hero composition.
- The AS signature is the collision of presentation mechanics (crop marks, slide numbers, line guides, page edges) with a more human editorial voice.
