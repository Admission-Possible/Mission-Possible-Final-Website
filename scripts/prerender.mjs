import { readFile, writeFile, rm } from 'node:fs/promises';
import { render } from '../dist/server/entry-server.js';
const template = await readFile('dist/index.html', 'utf8');
const html = template.replace(
  '<div id="root"></div>',
  `<div id="root">${render()}</div><noscript><p>To open the mentorship form, please enable JavaScript. You can read all five sections without it.</p></noscript>`,
);
await writeFile('dist/index.html', html);
await rm('dist/server', { recursive: true, force: true });
console.log('Prerendered the complete five-section website.');
