# (Ad)mission Possible — Final Website

A unified, five-section website for Admission Possible: **Home, About Us, How It Works, What We Offer, Join Us**. Built from the two existing organization repositories, with both Git histories retained.

The site preserves the original Beausite typography, black-and-lavender opening animation, moving campus panorama, university marks, and five-step process. It adds Funny-inspired numbered navigation and square pathway previews, full-color photography from genuine 4K originals, a cap logo without the star, and a complete student mentorship intake.

## Run locally

Requires Node 24 or later.

```sh
npm ci
npm run dev
```

Open **http://127.0.0.1:5173**. The explicit address avoids unrelated services that may be listening on localhost's IPv6 address. This development server also runs the same `/api/join` handler used in production.

```sh
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

The build prerenders the complete landing page, so its content is readable before JavaScript loads. Join Us opens an accessible native dialog containing a four-step form; it does not add another primary page or navigation section. Privacy and photography credits are available from the footer.

## Student applications

The four steps cover contact and school details; classes and extracurriculars; interests, college goals, application progress, guidance preferences, availability, and time zone; then review and consent. First-generation background, financial-aid guidance, and extra context are optional. The user can revise any step before submitting.

Copy `.env.example` to `.env.local` and configure a receiving inbox and a verified Resend sender:

```dotenv
RESEND_API_KEY=your_resend_api_key
JOIN_NOTIFY_EMAIL=the_organization_receiving_inbox
JOIN_FROM_EMAIL=Admission Possible <verified_sender_on_your_domain>
```

Set the same three server-side variables in the hosting project for production. Never prefix these values with `VITE_` or commit actual credentials. Restart the development server after changing them.

**Without these variables, the server returns 503 and explicitly says the application was not sent.** The form retains the answers and offers a text download. Tests mock email delivery; they never send email. Successful delivery means the email provider accepted the request, not that a mentor match is guaranteed.

The form validates on both client and server, bounds the request and every field, rejects malformed origins and honeypot submissions, and times out rather than leaving students waiting. Intake details are not logged, persisted in browser storage, or tracked. Closing the dialog clears the current form. The receiving inbox controls retention of submitted information; reply to the team's follow-up to request changes or deletion.

Before opening public intake, connect and verify the receiving inbox and sender, perform one authorized delivery check, and configure provider/hosting request limits appropriate to expected traffic.

## Images and motion

- `assets/photography/`: five unchanged 4K source photographs, attribution, licenses, and hashes.
- `public/campus/steps/`: 800, 1600, and 3840 pixel responsive WebP derivatives.
- `public/campus/`: original campus images from `admission-possible`.
- `public/logos/`: original university and pathway marks from `admission-possible`.
- `public/brand/cap-no-star.png`: edited cap mark, preserving the gradient and orbit.
- `npm run images`: rebuild responsive photography and image credits.

Process photos are alternate licensed originals for Harvard, Brown, Columbia, MIT, and Penn State. The Harvard source also matches an original hero photograph. They are not upscaled small images. Attribution and derivative-license notices are published at `/image-credits.html`.

The original opening sequence lasts about five seconds and can be skipped. Escape, Tab, hash navigation, and reduced-motion preference bypass it. Campus motion pauses without jumping and stops rendering offscreen, when hidden, and with reduced motion. The university strip pauses on hover/focus. Pathway previews work with hover/focus, Escape dismisses them, and touch layouts show inline marks. The process rail supports buttons, keyboard scrolling, and swiping.

## Source history and design

- React, intro, Beausite, process structure, intake foundation: [admission_possible](https://github.com/Admission-Possible/admission_possible)
- Campus photo choreography, university/pathway assets: [admission-possible](https://github.com/Admission-Possible/admission-possible)
- Design study: [Design is Funny](https://www.designisfunny.co/), [Awwwards Minimal](https://www.awwwards.com/websites/minimal/), [TARQ](https://www.tarqstudio.com/es), [Matthieu Givelet](https://matthieugivelet.com/)

Their structure informed spacing, hierarchy, navigation, and interaction; no reference-site code, illustrations, or project imagery were copied. Original source histories are joined by the first consolidation merge. Subsequent commits describe substantive work rather than padded activity.

## Hosting

Vercel's static Vite output plus `/api/join.ts` is supported by `vercel.json`. No hosting deployment or domain change is implied by pushing this repository. Configure a production domain, canonical/Open Graph URLs, and the three email variables when connecting the final hosting project. Existing source repositories remain untouched.
