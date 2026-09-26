import {readFileSync, readdirSync, existsSync} from 'node:fs';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve('public');
const files=readdirSync(root).filter(f=>f.endsWith('.html'));
let checked=0;
for(const file of files){
 const html=readFileSync(resolve(root,file),'utf8');
 assert.equal((html.match(/<h1\b/g)||[]).length,1,`${file}: one primary heading`);
 for(const [,value] of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  if(/^(https?:|mailto:|data:)/.test(value)) continue;
  const url=new URL(value,`https://example.test/admission-possible/${file}`);
  assert.ok(url.pathname.startsWith('/admission-possible/'),`${file}: subpath-safe ${value}`);
  const target=decodeURIComponent(url.pathname.slice('/admission-possible/'.length))||'index.html';
  assert.ok(existsSync(resolve(root,target)),`${file}: missing ${value}`);
  if(url.hash){
   const destination=readFileSync(resolve(root,target),'utf8');
   assert.ok(destination.includes(`id="${url.hash.slice(1)}"`),`${file}: missing anchor ${value}`);
  }
  checked++;
 }
}
console.log(`Checked ${files.length} pages and ${checked} local links/assets, including GitHub Pages subpaths.`);
