# Instrucțiuni de construcție: site premium de prezentare pe Cloudflare

**Scop:** construirea unui site de prezentare extrem de premium pentru un produs/AI de dezvoltare, găzduit în rețeaua Cloudflare.

**Pagini obligatorii:**

- `/` — homepage
- `/download/` — pagină simplă de download, pregătită pentru completare ulterioară
- `/contact/` — pagină de contact
- `/404/` — pagină custom 404

**Public țintă:** fondatori, CTO, echipe de produs, developeri seniori, potențiali clienți enterprise.

**Principiu de bază:** site-ul trebuie să pară construit de o echipă de top, nu de un generator de landing page. Nu accepta un design generic, plat, basic, tip template SaaS obișnuit.

---

## 1. Decizia tehnică finală

Folosește această configurație:

```txt
Framework: Astro static SSG
Language: TypeScript
Styling: CSS custom premium, cu CSS variables; Tailwind este opțional, dar nu obligatoriu
Hosting: Cloudflare Workers Static Assets
Runtime server: none în v1
Contact backend: none în v1; contact prin mailto sau link extern controlat
Output: dist/
Deploy: wrangler deploy
```

### De ce Astro static

Pentru un site de prezentare, Astro este alegerea optimă deoarece produce HTML static, are JavaScript minim by default și permite interactivitate doar unde este necesară. Site-ul de prezentare nu are nevoie de SSR, API routes sau Server Components.

### De ce Cloudflare Workers Static Assets, nu Cloudflare Pages

Pentru proiecte noi pe Cloudflare, target-ul recomandat este **Workers Static Assets**. Site-ul va fi un static site pur, deci nu are nevoie de Worker script. `wrangler.jsonc` trebuie să indice doar directorul `./dist`.

### Ce nu trebuie folosit în v1

Nu folosi:

```txt
Next.js SSR
Cloudflare Pages ca target principal
Worker API pentru contact, dacă nu este cerut explicit
Bază de date
CMS
Third-party embeds grele
jQuery
UI kit generic copiat integral
Template SaaS vizibil generic
```

Dacă proprietarul proiectului cere ulterior form de contact funcțional, se adaugă separat un Worker endpoint `/api/contact` cu validare, Turnstile și provider email. În v1, site-ul trebuie să rămână static.

---

## 2. Setup proiect

### Variantă recomandată: creare prin Cloudflare C3

```bash
npm create cloudflare@latest -- ai-dev-site --framework=astro
cd ai-dev-site
npm install
```

Dacă setup-ul automat adaugă adapter/server mode, verifică să rămână static pentru v1. Pentru un static site Astro nu este nevoie de adapter Cloudflare.

### Variantă manuală

```bash
npm create astro@latest ai-dev-site
cd ai-dev-site
npm install
npm install -D wrangler typescript @astrojs/check
npm install @astrojs/sitemap
```

### `package.json` scripts

Configurează scripturile astfel:

```json
{
  "scripts": {
    "dev": "astro dev",
    "check": "astro check",
    "build": "astro check && astro build",
    "preview": "astro preview",
    "deploy": "npm run build && wrangler deploy"
  }
}
```

---

## 3. Configurare Cloudflare Workers Static Assets

Creează `wrangler.jsonc` în root:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "ai-dev-site",
  "compatibility_date": "2026-05-28",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "404-page",
    "html_handling": "auto-trailing-slash"
  },
  "observability": {
    "enabled": true
  }
}
```

Reguli importante:

- Nu adăuga `main` în `wrangler.jsonc` pentru v1.
- Fără `main`, proiectul servește doar assets statice.
- Nu adăuga Worker script decât dacă apare o cerință reală de logică dinamică.
- `dist/` este singurul director care trebuie deployat.
- `not_found_handling: "404-page"` trebuie să servească `src/pages/404.astro` pentru rute inexistente.

Deploy:

```bash
npm run deploy
```

Preview local Cloudflare-like, dacă este necesar:

```bash
npm run build
npx wrangler dev
```

---

## 4. Structură de fișiere obligatorie

Construiește proiectul aproximativ așa:

```txt
ai-dev-site/
  public/
    _headers
    robots.txt
    favicon.svg
    icons/
    images/
    og/
  src/
    assets/
    components/
      BrandMark.astro
      Button.astro
      Container.astro
      Footer.astro
      Header.astro
      Icon.astro
      PremiumCard.astro
      SectionHeader.astro
      SurfaceGlow.astro
    config/
      site.ts
      nav.ts
    content/
      homepage.ts
      download.ts
      contact.ts
    layouts/
      BaseLayout.astro
    pages/
      index.astro
      download.astro
      contact.astro
      404.astro
    styles/
      global.css
      tokens.css
  astro.config.mjs
  package.json
  tsconfig.json
  wrangler.jsonc
