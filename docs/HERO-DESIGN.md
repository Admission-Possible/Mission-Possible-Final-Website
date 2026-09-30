# Hero exploration

The goal was a substantially different first impression while retaining Beausite, the original lavender/cream/ink palette, five navigation sections, the university marks, and the “Impossible becomes Possible” message.

## Research

The Awwwards minimal and education directories were used to discover candidates. Live sites were then inspected for composition, type scale, image placement, hierarchy, and interaction. The review was curated for this service rather than attempting an exhaustive survey of the archive.

| Reference                                          | Observed idea                                        | Application                              |
| -------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------- |
| [Kurzform](https://www.kurzform.studio/)           | Compact copy, tall image, generous space             | Editorial balance                        |
| [Park](https://parkstudio.co/)                     | Oversized typography integrated with photography     | Scale and alignment                      |
| [Instrument](https://www.instrument.com/)          | Huge type above one large media frame                | A small number of strong elements        |
| [Aspen Search](https://www.aspensearch.com/)       | Precise split grid, separated message and support    | Editorial composition                    |
| [Studio Freight](https://studiofreight.com/)       | Quiet center surrounded by image tiles               | Preserve space around the message        |
| [Studio DAD](https://studiodad.biz/)               | One framed visual, sparse surroundings               | Photographic restraint                   |
| [DVO](https://dvo.it/)                             | Full-bleed human image, bottom-left title            | Future student photography direction     |
| [Big Dreams Group](https://bigdreams.group/)       | Large typographic statement, expansive space         | Poster study                             |
| [Siena Film Foundation](https://siena.film/)       | Single-image art direction and type overlays         | Deliberate image cropping                |
| [App State Art](https://art.appstate.edu/)         | Expressive image composition with large central type | Education can support bold art direction |
| [The Quaker School](https://www.quakerschool.org/) | Classroom scene and a brief human message            | Emotional clarity                        |
| [RISD](https://www.risd.edu/)                      | Oversized left-aligned type and generous space       | Editorial education design               |
| [Brown](https://www.brown.edu/)                    | Dominant campus photography                          | Panorama study                           |
| [Grids by Obys](https://grids.obys.agency/)        | Experimental grid-led storytelling                   | Composition exploration                  |

Funny remained the navigation/pathway reference from the original brief. StudioRS, Elena Gonci, Maison des Élites, and Daybreak were screened out because their interaction or visual direction was unsuitable, or the current homepage was retired. References informed principles; no third-party design code or imagery was copied into the website.

## Studies

Run `npm run dev` and open `/design/index.html`.

- **A — Editorial:** a staggered three-line heading at left and a large campus frame at right. Supporting copy and a substantial action are grouped together.
- **B — Typographic poster:** oversized type becomes the main visual; a small campus window gives it a counterpoint.
- **C — Panorama:** a large two-line statement, supporting copy at right, and one wide campus photograph below.

All three are standalone HTML prototypes with `noindex`, responsive layouts, working section links, and actual brand assets. Their screenshots are preserved under `design/previews/`. They are not part of the production build.

## Implemented refinement

The editorial composition is the initial working direction. It prioritizes an understandable mentorship offer and an immediate path to the intake while making the hero markedly quieter than the original photo fan.

- Beausite and the exact brand palette are retained. “Possible” remains purple.
- One campus is visible at a time; the frame advances horizontally every eight seconds. Five photographs use 800/1600/3840px responsive variants from the existing genuine high-resolution sources.
- A solid primary button opens the existing native mentorship dialog directly. A secondary link explains the process.
- Previous/next controls, swipe, and the global pause control remain available. Automatic motion pauses on hover, focus, reduced-motion preference, document hiding, and when less than a quarter of the image is visible.
- Manual navigation announces the selected campus. Automatic changes do not generate live announcements.
- The current image survives a viewport resize. Rapid button clicks accumulate their intended target. Wrapping from last to first is instant to avoid sweeping back through every photo.
- The original introduction and the Join Us flowing campus imagery remain. The main page still has exactly five sections.
- Mobile places the message and signup action before photography. A second visual pass reduced type size and indentation to eliminate clipping at 320px. Shorter desktop viewports use tighter spacing.

## Checks

TypeScript, ESLint, Prettier, all 42 existing intake/API tests, and production client/SSR/prerender builds passed after integration. The production browser showed all five sections without hydration or page errors. The hero CTA opened the real mentorship form; Escape returned focus to the trigger. Desktop and mobile views were inspected, including 1440×900, 390×844, and 320px-wide screens.

This iteration does not configure or claim successful production email delivery. The existing intake configuration requirements still apply.
