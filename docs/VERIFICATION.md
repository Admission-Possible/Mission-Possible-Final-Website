# Verification record

Verified locally on September 29, 2026 (America/New_York).

## Automated checks

- TypeScript strict checks: passed.
- ESLint: passed.
- Prettier: passed.
- Vitest: 42 tests passed across the form and API.
- Intake/API coverage: 91.73% statements, 93.77% branches, 84.31% functions, 93.68% lines.
- Production client + SSR build and single-page prerender: passed.
- npm audit: zero reported vulnerabilities.
- Image pipeline: 15 process derivatives verified against actual source sizes; 21 hero thumbnails verified with no upscaling.

## Browser checks

- Production preview displays exactly five main sections, the correct headline, and no hydration errors.
- Home and section navigation use the expected active link after scrolling.
- Desktop 1440px and mobile 390px, 375px, and 320px layouts inspected; no horizontal page overflow.
- The original opening sequence is skippable. Reduced motion bypasses it and restores scrolling.
- Campus pause preserves the current positions; no animation style mutations occur while paused or under reduced motion.
- Five-step rail scrolls with controls, reaches the final item, and disables the next control at the end.
- Pathway preview responds to focus and hover. Escape dismisses it; touch layouts show inline marks.
- Native form and privacy dialogs keep the page behind them inert, close with Escape, restore trigger focus, and restore body scrolling.
- Full four-step form completed in the real browser using synthetic example data. Review retained contact, academics, activities, interests, college goals, availability, and time zone.
- Real local API returned its expected unconfigured 503. The UI clearly said no submission was sent, retained all answers, and offered download.
- Server success, timeout, malformed data, origin handling, oversized body, provider failures, missing configuration, and duplicate-click behavior are covered by tests with mocked email delivery.

## Not claimed

No real student information or email was sent during verification. Production email delivery still requires the organization's receiving inbox, a Resend API key, and a verified sender. A hosting deployment and custom domain are separate from repository publication.