```

Separă clar:

```txt
config/    = nume produs, URL, metadata, CTA-uri
content/   = texte editabile pentru pagini
components/= componente vizuale reutilizabile
pages/     = rute reale Astro
styles/    = design system global
```

---

## 5. Configurație Astro

`astro.config.mjs`:

```js
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://example.com",
  integrations: [sitemap()],
  output: "static"
});
```

Înlocuiește `https://example.com` cu domeniul real când este disponibil.

---

## 6. Site config centralizat

Creează `src/config/site.ts`:

```ts
export const siteConfig = {
  name: "Numele Produsului",
  shortName: "ProductAI",
  domain: "https://example.com",
  description:
    "A premium AI development system for shipping better software faster.",
  email: "contact@example.com",
  nav: [
    { label: "Home", href: "/" },
    { label: "Download", href: "/download/" },
    { label: "Contact", href: "/contact/" }
  ],
  cta: {
    primary: { label: "Download", href: "/download/" },
    secondary: { label: "Contact", href: "/contact/" }
  },
  social: {
    github: "",
    x: "",
    linkedin: ""
  }
} as const;
```

Toate textele care probabil se vor schimba trebuie să fie în `config/` sau `content/`, nu hardcodate adânc în componente.

---

## 7. Design direction: ultra-premium, nu basic

### Stil vizual dorit

Direcție: **premium AI infrastructure / elite developer tool / confidential command center**.

Folosește:

```txt
fundal întunecat rafinat
mesh gradients subtile
accente cyan / violet / electric blue / silver
glass panels de calitate, nu blur excesiv
borders fine 1px cu opacitate mică
lumini ambientale controlate
micro-interacțiuni discrete
spacing generos
tipografie mare, sigură, editorială
iconografie coerentă, stroke-based
mockup de produs / terminal / dashboard în hero
```

Nu folosi:

```txt
carduri gri banale
hero cu gradient generic
butoane default
iconițe amestecate din stiluri diferite
shadow-uri murdare
layout comprimat
stock photos random
fonturi externe încărcate necontrolat
animații agresive
culori neon necontrolate
```

### Paletă recomandată

Definește în `src/styles/tokens.css`:

```css
:root {
  --color-bg: #05070d;
  --color-bg-elevated: #0a0d16;
  --color-surface: rgba(255, 255, 255, 0.055);
  --color-surface-strong: rgba(255, 255, 255, 0.09);
  --color-border: rgba(255, 255, 255, 0.12);
  --color-border-strong: rgba(255, 255, 255, 0.2);

  --color-text: #f7f8fb;
  --color-muted: #a7adbd;
  --color-subtle: #737b91;

  --color-accent: #7dd3fc;
  --color-accent-2: #a78bfa;
  --color-accent-3: #22d3ee;
  --color-success: #34d399;

  --radius-sm: 12px;
  --radius-md: 18px;
  --radius-lg: 28px;
  --radius-xl: 36px;

  --container: 1180px;
  --header-height: 76px;

  --shadow-premium: 0 30px 100px rgba(0, 0, 0, 0.45);
  --shadow-glow: 0 0 80px rgba(125, 211, 252, 0.18);
}
```

### Tipografie

Folosește font stack performant:

```css
--font-sans: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-mono: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
```

