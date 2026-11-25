import { mkdir, readFile, writeFile, cp, rm } from 'node:fs/promises';

export const site = {
  url: 'https://tmosmant.github.io/milkee-site',
  github: 'https://github.com/tmosmant',
  repository: 'https://github.com/tmosmant/milkee-site',
  store: 'https://play.google.com/store/apps/details?id=com.milkee.mobile',
  cdc: 'https://www.cdc.gov/breastfeeding/breast-milk-preparation-and-storage/handling-breastmilk.html',
  faq: 'https://www.cdc.gov/breastfeeding/php/guidelines-recommendations/faqs.html',
};
const languages = ['fr', 'en', 'es', 'zh', 'ka'];
const slugs = ['', 'storage', 'privacy', 'terms', 'legal', 'support', 'delete-account'];
const content = Object.fromEntries(await Promise.all(languages.map(async lang => [lang, JSON.parse(await readFile(new URL(`../content/${lang}.json`, import.meta.url), 'utf8'))])));
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const url = (lang, slug = '') => `${site.url}/${lang}/${slug ? slug + '/' : ''}`;
const a = (href, title) => `<a href="${esc(href)}">${esc(title)}</a>`;
function switcher(lang, slug) {
  return `<details class="languages"><summary>${content[lang].name}<span aria-hidden="true">⌄</span></summary><nav aria-label="${esc(content[lang].labels.language)}">${languages.map(l => `<a lang="${l}" hreflang="${l}" href="${url(l, slug)}" ${l === lang ? 'aria-current="true"' : ''}>${content[l].name}</a>`).join('')}</nav></details>`;
}
function shell(lang, slug, body) {
  const c = content[lang], l = c.labels, title = slug ? `${c.pages[slug].title} · Milkee` : `Milkee · ${c.tagline}`;
  const description = slug ? c.pages[slug].intro : c.description;
  return `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(title)}</title>
<meta name="description" content="${esc(description)}"><meta name="theme-color" content="#F4F2EF"><link rel="canonical" href="${url(lang, slug)}">
${languages.map(l => `<link rel="alternate" hreflang="${l}" href="${url(l, slug)}">`).join('')}<link rel="alternate" hreflang="x-default" href="${url('en', slug)}">
<meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${url(lang, slug)}"><meta property="og:image" content="${site.url}/assets/icon.png"><meta property="og:site_name" content="Milkee">
<link rel="icon" type="image/png" href="${site.url}/assets/icon.png"><link rel="stylesheet" href="${site.url}/assets/site.css"></head>
<body><a class="skip" href="#main">${l.skip}</a><header class="header wrap"><a class="brand" href="${url(lang)}" aria-label="Milkee · ${l.back}"><img src="${site.url}/assets/icon.png" width="40" height="40" alt="">milkee<span aria-hidden="true">.</span></a><nav class="primary-nav" aria-label="Milkee">${a(url(lang) + '#app', c.nav[0])}${a(url(lang, 'storage'), c.nav[1])}${a(url(lang, 'support'), c.nav[2])}</nav>${switcher(lang, slug)}</header>
<main id="main">${body}</main><footer class="footer wrap"><div class="footer-brand"><a class="brand" href="${url(lang)}">milkee<span aria-hidden="true">.</span></a><p>${l.footer}</p></div><nav aria-label="Milkee">${Object.keys(c.pages).map(p => a(url(lang,p), c.pages[p].title)).join('')}${a(site.github,l.contact)}</nav><p class="date">${l.updated}</p></footer></body></html>`;
}
function home(lang) {
  const c = content[lang], l = c.labels;
  return `<section class="hero wrap"><div class="hero-copy"><p class="eyebrow">${l.eyebrow}</p><h1>${c.tagline}</h1><p class="lead">${c.description}</p><div class="hero-actions"><a class="button" href="${site.store}"><svg aria-hidden="true" width="22" height="24" viewBox="0 0 22 24" fill="none"><path d="M2 1.5 14 12 2 22.5V1.5Z" fill="currentColor"/><path d="m4 1 14 8-3 2.5L4 1Zm0 22 14-8-3-2.5L4 23Zm12-11 3-2 3 2-3 2-3-2Z" fill="currentColor"/></svg>${l.download}</a>${a(url(lang,'storage'),l.learn)}</div></div><figure class="app-preview"><div class="screen"><img src="${site.url}/assets/app-home-fr.png" width="1080" height="1920" alt="${l.screenAlt}" fetchpriority="high"></div><figcaption>${l.example}</figcaption></figure></section>
<section id="app" class="features wrap"><div class="section-heading"><p class="eyebrow">Milkee</p><h2>${l.features}</h2><p>${l.featureIntro}</p></div><div class="feature-list">${c.features.map(([title,text],i)=>`<article><span class="feature-icon" aria-hidden="true">${['◉','◎','◷'][i]}</span><div><h3>${title}</h3><p>${text}</p></div></article>`).join('')}</div></section>
<section class="storage-band"><div class="wrap"><div class="guide-heading"><h2>${l.guideTitle}</h2><p>${l.guideIntro}</p></div><div class="metrics">${c.metrics.map(([value,title,note])=>`<div><span class="metric-value">${value}</span><h3>${title}</h3><p>${note}</p></div>`).join('')}</div><a class="text-link" href="${url(lang,'storage')}">${l.guideLink}</a></div></section>`;
}
function article(lang, slug) {
  const c = content[lang], p = c.pages[slug], l=c.labels;
  let refs = [];
  if (['storage','legal','terms'].includes(slug)) refs.push([site.cdc,l.source],[site.faq,l.faqSource]);
  if (['privacy','legal'].includes(slug)) refs.push(['https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement',l.privacySource],['https://support.github.com/', 'GitHub Support']);
  if (slug==='privacy') refs.push(['https://supabase.com/privacy','Supabase'],['https://posthog.com/privacy','PostHog'],['https://policies.google.com/privacy','Google'],['https://www.apple.com/legal/privacy/','Apple'],['https://www.cnil.fr/','CNIL']);
  if (slug==='support') refs.push([site.repository+'/issues','GitHub Issues']);
  if (slug==='delete-account') refs.push([url(lang,'privacy'),c.pages.privacy.title]);
  refs.push([site.github,l.contact]);
  return `<div class="article-layout wrap"><aside><a class="back" href="${url(lang)}">${l.back}</a><nav aria-label="${l.contents}">${p.sections.map(([title],i)=>a(`#section-${i+1}`,title)).join('')}</nav></aside><article class="prose"><header><p class="eyebrow">Milkee</p><h1>${p.title}</h1><p class="lead">${p.intro}</p><p class="date">${l.updated}</p></header>${p.sections.map(([title,text],i)=>`<section id="section-${i+1}"><h2>${title}</h2><p>${text}</p></section>`).join('')}<section class="resources"><h2>${l.resources}</h2><ul>${refs.map(([href,title])=>`<li>${a(href,title)}</li>`).join('')}</ul></section></article></div>`;
}
await rm(new URL('../dist/',import.meta.url), {recursive:true,force:true});
await mkdir(new URL('../dist/assets/',import.meta.url),{recursive:true});
await cp(new URL('../assets/',import.meta.url),new URL('../dist/assets/',import.meta.url),{recursive:true});
for (const lang of languages) for (const slug of slugs) {
  const dir = new URL(`../dist/${lang}/${slug ? slug+'/' : ''}`,import.meta.url);
  await mkdir(dir,{recursive:true});
  await writeFile(new URL('index.html',dir),shell(lang,slug,slug ? article(lang,slug) : home(lang)));
}
const chooser = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Milkee · Choose your language</title><meta name="description" content="Milkee — breast milk stash tracking. Choose your language."><link rel="stylesheet" href="${site.url}/assets/site.css"><link rel="icon" href="${site.url}/assets/icon.png"><link rel="canonical" href="${site.url}/"></head><body><main class="chooser wrap"><a class="brand" href="${url('en')}">milkee.</a><h1>Every pouch counts.</h1><nav aria-label="Language">${languages.map(l=>`<a class="button secondary" lang="${l}" hreflang="${l}" href="${url(l)}">${content[l].name}</a>`).join('')}</nav></main></body></html>`;
await writeFile(new URL('../dist/index.html',import.meta.url),chooser);
await writeFile(new URL('../dist/404.html',import.meta.url),chooser.replace('<title>Milkee · Choose your language</title>','<title>Milkee · 404</title>').replace('<h1>Every pouch counts.</h1>','<h1>404</h1><p>Page not found · Page introuvable · Página no encontrada · 页面未找到 · გვერდი ვერ მოიძებნა</p>'));
await writeFile(new URL('../dist/.nojekyll',import.meta.url),'');
await writeFile(new URL('../dist/robots.txt',import.meta.url),`User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`);
await writeFile(new URL('../dist/sitemap.xml',import.meta.url),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${languages.flatMap(lang=>slugs.map(slug=>`<url><loc>${url(lang,slug)}</loc><lastmod>2026-11-25</lastmod></url>`)).join('')}</urlset>`);
console.log(`Built ${languages.length * slugs.length} translated pages, language chooser and 404.`);
