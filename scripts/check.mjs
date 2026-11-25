import assert from 'node:assert/strict';
import { readdir, readFile, access } from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root = new URL('../dist/',import.meta.url);
const base = 'https://milkee-app.github.io/';
let count = 0;
async function scan(dir) {
  for(const item of await readdir(dir,{withFileTypes:true})) {
    const file = new URL(item.name+(item.isDirectory()?'/':''),dir);
    if(item.isDirectory()) await scan(file);
    else if(item.name.endsWith('.html')) {
      const html = await readFile(file,'utf8'); count++;
      assert(!/\bundefined\b|\[object Object\]|\bTODO\b|lorem ipsum/i.test(html), `Unfinished content: ${file}`);
      assert(!/mailto:|thomas\.mosmant|Thomas Mosmant|app\.notion\.com/.test(html), `Unexpected personal information or old URL: ${file}`);
      assert(/<html lang="(en|fr|es|zh|ka)">/.test(html));
      assert(/<main\b/.test(html));
      assert.equal((html.match(/<h1>/g)||[]).length,1,`One H1: ${file}`);
      const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
      assert.equal(ids.length,new Set(ids).size,`Duplicate IDs: ${file}`);
      for(const [,ref] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
        if(ref.startsWith('#')) assert(ids.includes(ref.slice(1)),`Broken fragment ${ref}: ${file}`);
        if(ref.startsWith(base)) {
          const parsed=new URL(ref); const relative=decodeURIComponent(parsed.pathname.slice(new URL(base).pathname.length));
          const target=new URL(relative.endsWith('/')?relative+'index.html':relative,root);
          await access(target);
          if(parsed.hash) assert((await readFile(target,'utf8')).includes(`id="${parsed.hash.slice(1)}"`),`Broken target fragment: ${ref}`);
        }
      }
      for(const [,tag] of html.matchAll(/<img\b([^>]+)>/g)) assert(/alt="[^"]*"/.test(tag),'Missing image alt');
      if(/\/dist\/(fr|en|es|zh|ka)\//.test(file.pathname)) {
        for(const lang of ['fr','en','es','zh','ka']) assert(html.includes(`hreflang="${lang}"`));
        const lang=file.pathname.match(/\/dist\/(fr|en|es|zh|ka)\//)[1];
        const slug=path.relative(new URL(`${lang}/`,root).pathname,file.pathname).split('/')[0];
        for(const [,link] of html.matchAll(/hreflang="(?:fr|en|es|zh|ka)" href="([^"]+)"/g)) {
          if(slug!=='index.html') assert(link.endsWith(`/${slug}/`),`Language switch lost page: ${link}`);
        }
      }
    }
  }
}
await scan(root);
assert.equal(count,37);
const screenshots = JSON.parse(await readFile(new URL('assets/screenshots.json',root),'utf8'));
assert.equal(screenshots.demoData,true,'Only demo captures belong on the public site');
assert.equal(screenshots.images.length,3);
for(const capture of screenshots.images) {
  const bytes=await readFile(new URL(`assets/${capture.file}`,root));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),capture.sha256,'Capture provenance must match the published image');
  assert.equal(bytes.readUInt32BE(16),capture.width);
  assert.equal(bytes.readUInt32BE(20),capture.height);
}
const homepage = await readFile(new URL('index.html',root),'utf8');
assert(homepage.includes('https://play.google.com/store/apps/details?id=com.milkee.mobile'), 'Root homepage must offer the app store link');
assert(homepage.includes('/fr/privacy/'), 'Root homepage must expose the privacy policy');
for(const lang of ['fr','en','es','zh','ka']) {
  const home = await readFile(new URL(`${lang}/index.html`,root),'utf8');
  for(const screen of ['home','inventory','sharing']) {
    assert(home.includes(`id="preview-${screen}"`), `Missing product preview control: ${lang}/${screen}`);
    assert(home.includes(`app-${screen}-fr.png?v=`), `Missing versioned screenshot: ${lang}/${screen}`);
  }
  assert.equal((home.match(/name="preview"/g)||[]).length,3, `Preview group: ${lang}`);
  const deletion = await readFile(new URL(`${lang}/delete-account/index.html`,root),'utf8');
  assert(deletion.includes('class="notice"'), `Deletion limitations must remain prominent: ${lang}`);
}
console.log(`Checked ${count} HTML files: local links, fragments, language parity, metadata, image alternatives and public identity.`);