Dacă se folosesc fonturi premium, ele trebuie self-hosted în `public/fonts/` numai dacă există licență clară. Nu încărca Google Fonts direct în v1 decât dacă proprietarul aprobă explicit.

### Grid și layout

- Container max-width: `1180px`.
- Padding desktop: `32px` lateral.
- Padding mobile: `20px` lateral.
- Secțiuni: `96px–140px` vertical pe desktop.
- Hero: min-height aproximativ `calc(100svh - var(--header-height))`, dar fără a forța conținutul să arate gol.
- Mobile-first, dar cu finisaj desktop impecabil.

---

## 8. Componente obligatorii

### `Header.astro`

Cerințe:

- sticky sau fixed subtil, cu fundal blurat numai după scroll dacă se implementează JS minimal;
- logo premium în stânga;
- navigație: Home, Download, Contact;
- CTA în dreapta: `Download` sau `Contact`;
- mobile menu simplu, accesibil;
- stare activă pentru pagina curentă.

### `Footer.astro`

Cerințe:

- brand + tagline;
- nav links;
- contact email;
- copyright;
- mini status text: `Built for Cloudflare edge delivery`.

### `Button.astro`

Variante:

```txt
primary: gradient premium, glow subtil
secondary: glass/outline
ghost: text link cu icon arrow
```

Butoanele trebuie să aibă:

- focus visible;
- hover și active states;
- icon opțional dreapta/stânga;
- dimensiuni coerente.

### `PremiumCard.astro`

Cerințe:

- border fin;
- gradient intern foarte subtil;
- hover lift de maximum 4px;
- icon consistent;
- fără carduri complet plate.

### `Icon.astro`

Construiește iconuri inline SVG cu `currentColor`, 24x24, stroke consistent.

Iconuri minime:

```txt
Spark
Terminal
Cloud
Shield
Download
Mail
ArrowRight
Check
Bolt
Layers
```

Nu amesteca librării diferite de iconuri. Dacă folosești o librărie, folosește una singură și păstrează stilul coerent.

---

## 9. Homepage: structură obligatorie

Pagina `/` trebuie să arate premium și să conțină cel puțin următoarele secțiuni.

### 9.1 Hero premium

Conținut:

- eyebrow: `AI Development System` sau similar;
- headline mare, memorabil;
- subheadline clar;
- CTA principal către `/download/`;
- CTA secundar către `/contact/`;
- mockup vizual: terminal, command center, code pane sau dashboard futurist;
- trust/status row: `Private beta`, `Cloudflare edge-ready`, `Built for modern teams`.

Exemplu de copy temporar:

```txt
Headline:
Build, reason and ship software with an AI system engineered for serious teams.

Subheadline:
A premium development AI interface designed for fast iteration, structured execution and production-grade delivery workflows.
```

Nu folosi headline generic de tip `Build faster with AI`. Trebuie să sune high-end.

### 9.2 Problem / Positioning

3 carduri cu iconuri:

```txt
Context switching kills velocity
AI output needs structure
Production work requires control
```

Fiecare card trebuie să aibă titlu, text scurt și icon.

### 9.3 Product capability grid

6 carduri premium:

```txt
Architecture planning
Code generation workflows
Cloud deployment guidance
Review and refactor loops
Documentation generation
Operational checklists
```

### 9.4 Workflow section

Secțiune în 4 pași:

```txt
1. Define the build target
2. Generate the implementation plan
3. Execute in structured passes
4. Verify, deploy and iterate
```

Vizual: timeline premium, cards suprapuse sau rail vertical.

### 9.5 Visual proof section

Creează un mockup mare, tip `command center`, cu:

```txt
terminal strip
AI reasoning plan card
code diff preview
deploy status
audit checklist
```

Atenție: nu trebuie să fie funcțional. Este un visual static, dar trebuie să arate ca un produs real.

### 9.6 Security / Control / Cloud section

3 coloane:

```txt
Controlled execution
Transparent instructions
Edge-ready deployment
```

Include Cloudflare ca infrastructură de livrare, dar nu folosi logo Cloudflare decât dacă există drept de folosire și respect al brand guidelines.

