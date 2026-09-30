import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// The source JPEGs stay untouched. Rebuild the web derivatives and public
// attribution page with `npm run images`; no network access is required.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDirectory = resolve(root, 'assets/photography');
const outputDirectory = resolve(root, 'public/campus/steps');
const photos = JSON.parse(await readFile(resolve(sourceDirectory, 'provenance.json'), 'utf8'));
const widths = [800, 1600, 3840];
const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character],
  );

await mkdir(outputDirectory, { recursive: true });
let totalBytes = 0;

// Small panorama panels need a lighter candidate than the retained source.
// Keep every source and preserve its proportions; the hero chooses via srcset.
const campusDirectory = resolve(root, 'public/campus');
const thumbnailDirectory = resolve(campusDirectory, 'thumbs');
const campusFiles = (await readdir(campusDirectory))
  .filter((filename) => /^campus-\d+\.webp$/.test(filename))
  .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
await mkdir(thumbnailDirectory, { recursive: true });
let campusSourceBytes = 0;
let campusThumbnailBytes = 0;

for (const filename of campusFiles) {
  const source = await readFile(resolve(campusDirectory, filename));
  const metadata = await sharp(source).metadata();
  const result = await sharp(source)
    .resize({ width: 800, withoutEnlargement: true })
    .webp({ quality: 82, effort: 6 })
    .toFile(resolve(thumbnailDirectory, filename));
  if (result.width !== Math.min(800, metadata.width)) {
    throw new Error(`Unexpected panorama thumbnail width: ${filename}`);
  }
  campusSourceBytes += source.length;
  campusThumbnailBytes += result.size;
}

console.log(
  `Prepared ${campusFiles.length} panorama thumbnails: ${(campusSourceBytes / 1024 / 1024).toFixed(2)} MiB sources → ${(campusThumbnailBytes / 1024 / 1024).toFixed(2)} MiB thumbnails (${((1 - campusThumbnailBytes / campusSourceBytes) * 100).toFixed(1)}% smaller).`,
);

for (const photo of photos) {
  if (!/^[a-z][a-z0-9-]*$/.test(photo.slug) || photo.file !== `${photo.slug}.jpg`) {
    throw new Error(`Invalid photography filename: ${photo.file}`);
  }
  const source = await readFile(resolve(sourceDirectory, photo.file));
  const hash = createHash('sha256').update(source).digest('hex');
  if (hash !== photo.sha256) throw new Error(`Original photo checksum changed: ${photo.file}`);

  const metadata = await sharp(source).metadata();
  if (metadata.width !== photo.width || metadata.height !== photo.height) {
    throw new Error(`Original photo dimensions differ from provenance: ${photo.file}`);
  }
  if (metadata.width < 3840 || metadata.height < 2160) {
    throw new Error(`A genuine 4K source is required: ${photo.file}`);
  }

  for (const width of widths) {
    const filename = `${photo.slug}-${width}.webp`;
    const result = await sharp(source)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: width === 3840 ? 88 : 84, effort: 6 })
      .toFile(resolve(outputDirectory, filename));
    if (result.width !== width) throw new Error(`Unexpected output width: ${filename}`);
    totalBytes += result.size;
    console.log(`${filename}: ${result.width} × ${result.height}, ${Math.round(result.size / 1024)} KiB`);
  }
}

const credits = photos
  .map(
    (photo) => `
        <li>
          <img src="/campus/steps/${escapeHtml(photo.slug)}-800.webp" alt="${escapeHtml(photo.institution)} campus photograph" width="800" height="${Math.round((photo.height / photo.width) * 800)}" loading="lazy" decoding="async">
          <div>
            <h2>${escapeHtml(photo.institution)}</h2>
            <p>${escapeHtml(photo.title)}</p>
            <p>Photograph by ${photo.artistUrl ? `<a href="${escapeHtml(photo.artistUrl)}">${escapeHtml(photo.artist)}</a>` : escapeHtml(photo.artist)}.</p>
            <p><a href="${escapeHtml(photo.sourcePage)}">Original photograph</a> <span aria-hidden="true">·</span> <a href="${escapeHtml(photo.licenseUrl)}">${escapeHtml(photo.license)}</a></p>
            <p class="metadata">Original: ${photo.width.toLocaleString('en-US')} × ${photo.height.toLocaleString('en-US')} pixels. Resized WebP versions and display crops retain this license.</p>
          </div>
        </li>`,
  )
  .join('\n');

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Photography credits and licenses for Admission Possible.">
    <meta name="theme-color" content="#fafaf7">
    <title>Image credits — (Ad)mission Possible</title>
    <style>
      @font-face{font-family:Beausite;src:url('/fonts/beausite-regular.woff2') format('woff2');font-weight:400;font-style:normal;font-display:swap}
      @font-face{font-family:Beausite;src:url('/fonts/beausite-medium.woff2') format('woff2');font-weight:500;font-style:normal;font-display:swap}
      *{box-sizing:border-box}body{margin:0;background:#fafaf7;color:#171719;font-family:Beausite,Arial,sans-serif;line-height:1.5}main{max-width:1120px;margin:auto;padding:36px clamp(20px,5vw,64px) 72px}a{color:inherit;text-underline-offset:4px}a:hover{color:#6441a0}a:focus-visible{outline:3px solid #6441a0;outline-offset:5px}.back{display:inline-block;margin-bottom:70px;font-size:14px}h1{font-size:clamp(44px,7vw,80px);font-weight:500;letter-spacing:-.06em;line-height:1;margin:0 0 24px}header>p{max-width:700px;font-size:17px;color:#505054}.credits{list-style:none;padding:0;margin:48px 0 0}.credits li{display:grid;grid-template-columns:190px 1fr;gap:30px;padding:30px 0;border-top:1px solid #d0d0cd}.credits img{width:190px;height:142px;object-fit:cover;border-bottom:5px solid #b388eb}.credits h2{font-size:24px;font-weight:500;letter-spacing:-.035em;line-height:1.2;margin:0 0 12px}.credits p{margin:6px 0;font-size:14px}.credits .metadata{color:#5b5b60;font-size:12px;margin-top:12px}footer{border-top:1px solid #d0d0cd;padding-top:24px;margin-top:24px;font-size:12px;color:#5b5b60}@media(max-width:580px){main{padding-top:24px}.back{margin-bottom:50px}.credits li{grid-template-columns:1fr;gap:20px}.credits img{width:100%;height:auto;aspect-ratio:16/9}}
    </style>
  </head>
  <body>
    <main>
      <a class="back" href="/">← Back to Admission Possible</a>
      <header>
        <h1>Image credits.</h1>
        <p>The campus photography in our five-step guide comes from the photographers below. Thank you for sharing these perspectives.</p>
        <p>Web images are proportionally resized and converted to WebP. Some views are cropped to fit their layout; no artistic changes or upscaling have been applied. Each photograph remains available under its source license.</p>
      </header>
      <ol class="credits">${credits}
      </ol>
      <footer>
        <p>University photographs and marks identify their respective institutions. They do not imply affiliation with or endorsement of (Ad)mission Possible.</p>
        <a href="/">Return home ↑</a>
      </footer>
    </main>
  </body>
</html>
`;

await writeFile(resolve(root, 'public/image-credits.html'), html);
console.log(
  `Prepared ${photos.length * widths.length} responsive photos (${(totalBytes / 1024 / 1024).toFixed(2)} MiB total) and image credits.`,
);
