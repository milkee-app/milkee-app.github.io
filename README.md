# Milkee website

Public website: https://tmosmant.github.io/milkee-site/

Static, accessible website for Milkee. French, English, Spanish, Chinese and Georgian pages describe the app, link to its verified Google Play listing, explain CDC-based milk storage and the app’s more cautious choices, and provide privacy, terms, legal information, help and account deletion instructions.

## Development

Node.js 22 or newer. No package installation is required.

```sh
npm run build
npm test
npm run preview
```

The preview opens at http://127.0.0.1:4173/milkee-site/fr/ and maps production links to the local server without modifying the build output.

Edit `content/{fr,en,es,zh,ka}.json` for translations, `assets/site.css` for presentation and `scripts/build.mjs` for page structure and official source URLs. All translations must keep the same page and section structure. Language links retain the current page. The website works without JavaScript and adds no cookies or analytics. Assets and fonts are hosted locally.

## Publishing

GitHub Pages uses GitHub Actions. Every push to `main` builds and checks the site, then deploys `dist/`. Configure Settings → Pages → Source → GitHub Actions. The workflow uses only `contents: read` for the build and `pages: write` / `id-token: write` for deployment.

The mobile app uses localized URLs of this form:

```text
https://tmosmant.github.io/milkee-site/fr/
https://tmosmant.github.io/milkee-site/fr/privacy/
https://tmosmant.github.io/milkee-site/fr/terms/
https://tmosmant.github.io/milkee-site/fr/storage/
https://tmosmant.github.io/milkee-site/fr/legal/
https://tmosmant.github.io/milkee-site/fr/support/
https://tmosmant.github.io/milkee-site/fr/delete-account/
```

Replace `fr` with `en`, `es`, `zh` or `ka`. Unknown mobile locales should fall back to English. Changing the repository slug requires updating the site URL in `scripts/build.mjs`, `scripts/check.mjs` and the mobile URL configuration.

## Content maintenance

Sources were checked on 2026-11-25. Recheck the CDC originals when storage rules change and update every translation and date. The screenshot is an existing store asset showing fictional data in French; captions disclose this in all languages. The artwork and font files come from the Milkee mobile project. DM Sans is distributed under the included SIL Open Font License.

The publisher requested a GitHub-only public identity. No personal name, personal email or postal address is published. The legal page therefore provides limited publisher information and must not be represented as a complete statutory notice. No blanket legal compliance claim is made. Actual provider retention periods, processing regions and any required health-data legal basis need to be verified by the operator; this website does not invent them. Account deletion does not promise automatic deletion of historical analytics or support data. Requests containing private account information should use in-app support.