### 9.7 Final CTA

CTA mare:

```txt
Ready to build with a more disciplined AI development workflow?
```

Butoane:

```txt
Download
Contact
```

---

## 10. Pagina Download

Ruta: `/download/`

Această pagină trebuie să fie simplă, premium și pregătită pentru completare ulterioară.

### Cerințe de conținut

- titlu: `Download`;
- status: `Coming soon` sau `Private beta`;
- text scurt: versiunea publică nu este încă disponibilă;
- 3 carduri platformă:
  - macOS — disabled / coming soon;
  - Windows — disabled / coming soon;
  - Linux — disabled / coming soon;
- secțiune `Release notes` placeholder;
- secțiune `System requirements` placeholder;
- CTA către `/contact/` pentru acces timpuriu.

### Comportament

Nu crea linkuri false de download. Butoanele inactive trebuie să fie vizual clare.

Exemplu:

```txt
Download builds are not public yet. Contact us for early access or private deployment options.
```

Adaugă atribute accesibile pentru butoane disabled.

---

## 11. Pagina Contact

Ruta: `/contact/`

### Variantă v1: static, fără backend

Conținut:

- titlu premium;
- text scurt pentru inquiry;
- card email cu `mailto:`;
- card pentru `Private demo` cu link placeholder sau contact email;
- card pentru `Technical partnership`;
- zonă de întrebări scurte / FAQ.

Formularul este opțional. Dacă este inclus, să nu pretindă că trimite date dacă nu există backend.

Acceptabil:

```html
<a href="mailto:contact@example.com?subject=ProductAI%20inquiry">Contact by email</a>
```

Neacceptabil:

```txt
Formular care afișează "Sent" fără să trimită nimic real.
```

### Variantă ulterioară, nu în v1

Dacă se cere contact form real:

```txt
Cloudflare Worker endpoint: /api/contact
Turnstile anti-spam
Rate limiting
Email provider: Resend/Postmark/SendGrid sau Cloudflare Email Routing + worker logic
Cache-Control: no-store
```

---

## 12. Pagina 404

Ruta: `/404/`

Cerințe:

- design în același stil premium;
- mesaj scurt;
- linkuri către Home, Download, Contact;
- fără ilustrații copilărești.

---

## 13. Cache și headers

Creează `public/_headers`.

Recomandare inițială:

```txt
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()
  Content-Security-Policy: default-src 'self'; img-src 'self' data:; font-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self' mailto:

/_astro/*
  Cache-Control: public, max-age=31536000, immutable

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/fonts/*
  Cache-Control: public, max-age=31536000, immutable

/favicon.svg
  Cache-Control: public, max-age=86400

/robots.txt
  Cache-Control: public, max-age=3600

/sitemap-index.xml
  Cache-Control: public, max-age=3600

/sitemap-0.xml
  Cache-Control: public, max-age=3600
```

Reguli:

- HTML-ul nu trebuie cache-uit agresiv pe termen lung.
- Asset-urile hash-uite Astro, de obicei în `/_astro/`, pot fi cache-uite pe termen lung cu `immutable`.
- Nu seta `Cache-Control: public, max-age=31536000` pe HTML.
- Verifică headers cu `curl -I` după deploy.

Comenzi de verificare:

```bash
curl -I https://example.com/
curl -I https://example.com/_astro/some-built-asset.css
```

Așteptare:

```txt
HTML: revalidate / no long immutable cache
_astro assets: public, max-age=31536000, immutable
```

---

## 14. SEO și metadata

Fiecare pagină trebuie să aibă:

```txt
title unic
description unică
canonical URL
Open Graph title
Open Graph description
Open Graph image
Twitter card metadata
```

Creează în `BaseLayout.astro` props pentru:

```ts
title
description
canonicalPath
ogImage
```

Exemplu de title-uri:

```txt
Home: ProductAI — Premium AI Development System
Download: Download ProductAI
Contact: Contact ProductAI
404: Page not found — ProductAI
```

