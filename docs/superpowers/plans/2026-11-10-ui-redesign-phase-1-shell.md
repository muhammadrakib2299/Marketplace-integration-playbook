# UI redesign phase 1: design system and shell implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every page the mockup's design system and shell (tokens, typography, scrollbars, motion, top bar, catalog-driven sidebar with logos, evidence card, search palette, article styles) without changing page content.

**Architecture:** Extend the VitePress default theme (spec approach A). New styles live in four focused files under `.vitepress/theme/styles/` that load after the legacy `custom.css` and replace its shell and article rules. A pure, tested `scripts/sidebar.mjs` builds the sidebar from catalog data. A wrapper `Layout.vue` fills VitePress layout slots with small Vue components.

**Tech Stack:** VitePress 1.6.4 (pinned), Vue 3, `yaml`, Node's `node:test`; new dependencies `lucide-vue-next` 1.0.0, `simple-icons` 16.37.0, and `@fontsource-variable/jetbrains-mono` 5.3.0.

**Spec:** [UI redesign design spec](../specs/2026-11-10-ui-redesign-design.md), sections 5.1, 5.1a–c, 5.2, and phase 1 of 5.6. All nine decisions in section 6 are approved with their defaults.

## Global Constraints

- Real data only: no sample numbers, and no "Tested" label or test count without a recorded run.
- Light tokens: bg `#F6F7F9`, surface `#FFFFFF`, surface-2 `#F1F3F6`, surface-3 `#E9ECF1`, border `#E3E7ED`, border-strong `#CBD2DC`, ink `#0E1420`, text `#1F2937`, muted `#5B6678`, faint `#8B95A7`, primary `#1E4FD8`, primary-ink `#143BA6`, primary-soft `#E8EEFC`, primary-border `#B9C9F4`; success `#0F7B5F`/`#E3F5EE`/`#9FD9C2`, warning `#B4640A`/`#FBF1DF`/`#F0CF95`, danger `#C0303A`/`#FBE7E9`/`#F0B3B9`, info `#2F6FAD`/`#E7F0FA`/`#B5D0EC`, violet `#6B4FD8`/`#EEEAFB`/`#CCC1F3`.
- Dark tokens: bg `#0C1017`, surface `#121824`, surface-2 `#171E2B`, surface-3 `#1E2635`, border `#232C3B`, border-strong `#2F3A4C`, ink `#F3F5F8`, text `#D5DBE5`, muted `#94A0B5`, faint `#6B7689`, primary `#6E95FF`, primary-ink `#8FADFF`, primary-soft `#172443`, primary-border `#2B3F74`; success `#4FD1A5`/`#0F2B23`/`#1E5240`, warning `#F2B35B`/`#2E2110`/`#5C4420`, danger `#F58A91`/`#331418`/`#5E2229`, info `#7EB4F0`/`#132235`/`#234363`, violet `#B29CFF`/`#1F1A3A`/`#3A2F6E`.
- WCAG AA (4.5:1) for all text in both themes. Where a mockup value fails, change only that token, by the smallest step that passes, and note the change in the commit message.
- Shape: no gradients, 1 px borders, radii 6/10/14 px, shadows sm `0 1px 2px` / md `0 4px 16px` / lg `0 16px 40px` (light alpha .06/.08/.14 of `#0E1420`; dark alpha .4/.45/.6 black, md `0 6px 18px`, lg `0 18px 48px`), 4 px spacing scale, 32 px section gap, 20 px card padding, 16 px grid gap.
- Typography: Inter (VitePress's bundled, self-hosted files) for UI and prose; JetBrains Mono Variable for code, IDs, versions, and dates. H1 28/600 at −0.02em, H2 20/600, H3 16/600, UI 14/1.55, labels 12–12.5, prose 15/1.65 with a 72ch maximum line length. Tabular numerals for counts, dates, and table cells; `text-wrap: balance` on headings, `pretty` on paragraphs; Inter `cv11`, `ss01`.
- Scrollbar: 10 px, 3 px inset pill thumb in `--mip-border-strong`, `--mip-faint` on hover, transparent track; Firefox `scrollbar-width: thin` with the same colours.
- Motion: 150–220 ms, `cubic-bezier(.2,.7,.2,1)`; page content fades up 4 px; hover lift 1 px; arrows nudge 3 px; under `prefers-reduced-motion: reduce` all transitions and animations are instant.
- Layout: nav 60 px, sidebar 272 px, aside 232 px. The aside hides below 1280 px and the sidebar becomes a drawer below 960 px (VitePress's breakpoints; the mockup's 900 px is an accepted deviation).
- Icons: Lucide, 1.75 px stroke, 15/18/22 px. Icon-only buttons are for secondary actions only, each with `aria-label`, a tooltip (`title`), and a hit area of at least 36 px (30 px in compact rows). Primary actions keep a label.
- Logos: Simple Icons marks, opt-in through the catalog `logo` slug, unaltered on a neutral tile; the monogram is the fallback; a trademark notice appears on every page.

## Review Focus

- VitePress parses frontmatter dates such as `checked: 2026-11-06` into `Date` objects, so the evidence card must print `2026-11-06`, not a date string. Task 4 tests `formatIsoDate` with a `Date`.
- Labels from the catalog are rendered with `v-html` in the sidebar, so a label containing `&` or `<` must be escaped, not interpreted. Task 5 tests this.
- A near-black brand mark (TikTok, `#000000`) disappears on the dark theme and a near-white mark on the light theme. Task 3 tests the tone rule, and Task 9 checks TikTok's logo in dark mode.
- Most pages have no evidence frontmatter, so the evidence card must render nothing on them, not an empty box. Task 9 checks a TikTok page.
- At 390 px, long sidebar labels with chips must wrap inside the drawer without horizontal scrolling. Task 9 checks `scrollWidth`.

---

### Task 1: Design tokens with an enforced contrast test

**Files:**

- Create: `.vitepress/theme/styles/tokens.css`
- Create: `tests/design-tokens.test.mjs`
- Modify: `.vitepress/theme/index.ts` (import order)

**Interfaces:**

- Produces: CSS custom properties `--mip-bg`, `--mip-surface`, `--mip-surface-2`, `--mip-surface-3`, `--mip-border`, `--mip-border-strong`, `--mip-ink`, `--mip-text`, `--mip-muted`, `--mip-faint` (decoration only), `--mip-faint-text` (AA-safe tertiary text), `--mip-primary`, `--mip-primary-ink`, `--mip-primary-soft`, `--mip-primary-border`, `--mip-on-primary`, `--mip-{success,warning,danger,info,violet}` with `-soft` and `-border` variants, `--mip-radius-sm|--mip-radius|--mip-radius-lg`, `--mip-shadow-sm|--mip-shadow|--mip-shadow-lg`, `--mip-ease`, `--mip-duration-fast` (150ms), `--mip-duration` (220ms), all under `:root` with dark overrides under `.dark`, each colour written as a 6-digit hex literal.

- [ ] **Step 1: Write the failing contrast test.** In `tests/design-tokens.test.mjs`, a test utility reads `tokens.css`, collects `--mip-*: #RRGGBB` declarations from the `:root { … }` block and from the `.dark { … }` block (dark falls back to root), and computes the WCAG contrast ratio. Two tests, `light theme text tokens meet WCAG AA` and `dark theme text tokens meet WCAG AA`, assert a ratio of at least 4.5 for every pair below. On failure, list each failing pair with its ratio.

    ```js
    const pairs = [
      ['ink', 'bg'], ['ink', 'surface'], ['text', 'bg'], ['text', 'surface'],
      ['muted', 'bg'], ['muted', 'surface'], ['muted', 'surface-2'],
      ['faint-text', 'bg'], ['faint-text', 'surface'],
      ['primary', 'bg'], ['primary', 'surface'], ['primary-ink', 'primary-soft'], ['on-primary', 'primary'],
      ['success', 'success-soft'], ['warning', 'warning-soft'], ['danger', 'danger-soft'],
      ['info', 'info-soft'], ['violet', 'violet-soft'],
    ]
    ```

- [ ] **Step 2: Run it and watch it fail.** Run `node --test tests/design-tokens.test.mjs`. Expected: FAIL with ENOENT, because `tokens.css` does not exist.
- [ ] **Step 3: Write `tokens.css` with the mockup values from Global Constraints, plus `--mip-on-primary: #FFFFFF` and `--mip-faint-text: #8B95A7` in light, `--mip-on-primary: #FFFFFF` and `--mip-faint-text: #6B7689` in dark.** Run the test. Expected: FAIL naming the `faint-text` pairs in both themes, `warning/warning-soft` in light, and `on-primary/primary` in dark. This confirms the test catches the mockup's real AA gaps.
- [ ] **Step 4: Adjust only the failing tokens by the smallest step that passes.** Darken light `--mip-faint-text` and light `--mip-warning`, set dark `--mip-on-primary` to `#0C1017`, and adjust dark `--mip-faint-text`. Run `node --test tests/design-tokens.test.mjs`. Expected: PASS.
- [ ] **Step 5: Map VitePress variables onto the tokens in `tokens.css`.**
  - `--vp-c-bg` → bg; `--vp-c-bg-alt` and `--vp-c-bg-elv` → surface; `--vp-c-bg-soft` → surface-2.
  - `--vp-c-text-1` → text; `--vp-c-text-2` → muted; `--vp-c-text-3` → faint-text.
  - `--vp-c-divider` and `--vp-c-gutter` → border; `--vp-c-border` → border-strong.
  - `--vp-c-brand-1` and `--vp-c-brand-3` → primary; `--vp-c-brand-2` → primary-ink; `--vp-c-brand-soft` → primary-soft; `--vp-button-brand-text` → on-primary.
  - `--vp-font-family-mono` → `'JetBrains Mono Variable', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`.
  - Layout: `--vp-nav-height: 60px`.
- [ ] **Step 6: Import the token file.** In `.vitepress/theme/index.ts`, import `@fontsource-variable/jetbrains-mono` (after `npm install @fontsource-variable/jetbrains-mono@5.3.0`), then `./custom.css`, then `./styles/tokens.css`. Remove the `--vp-c-*` and `--vp-font-*` declarations from `custom.css`'s `:root` and `.dark` blocks. Keep its `--ui-*` variables, which the legacy homepage components still use until phase 2.
- [ ] **Step 7: Verify.** Run `npm test` (expect all pass) and `npm run docs:build` (expect `build complete`).
- [ ] **Step 8: Commit.** Stage `tests/design-tokens.test.mjs .vitepress/theme/styles/tokens.css .vitepress/theme/index.ts .vitepress/theme/custom.css package.json package-lock.json` and commit with the message `feat: add mockup design tokens with WCAG AA contrast test`, listing each token changed for AA in the body.

### Task 2: Base layer (typography, scrollbars, focus, motion)

**Files:**

- Create: `.vitepress/theme/styles/base.css`
- Modify: `.vitepress/theme/index.ts` (import after `tokens.css`)

**Interfaces:**

- Consumes: Task 1 tokens.
- Produces: utility classes `.mip-tabular` (tabular numerals) and `.mip-mono` (JetBrains Mono at 12.5 px), keyframes `mip-fade-up`, and a global focus ring (`:focus-visible` outline 2 px `--mip-primary`, 2 px offset).

- [ ] **Step 1: Add the layer.**
  - Body: `font-feature-settings: 'cv11', 'ss01'`.
  - Headings: `text-wrap: balance`, colour ink. Paragraphs: `text-wrap: pretty`.
  - Scrollbars: rules on `*`, `*::-webkit-scrollbar*` per Global Constraints, including the Firefox `scrollbar-color`.
  - Selection colour: primary-soft.
  - Motion: `.vp-doc > div` runs `mip-fade-up` (opacity 0→1, translateY 4px→0, 220ms, `--mip-ease`) on insertion.
  - Reduced motion: a `@media (prefers-reduced-motion: reduce)` block setting `animation-duration: .01ms !important; transition-duration: .01ms !important; animation-iteration-count: 1 !important` on `*, ::before, ::after`.
- [ ] **Step 2: Verify.** Run `npm run docs:build`. Expected: `build complete`. Browser checks happen in Task 9.
- [ ] **Step 3: Commit.** Run `git add .vitepress/theme/styles/base.css .vitepress/theme/index.ts` and commit with `feat: add base typography, custom scrollbars, focus ring, and motion layer`.

### Task 3: Catalog logos, build sequence, and sidebar pages

**Files:**

- Modify: `scripts/catalog-data.mjs` (`buildMarketplaces`, `loadCatalogData`, new `logoTone`)
- Modify: `catalog/marketplaces.yaml`, `templates/marketplace.yaml`, `CONTRIBUTING.md`, `README.md` ("Add a marketplace" steps)
- Test: `tests/catalog-data.test.mjs`

**Interfaces:**

- Consumes: catalog fields `logo` (Simple Icons slug, optional), `build_sequence` and `pages` (optional lists of `{ label, href }`).
- Produces: marketplace records gain:
  - `slug: string`
  - `logo: { title: string, hex: string, path: string, tone: 'dark' | 'bright' | 'mid' } | null`
  - `buildSequence: { label: string, href: string }[]` and `pages: { label: string, href: string }[]`

  Also new export `logoTone(hex: string): 'dark' | 'bright' | 'mid'`. `loadCatalogData` validates `buildSequence` and `pages` hrefs with `findMissingRoutes`.

- [ ] **Step 1: Write failing tests:**
  - `a catalog logo slug resolves to its Simple Icons mark`: `marketplaceRecord({ logo: 'amazon' })` gives `logo.title === 'Amazon'`, `/^M/.test(logo.path)`, and `/^[0-9A-F]{6}$/.test(logo.hex)`.
  - `an unknown logo slug is rejected with the catalog id`: the error matches `/ebay-sell-api.*logo "not-a-brand"/`.
  - `a marketplace without a logo keeps the monogram`: `logo === null` and `mark === 'e'`.
  - `logo tone flags near-black and near-white brand colours`: `logoTone('000000') === 'dark'`, `logoTone('FFFFFF') === 'bright'`, `logoTone('FF9900') === 'mid'`.
  - `build sequence entries need a label and a link`: a `build_sequence` item without `label` throws `/ebay-sell-api.*build_sequence/`.
  - `loading the catalog fails when a sidebar page links to a missing page`: a temp root whose catalog lists `pages: [{ label: 'Orders', href: '/marketplaces/ebay/apis/missing' }]` throws `/\/marketplaces\/ebay\/apis\/missing/`.
- [ ] **Step 2: Run the tests.** Run `npm test`. Expected: the six new tests FAIL; the rest pass.
- [ ] **Step 3: Implement.** Run `npm install simple-icons@16.37.0`.
  - Resolve slugs with `Object.values(simpleIcons).find((icon) => icon.slug === slug)`.
  - `logoTone` uses WCAG relative luminance: below 0.1 is `dark`, above 0.8 is `bright`, anything else is `mid`.
  - Validate list items: each needs a non-empty `label` and an `href` starting with `/`. Report errors with the catalog id and field name.
- [ ] **Step 4: Run the tests.** Run `npm test`. Expected: all pass.
- [ ] **Step 5: Add the catalog data:**
  - Amazon: `logo: amazon`; `build_sequence` with the six current sidebar steps and labels (API directory and map, Connect a seller account, Migrate active listings, Development guide, Order synchronization, Seller-fulfilled listings); `pages` with the eleven current non-step Amazon sidebar entries, ending with Changelog.
  - TikTok Shop: `logo: tiktok` and `pages` with its ten current sidebar entries.
  - Document the three optional fields in `templates/marketplace.yaml`.
- [ ] **Step 6: Update the docs.**
  - `CONTRIBUTING.md` (decision 8): the provider-assets rule now allows an unaltered marketplace logo from Simple Icons, referenced through the catalog `logo` field and used only to identify that marketplace.
  - `README.md` "Add a marketplace": step 4 becomes "add `build_sequence` and `pages` to the catalog entry, and optionally a `logo`".
- [ ] **Step 7: Verify.** Run `npm test` and `npm run docs:build`. Expected: both pass.
- [ ] **Step 8: Commit.** Run `git add scripts/catalog-data.mjs tests/catalog-data.test.mjs catalog/marketplaces.yaml templates/marketplace.yaml CONTRIBUTING.md README.md package.json package-lock.json` and commit with `feat: add catalog logos, build sequence, and sidebar pages`.

### Task 4: Frontmatter reader and date formatting

**Files:**

- Modify: `scripts/catalog-data.mjs` (add `readFrontmatter`)
- Create: `scripts/format-date.mjs` (browser-safe, no Node imports)
- Test: `tests/catalog-data.test.mjs`, `tests/format-date.test.mjs`

**Interfaces:**

- Produces:
  - `readFrontmatter(root: string, route: string): Record<string, unknown>`, which resolves routes like `findMissingRoutes` and returns `{}` when the page has no frontmatter.
  - `formatIsoDate(value: Date | string | undefined | null): string`.

- [ ] **Step 1: Write the failing tests:**
  - `frontmatter is read from the page a route points to`: a temp page with `---\nversion: 2026-01-01\nchecked: 2026-11-06\n---` gives `version === '2026-01-01'`.
  - `a page without frontmatter yields an empty object`: `deepEqual(…, {})`.
  - `formatIsoDate prints YYYY-MM-DD for Date objects`: `formatIsoDate(new Date('2026-11-06T00:00:00Z')) === '2026-11-06'`.
  - `formatIsoDate passes date strings through and blanks missing values`: `'2026-11-06'` is returned unchanged; `undefined` and `''` both return `''`.
- [ ] **Step 2: Run the tests.** Run `npm test`. Expected: the four new tests FAIL.
- [ ] **Step 3: Implement.** `readFrontmatter` parses the leading `---` block with `yaml`'s `parse`, which keeps `2026-01-01` as a string. `formatIsoDate` uses `toISOString().slice(0, 10)` for `Date` values.
- [ ] **Step 4: Run the tests.** Run `npm test`. Expected: all pass.
- [ ] **Step 5: Commit.** Run `git add scripts/catalog-data.mjs scripts/format-date.mjs tests/catalog-data.test.mjs tests/format-date.test.mjs` and commit with `feat: read page frontmatter and format evidence dates`.

### Task 5: Catalog-driven sidebar and site config

**Files:**

- Create: `scripts/sidebar.mjs`
- Test: `tests/sidebar.test.mjs`
- Modify: `.vitepress/config.ts`

**Interfaces:**

- Consumes: Task 3 marketplace records, Task 4 `readFrontmatter`.
- Produces: `buildSidebar({ marketplaces, versionOf, docs }): Record<string, SidebarGroup[]>`, where:
  - `versionOf(href: string): string | undefined`
  - `docs: { label: string, href: string }[]`

  It returns keys `/marketplaces/<slug>/`, `/marketplaces/`, and `/docs/`. Every key's first group is Overview: Home (`/`), Marketplace directory with `<span class="mip-count">N</span>`, and Engineering docs (`docs[0].href`).
  - Marketplace keys add a group titled with the logo tile (`<span class="mip-logo" data-tone="…" style="--mip-logo-color:#HEX">` wrapping an SVG of `logo.path`, or `<span class="mip-logo mip-logo--mono">m</span>`), the escaped name, and `<span class="mip-badge mip-badge--<status>">Label</span>`. Its items are Overview, then the build sequence as `<span class="mip-step">n</span>label`.
  - A further "APIs & guides" group lists `pages`, adding `<span class="mip-chip">version</span>` when `versionOf` returns one.
  - The `/marketplaces/` key lists every marketplace with logo, name, and badge. The `/docs/` key lists `docs`.

- [ ] **Step 1: Write the failing tests in `tests/sidebar.test.mjs`, using `buildMarketplaces` records:**
  - `a build sequence becomes numbered steps in catalog order`
  - `a version chip appears only when the page declares a version`
  - `the marketplace group title carries the logo, name, and status badge`
  - `a marketplace without a logo shows its monogram`
  - `labels are HTML-escaped`: the label `Rate limits & <quotas>` renders `Rate limits &amp; &lt;quotas&gt;`.
  - `the directory count matches the catalog`
  - `each marketplace gets a sidebar keyed by its route`
- [ ] **Step 2: Run the tests.** Run `npm test`. Expected: the new tests FAIL with a missing-module error, then with assertion failures once a stub exports `buildSidebar`.
- [ ] **Step 3: Implement `buildSidebar`** with a local `escapeHtml` for `& < > "`.
- [ ] **Step 4: Run the tests.** Run `npm test`. Expected: all pass.
- [ ] **Step 5: Wire it into `.vitepress/config.ts`.**
  - Sidebar: `sidebar: buildSidebar({ marketplaces: loadCatalogData(repositoryRoot).marketplaces, versionOf: (href) => readFrontmatter(repositoryRoot, href).version, docs })`. `docs` is the six current Engineering links. The config throws if `findMissingRoutes(repositoryRoot, docs.map((doc) => doc.href))` returns anything.
  - Nav: Directory (`/marketplaces/`) plus the Engineering dropdown. Remove the Amazon dropdown, since the sidebar carries marketplace navigation.
  - Phase 1 links only to pages that exist. Test reports, Limits & quotas, and Development guidelines join the nav and the Overview group in phase 5, when their pages are built.
  - Search: `options.translations.button.buttonText: 'Search marketplaces, APIs, workflows…'` and `buttonAriaLabel: 'Search the playbook'`.
  - `markdown.theme: { light: 'github-dark', dark: 'github-dark' }`.
  - `themeConfig.logo: '/brand-mark.svg'`, with a new `public/brand-mark.svg`: a 30 px primary rounded square with a white Lucide "layers" glyph.
  - `themeConfig.buildDate: new Date().toISOString().slice(0, 10)`.
  - `footer.message`: "Marketplace names and logos are trademarks of their respective owners. This is an independent resource; no endorsement is implied."
- [ ] **Step 6: Verify.** Run `npm test` and `npm run docs:build`. Expected: pass. `grep -c "mip-step" .vitepress/dist/marketplaces/amazon/apis/orders.html` is at least 6.
- [ ] **Step 7: Commit.** Run `git add scripts/sidebar.mjs tests/sidebar.test.mjs .vitepress/config.ts public/brand-mark.svg` and commit with `feat: generate the sidebar from catalog data`.

### Task 6: Shell components

**Files:**

- Create: `.vitepress/theme/Layout.vue`, `.vitepress/theme/components/BuildPill.vue`, `.vitepress/theme/components/EvidenceCard.vue`, `.vitepress/theme/components/TrademarkNote.vue`
- Modify: `.vitepress/theme/index.ts` (`Layout`)

**Interfaces:**

- Consumes: `useData()` (`theme.buildDate`, `frontmatter`, `page.relativePath`), `formatIsoDate`, Lucide components (`Activity`, `ShieldCheck`, `SquarePen`).
- Produces: `Layout.vue` wraps `DefaultTheme.Layout` and fills these slots:
  - `nav-bar-title-after`: `<span class="mip-brand-subtitle">Developer handbook</span>`
  - `nav-bar-content-after`: `BuildPill`
  - `aside-outline-after`: `EvidenceCard`
  - `doc-footer-before`: `TrademarkNote`

- [ ] **Step 1: Implement the components.**
  - Run `npm install lucide-vue-next@1.0.0`.
  - `BuildPill` renders "Docs build · {buildDate}" with a status dot, in mono and tabular numerals, and is hidden below 1180 px.
  - `EvidenceCard` (root element class `mip-evidence`) renders only when `frontmatter.evidence_status` or `frontmatter.checked` exists. It shows an "Evidence" title, the `evidence_status` text, and "Checked {formatIsoDate(checked)}". The edit action is an icon-only button (`SquarePen`, `aria-label="Edit this page on GitHub"`, `title` set to the same) linking to `https://github.com/muhammadrakib2299/Marketplace-integration-playbook/edit/main/{relativePath}`.
- [ ] **Step 2: Verify.** Run `npm run docs:build`. Expected: pass. `.vitepress/dist/marketplaces/amazon/apis/orders.html` contains `Checked 2026-11-06`, and `.vitepress/dist/marketplaces/tiktok-shop/apis/products.html` does not contain `mip-evidence`.
- [ ] **Step 3: Commit.** Run `git add .vitepress/theme/Layout.vue .vitepress/theme/components/BuildPill.vue .vitepress/theme/components/EvidenceCard.vue .vitepress/theme/components/TrademarkNote.vue .vitepress/theme/index.ts package.json package-lock.json` and commit with `feat: add shell slots for build date, evidence card, and trademark note`.

### Task 7: Shell styles

**Files:**

- Create: `.vitepress/theme/styles/shell.css` (imported after `base.css`)
- Modify: `.vitepress/theme/custom.css` (delete superseded `.VPNav*`, `.VPSidebar*`, and `DocSearch` rules)

**Interfaces:**

- Consumes: tokens, and the class names produced by Tasks 5 and 6.

- [ ] **Step 1: Style the shell from the mockup's app-shell rules:**
  - **Nav bar:** surface background, bottom border, 60 px height. Brand: 30 px mark, 15/600 title, uppercase 11 px subtitle in faint-text. Links: 8 px × 10 px padding, 8 px radius, active state in primary-soft.
  - **Search button:** a 38 px field, 460 px maximum width, bg fill, border, faint-text placeholder, `kbd` keys.
  - **Sidebar:**
    - Group titles: uppercase 11/600, +0.08em tracking, faint-text.
    - Items: 8 × 10 px padding, 8 px radius, hover surface-2; active item gets primary-soft, primary-ink, and a primary-border border.
    - Chips: `.mip-count` as a pill, `.mip-chip` in mono 10.5 px, `.mip-step` as a 20 px circle that turns primary on the active item.
    - `.mip-logo`: a 22 px tile, 6 px radius, surface-2 background, SVG filled with `--mip-logo-color`. `data-tone="dark"` switches to ink under `.dark`; `data-tone="bright"` switches to ink in light.
    - `.mip-badge--*`: 22 px pills using the status tokens.
  - **Aside:** "On this page" in uppercase 11 px; links with a 2 px left border that turns primary when active; `.mip-evidence` as a card with 12 px padding.
  - **Search modal:** 640 px wide, 14 px radius, lg shadow; the selected result uses primary-soft.
  - **Mobile:** the nav screen and drawer use surface and border.
- [ ] **Step 2: Verify the cleanup.** Run `grep -nE "\.VPNav|\.VPSidebar|DocSearch|\.VPLocalSearch" .vitepress/theme/custom.css`. Expected: no output. Then run `npm run docs:build`. Expected: pass.
- [ ] **Step 3: Commit.** Run `git add .vitepress/theme/styles/shell.css .vitepress/theme/index.ts .vitepress/theme/custom.css` and commit with `feat: restyle top bar, sidebar, aside, and search to the mockup shell`.

### Task 8: Article styles

**Files:**

- Create: `.vitepress/theme/styles/content.css` (imported last)
- Modify: `.vitepress/theme/custom.css` (delete superseded `.VPDoc`, `.vp-doc`, and `.custom-block` rules)

- [ ] **Step 1: Style article content:**
  - **Container:** content container maximum 880 px. `p`, `ul`, `ol`, and `blockquote` cap at 72ch; tables and code use the full width.
  - **Headings:** H1–H3 per Global Constraints, with H2 at 40 px top and 12 px bottom margin. Prose 15/1.65.
  - **Links:** primary, underline on hover.
  - **Inline code:** surface-2 with a border, 12.5 px mono.
  - **Tables:** 1 px border and 10 px radius. `th` in surface-2, uppercase 11.5/600 with +0.05em tracking. Cells 10–11 px × 12 px; row hover surface-2; tabular numerals.
  - **Code blocks:** `#0F1520` background, `#1F2838` border, 10 px radius, `#121A27` header strip for the language label, icon-only copy button. Same in both themes.
  - **Callouts:** `.custom-block.info|tip|warning|danger` get a 3 px left border in the status colour on its soft background, 10 px radius, and the title in ink.
  - **Footer:** prev/next links as cards with border and hover lift; edit link in muted.
- [ ] **Step 2: Verify the cleanup.** Run `grep -nE "\.VPDoc|\.vp-doc|\.custom-block" .vitepress/theme/custom.css`. Expected: no output. Then run `npm run docs:build`. Expected: pass.
- [ ] **Step 3: Commit.** Run `git add .vitepress/theme/styles/content.css .vitepress/theme/index.ts .vitepress/theme/custom.css` and commit with `feat: restyle article typography, tables, code, and callouts`.

### Task 9: Browser verification across viewports and themes

**Files:**

- Modify: only as needed to fix issues found. Each fix is its own commit naming the check it fixes.

- [ ] **Step 1: Serve the build.** Run `npm run docs:build`, then `npx vitepress preview . --port 4173` in the background.
- [ ] **Step 2: At 1440 × 900 in light mode, check each page with Playwright.** Pages: `/marketplaces/amazon/apis/orders`, `/marketplaces/amazon/`, `/marketplaces/tiktok-shop/apis/products`, and `/marketplaces/`.
  - `.VPNavBar` height is `60px`.
  - `body` font family includes `Inter`; `.vp-doc pre code` includes `JetBrains Mono`.
  - `html` has `scrollbarWidth === 'thin'`.
  - The active sidebar item's background is `rgb(232, 238, 252)`.
  - Orders shows six `.mip-step` items, a `2026-01-01` chip, and `.mip-evidence` with `Checked 2026-11-06`.
  - TikTok Products has no `.mip-evidence`.
- [ ] **Step 3: Repeat in dark mode** (`document.documentElement.classList.add('dark')`). The body background is `rgb(12, 16, 23)`. Screenshot the TikTok page to confirm its logo is visible.
- [ ] **Step 4: At 390 × 844, check overflow.** On each page, `document.documentElement.scrollWidth <= 390`. Open the drawer and screenshot it.
- [ ] **Step 5: Check reduced motion.** Emulate `prefers-reduced-motion: reduce`; the computed `animation-duration` of `.vp-doc > div` is at most `0.01ms`.
- [ ] **Step 6: Keyboard check.** Tab from the page top through the nav. Every icon-only control shows the focus ring and has an accessible name.
- [ ] **Step 7: Compare with the mockup.** Screenshot the orders page at 1440 light and dark, and compare them with mockup previews `03-api-dossier.png` and `04-dark-mode.png` for shell fidelity: top bar, sidebar, aside, typography, tables.
- [ ] **Step 8: Run the full verification.** Run `npm test`, `npm run docs:build`, and `npx markdownlint-cli2@0.24.0 "**/*.md" ".github/**/*.md" "#node_modules"`, gating each on its exit code. Push `dev` and confirm all four CI jobs pass and the Vercel preview builds.