Adaugă JSON-LD minimal pe homepage:

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "ProductAI",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "macOS, Windows, Linux"
}
```

`robots.txt`:

```txt
User-agent: *
Allow: /

Sitemap: https://example.com/sitemap-index.xml
```

---

## 15. Performance budget

Ținte minime:

```txt
Lighthouse Performance: 95+
Lighthouse Accessibility: 95+
Lighthouse Best Practices: 95+
Lighthouse SEO: 95+
Initial JS: cât mai aproape de zero; evită JS inutil
CLS: < 0.05
LCP: < 2.0s pe conexiune decentă
```

Reguli:

- Nu folosi biblioteci grele pentru animații dacă se poate face cu CSS.
- Nu încărca video în hero în v1.
- Nu folosi imagini remote neoptimizate.
- Folosește SVG pentru iconuri și decoruri.
- Folosește `prefers-reduced-motion`.
- Nu bloca render-ul cu scripturi externe.

Exemplu CSS pentru motion:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.001ms !important;
  }
}
```

---

## 16. Accesibilitate

Cerințe obligatorii:

- contrast text/fundal suficient;
- toate linkurile și butoanele focusabile;
- focus visible custom;
- `aria-label` pentru icon-only buttons;
- semantic HTML: `header`, `main`, `section`, `footer`;
- un singur `h1` per pagină;
- ierarhie corectă `h2`, `h3`;
- mobile menu accesibil;
- fără animații obligatorii pentru înțelegerea conținutului.

---

## 17. Cerințe vizuale foarte specifice

### Homepage hero trebuie să includă

- un background radial mesh subtil;
- un layer de noise foarte fin, fie CSS, fie SVG;
- un mockup central premium;
- minimum 2 highlights luminoase controlate;
- badge-uri mici cu statusuri tehnice;
- CTA-uri aliniate impecabil;
- iconuri în carduri.

### Cardurile trebuie să aibă

- border 1px translucid;
- gradient intern subtil;
- hover cu border accent;
- icon într-un container mic cu fundal glass;
- titluri scurte;
- body text de maximum 2–3 rânduri.

### Contact page trebuie să pară enterprise

Nu o pagină goală cu un email. Adaugă:

```txt
contact methods grid
inquiry types
response expectation text
small security/confidentiality note
premium CTA panel
```

### Download page trebuie să pară produs real

Chiar dacă download-ul nu este gata, pagina trebuie să sugereze maturitate:

```txt
version placeholder
platform cards
release notes placeholder
checksums placeholder disabled
private beta access CTA
```

---

## 18. Conținut placeholder recomandat

Înlocuiește ulterior cu brandul real.

### Brand placeholder

```txt
ProductAI
```

### Tagline

```txt
A premium AI development system for disciplined software delivery.
```

### Hero headline

```txt
Build software with an AI system designed for execution, not just answers.
```

### Hero subheadline

```txt
Plan architecture, generate implementation paths, review trade-offs and ship production-ready workflows from a focused AI development interface.
```

### CTA-uri

```txt
Primary: Download
Secondary: Contact
```

### Feature card titles

```txt
Structured build plans
Code-aware execution
Cloud deployment guidance
Review-ready outputs
Premium developer workflow
Controlled iteration loops
```

---

## 19. Implementare CSS: reguli de calitate

Folosește `global.css` + `tokens.css`.

`src/styles/global.css` trebuie să includă:

```css
@import "./tokens.css";

* {
  box-sizing: border-box;
}

html {
  background: var(--color-bg);
  color-scheme: dark;
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-height: 100svh;
  font-family: var(--font-sans);
  color: var(--color-text);
  background:
    radial-gradient(circle at 20% 10%, rgba(125, 211, 252, 0.16), transparent 34rem),
    radial-gradient(circle at 80% 0%, rgba(167, 139, 250, 0.16), transparent 32rem),
    linear-gradient(180deg, #05070d 0%, #070a12 48%, #05070d 100%);
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}

a {
  color: inherit;
  text-decoration: none;
}

img, svg {
  display: block;
  max-width: 100%;
}

:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 4px;
}

::selection {
  background: rgba(125, 211, 252, 0.28);
  color: var(--color-text);
}
```

Nu suprascrie focus-ul fără replacement vizibil.

---

## 20. Deploy în Cloudflare

### Local build

```bash
npm run check
npm run build
```

### Deploy

```bash
npm run deploy
```

### Custom domain

În Cloudflare:

```txt
Workers & Pages → ai-dev-site → Settings → Domains & Routes → Add custom domain
```

Recomandare DNS:

```txt
example.com      → redirect 301 către https://www.example.com
www.example.com  → site principal
```

Dacă se folosește apex domain direct, asigură-te că redirecturile canonice sunt consistente în metadata și sitemap.

---

## 21. Verificări după deploy

Rulează:

```bash
curl -I https://example.com/
curl -I https://example.com/download/
curl -I https://example.com/contact/
curl -I https://example.com/does-not-exist
```

Verifică:

```txt
200 pentru /, /download/, /contact/
404 real sau custom 404 pentru rută inexistentă
Content-Type corect
security headers prezente
cache headers corecte pentru assets
canonical links corecte
sitemap generat
robots.txt valid
```

Test vizual:

```txt
Desktop 1440px
Laptop 1280px
Tablet 768px
Mobile 390px
Mobile 360px
```

Test browsers:

```txt
Chrome
Safari
Firefox
Edge
```

---

## 22. Checklist final de acceptanță

Site-ul este acceptat doar dacă:

```txt
[ ] Folosește Astro static SSG.
[ ] Deploy target este Cloudflare Workers Static Assets.
[ ] Nu există Worker script în v1.
[ ] Există paginile /, /download/, /contact/, /404/.
[ ] Designul arată foarte premium, nu generic.
[ ] Homepage are hero premium, carduri, iconuri, workflow, CTA final.
[ ] Download page are platform cards și status clar Coming soon/Private beta.
[ ] Contact page are minimum 3 metode/tipuri de contact și mailto funcțional.
[ ] Header și footer sunt coerente pe toate paginile.
[ ] Există `_headers` cu security headers și cache pentru assets hash-uite.
[ ] HTML nu este long-cache-uit.
[ ] SEO metadata este unică per pagină.
[ ] Sitemap și robots.txt există.
[ ] Lighthouse este 95+ pe Performance, Accessibility, Best Practices și SEO.
[ ] Site-ul este responsive și arată premium pe mobile.
[ ] Nu există linkuri false de download.
[ ] Nu există formular fals de contact.
[ ] Nu există scripturi externe inutile.
```

---

## 23. Instrucțiune directă pentru AI-ul de dezvoltare

Implementează acest proiect ca un site de prezentare premium, static, în Astro, deployabil pe Cloudflare Workers Static Assets. Prioritatea este calitatea vizuală și performanța. Nu crea un landing page generic. Creează un design high-end cu iconografie coerentă, secțiuni clare, mockup vizual de produs, spațiere generoasă, gradients subtile și componente reutilizabile.

Respectă următoarele constrângeri:

```txt
- Nu folosi SSR.
- Nu folosi Next.js.
- Nu crea backend.
- Nu crea API.
- Nu crea formular fals.
- Nu folosi assets remote fără motiv.
- Nu încărca fonturi externe fără aprobare.
- Nu cache-ui HTML agresiv.
- Nu face download links false.
```

La final, proiectul trebuie să ruleze cu:

```bash
npm run dev
npm run build
npm run deploy
```

Și să poată fi publicat în Cloudflare network ca static site pur.

---

## 24. Surse oficiale utile

- Cloudflare Workers Static Assets: `https://developers.cloudflare.com/workers/static-assets/`
- Cloudflare Workers best practices: `https://developers.cloudflare.com/workers/best-practices/workers-best-practices/`
- Cloudflare Astro guide: `https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/`
- Cloudflare Static Assets headers: `https://developers.cloudflare.com/workers/static-assets/headers/`
- Cloudflare Static Assets SSG routing: `https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/`
- Astro Cloudflare docs: `https://docs.astro.build/en/guides/integrations-guide/cloudflare/`
