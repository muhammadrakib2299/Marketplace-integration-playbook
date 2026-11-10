# UI redesign to the enterprise mockup: design spec

**Status:** draft for owner review · **Date:** 2026-11-10 · **Branch:** `dev`

**Input:** the owner-supplied HTML mockup (`index.html` plus five previews: home, marketplace hub, API dossier, dark mode, phone workflow). The mockup is kept outside this repository.

## 1. Goal

Restyle every page of the playbook site to the mockup's design system and page structures, without publishing anything this repository cannot evidence.

Success means:

- Every public page uses the new tokens, shell, and components, in light and dark mode, from 320 px phones to wide desktops.
- Every number, badge, status, and date on screen is derived from the catalog or the docs at build time.
- Pages with no evidence yet (test reports, unmeasured limits) show an honest empty state instead of sample content.
- Markdown stays the content source; local search, static output, and the Vercel deployment keep working.

## 2. Decisions already made

| Decision | Source |
|---|---|
| **Real data only.** Mockup sample data (36 marketplaces, "42 test reports · 38 passed", "Sandbox tested · run #42", rate limits, capability grid) is not published. | Owner, 2026-11-10 |
| Empty states, not hidden sections, where no evidence exists yet. | Owner, 2026-11-10 (option 1) |
| Work lands on `dev`, one focused commit per change, CI green before reporting. | Owner, 2026-11-10 |
| Custom scrollbars, modern section layouts, deliberate typography, modern icons on buttons in place of text, real marketplace logos or icons, and a little animation. | Owner, 2026-11-10 (follow-up request) |

## 3. Constraints

- The evidence vocabulary stays as defined in [lifecycle and status](../../lifecycle-and-status.md): Tested, Documented, Research, Blocked, Deprecated; claims labelled Official, Tested, or Unverified.
- No status reads "Tested" and no test count appears unless a recorded run exists.
- Accessibility: keyboard navigation, visible focus, WCAG AA contrast in both themes, and `prefers-reduced-motion` respected.
- Pages without diagrams or interactive widgets must not load their JavaScript.

## 4. Approaches considered

| Approach | Summary | Trade-offs |
|---|---|---|
| **A. Extend the VitePress default theme (recommended)** | Map the mockup tokens onto VitePress variables, restyle its nav, sidebar, outline, and search, and add Vue components through layout slots and Markdown. | Keeps Markdown authoring, local search, outline, mobile drawer, dark mode, and the current deploy. Some shell details are bounded by VitePress's DOM, and CSS overrides depend on its class names (mitigated by the pinned `vitepress` version). |
| B. Custom VitePress layout | Replace the default theme with our own `Layout.vue`. | Pixel-exact shell, but sidebar, nav, outline, search UI, drawer, and accessibility all have to be rebuilt and maintained. |
| C. Move to another framework | Rebuild on Next.js or Astro. | Full freedom, but rewrites the content pipeline, search, and deployment for no user-visible gain. |

The mockup's shell (top bar, 272 px sidebar, content column, 232 px right rail, Ctrl+K search, theme toggle) maps almost one-to-one onto VitePress's default layout, so approach A delivers the design with the least new code.

## 5. Design

### 5.1 Design tokens and typography

- Mockup tokens become CSS custom properties (`--mip-bg`, `--mip-surface`, `--mip-border`, `--mip-ink`, `--mip-text`, `--mip-muted`, `--mip-primary`, and the success, warning, danger, info, and violet families with their soft and border variants), with dark values under `.dark`.
- VitePress variables (`--vp-c-brand-*`, `--vp-c-bg*`, `--vp-c-text-*`, `--vp-c-divider`) are pointed at those tokens, so default-theme components inherit the palette.
- Flat surfaces only: no gradients, 1 px borders, three shadow levels, radii 6, 10, and 14 px, 4 px spacing scale.
- Custom scrollbar everywhere that scrolls (page, sidebar, outline, code blocks, wide tables, search results): 10 px track, 3 px inset pill thumb in `--mip-border-strong`, darkening on hover, transparent track; Firefox gets `scrollbar-width: thin` with the same colours. Both themes are covered.

#### Typography

- **Families:** Inter (variable) for UI and prose; JetBrains Mono for code, operation IDs, versions, and dates. Both are self-hosted (decision 2).
- **Scale:** H1 28/600 with −0.02em tracking, H2 20/600, H3 16/600, UI text 14/1.55, captions and labels 12–12.5. The home hero H1 is fluid, `clamp(28px, 4vw, 34px)`.
- **Prose:** long-form articles use 15/1.65 with a 72-character maximum line length (decision 5). Headings carry more space above than below, so each section reads as one block.
- **Details:** tabular numerals (`font-variant-numeric: tabular-nums`) for stats, counts, dates, and table columns. `text-wrap: balance` on headings and `text-wrap: pretty` on paragraphs where supported. Inter's disambiguation alternates (`cv11`, `ss01`) keep IDs such as `l`, `I`, and `1` distinct. Uppercase labels and eyebrows use +0.06–0.08em tracking at 11–11.5 px.

#### Section patterns

Every page is built from a small set of section patterns from the mockup:

- **Section header:** optional eyebrow, title, one-line description, and an optional action aligned right.
- **Split hero:** message on the left, live coverage snapshot on the right.
- **Stat grids:** bento-style cards with icon, label, value, and a short delta line.
- **Card lists:** journey cards, marketplace cards, and list rows with a type badge and a monospace date.
- **Sticky filter toolbar** for long lists.
- **Callouts** for info, success, warning, and danger.

Sections are separated by 32 px. Cards use 20 px padding and 16 px grid gaps.

### 5.1a Icons and buttons

- Icons come from Lucide (decision 3) at a 24 px grid with 1.75 px strokes, sized 15, 18, or 22 px.
- **Icon-only buttons** with a tooltip and an `aria-label` handle secondary and utility actions: copy code, open official docs, edit on GitHub, theme toggle, GitHub, grid/table view, clear filters, close, and expand or collapse.
- **Primary actions** keep a short label beside the icon, such as "Start with Amazon SP-API" or "Open API catalog". An icon alone does not say where a primary action goes, and screen-reader users need the label (decision 9).
- Every icon-only control has a visible focus ring and a minimum 36 px hit area (30 px for compact table actions).

### 5.1b Marketplace logos

- Marketplace marks use the official brand icons from the Simple Icons set (`simple-icons`, CC0-1.0; Amazon and TikTok are both available). They render unaltered, in the brand's own colour or monochrome, on a neutral tile.
- Marketplaces without an available icon keep the neutral monogram tile. The catalog gains an optional `logo` field naming the Simple Icons slug, so no marketplace is mapped to a logo by guesswork.
- A footer line states that marketplace names and logos are trademarks of their owners and that their use does not imply endorsement, matching the site's existing independence disclaimer.
- This conflicts with the current rule in `CONTRIBUTING.md` against provider assets without redistribution permission. Shipping logos requires the owner to accept nominative logo use and amend that rule, or to keep monograms (decision 8).

### 5.1c Motion

- **Timing:** 150–220 ms with the mockup's `cubic-bezier(.2,.7,.2,1)` easing; nothing loops and nothing moves without a user action, except the one-time entrance below.
- **Entrance:** page content fades up 4 px on navigation; card grids stagger in 40 ms steps, capped at 8 cards.
- **Hover and focus:** cards lift 1 px with a stronger border and shadow; arrow icons in links nudge 3 px; buttons darken; focus rings fade in.
- **State changes:** the tab indicator slides between tabs, the search palette and dialogs scale in from 98 %, toasts slide up, and grid/table view switches cross-fade.
- **Reduced motion:** under `prefers-reduced-motion: reduce` every transition and animation drops to an instant change.

### 5.2 App shell (every page)

- **Top bar:** brand mark, "Marketplace Integration Playbook" with a "Developer handbook" subtitle, the search trigger styled as the mockup's search field with a Ctrl/⌘ K hint, links to Directory, Test reports, and Guidelines, a "Docs build · YYYY-MM-DD" pill stamped with the UTC build date, the theme toggle, and the GitHub link. There is no version label, because the project has no release version to show.
- **Sidebar:** generated from catalog data in `.vitepress/config.ts`:
  - Overview: Home, Marketplace directory with the marketplace count, Test reports with the recorded-run count, Limits & quotas, and Development guidelines.
  - One group per marketplace, with its status badge. A marketplace with a `build_sequence` in the catalog shows those pages as numbered steps with step dots (Amazon's six steps today). Without one, its pages are listed unnumbered (TikTok Shop today).
  - API dossiers, with a version chip only when the page declares `version` in frontmatter.
- **Right rail:** VitePress's "On this page" outline, restyled, plus an Evidence card built from page frontmatter (`evidence_status`, `checked`) and an "Edit on GitHub" link. The card renders only on pages that declare evidence fields.
- **Search:** VitePress local search, restyled as the mockup's command palette. No second search index.
- **Responsive:** the right rail hides below 1280 px, card grids reflow at 1100 px, and the sidebar becomes VitePress's drawer below 900 px.

### 5.3 Pages

| Page | Mockup structure | Real data source | Empty or partial state |
|---|---|---|---|
| Home | Hero, coverage snapshot, four-step build sequence, browse by region, recently updated, deprecation watch, coverage callout | Snapshot cards: marketplaces (with region count), API surfaces in the catalog, operation-level dossiers, and recorded test runs. Status bars: catalog status counts. Lists: changelog entries and catalog `deprecations` | Status bars and the test-run card show real counts, including zeros |
| Marketplace directory | Region tabs, toolbar filters, grid and table toggle, status legend, warning callout | `catalog/marketplaces.yaml` | "No marketplaces match these filters" |
| Marketplace hub (`/marketplaces/<slug>/`) | Header with logo, badges, and actions; KPI cards; tabs for Overview, API catalog, Workflows, Guides, Limits & access, and Changelog | KPI cards: API surfaces in the catalog, operation-level dossiers, regions, and recorded test runs ("None recorded" at zero). Tabs: catalog entry, `catalog/guides.yaml`, page frontmatter, `catalog/limits.yaml`, parsed `changelog.md` | Tabs with no entries show an empty state naming what is missing |
| API dossier | Breadcrumbs, badges (dossier, version, evidence, checked), KPI cards, operation tables with method chips, code tabs, references | Page frontmatter and Markdown | Header shows only declared fields; "Test cases" shows "No test runs recorded" |
| Workflow | Header badges, rendered data-flow diagram, numbered steps, verification record | Markdown and `mermaid` blocks | Verification record shows "No test runs recorded" |
| Guides and repository docs | Article layout with callouts and evidence card | Markdown | n/a |
| Test reports (new) | Result tiles, latest run, run table | Recorded runs in `evidence/test-runs/` (none yet) | Explains that no run is recorded and how a run would be recorded |
| Limits & quotas (new) | Cross-marketplace comparison matrix | `catalog/limits.yaml`, holding only facts already stated in the docs, each with its source page | Cells without a sourced fact read "Not documented yet" |
| Development guidelines (new `docs/guidelines.md`) | Checklist cards labelled Official, Recommended, or Unverified | Existing integration principles, lifecycle, and contribution checklists. Items are labelled Recommended unless their source page cites an official provider requirement | n/a |
| UI kit (new, optional) | Tokens, type scale, components, icons | The theme itself | n/a |

Mockup elements that have no real backing are replaced, not faked:

- "Add a marketplace" links to the README section and the contribution guide instead of opening a session-only dialog.
- "Export catalog.yaml" links to the catalog file on GitHub.
- "Pinned marketplaces" is dropped, because the site keeps no user state.

### 5.4 Data layer

All derivations live in `scripts/catalog-data.mjs`, are unit-tested first, and fail the build on invalid input.

| Value | Derivation |
|---|---|
| Marketplace count, regions, status counts | `catalog/marketplaces.yaml` |
| API surfaces | Count of catalog `api_surfaces` entries (12 today) |
| API reference pages, workflow guides | Existing `countCoverage` (16 and 3 today) |
| Operation-level dossiers | Pages whose frontmatter declares `api` (5 today) |
| Recently updated | Entries parsed from `marketplaces/*/changelog.md`, newest first |
| Deprecation watch | New optional `deprecations` list on catalog entries: title, date or "Announced", source page; starts with Amazon Orders API v0 (removal 2027-03-27) |
| Test runs | New `evidence/test-runs/*.yaml` folder; zero files today, so every test count is 0 |
| Build sequence | New optional `build_sequence` list of page routes on catalog entries; Amazon's six steps move here from `.vitepress/config.ts` |
| Limits matrix | New `catalog/limits.yaml`: per marketplace and dimension (authorization model, rate-limit model, pagination, sandbox, event delivery), a value plus the docs page that states it |
| Marketplace logo | New optional `logo` field naming a Simple Icons slug; absent means the monogram tile |
| Build date | Generation time (UTC) |

Phase 4 adds frontmatter (`api`, `version`, `checked`, `evidence_status`) to dossier pages that lack it, using only values already stated in each page or in the catalog.

### 5.5 Components

New or rewritten Vue components in `.vitepress/theme/components/`:

- `Badge`, `StatusBadge`, `StatCard`, `Callout`, `EmptyState`, `PageHeader`, `EvidenceCard`, `BuildPill`
- `HomeDashboard` (replaces `PlaybookHome`), `MarketplaceDirectory` (rewritten), `MarketplaceHub`
- `RecentUpdates`, `DeprecationWatch`, `TestReports`, `LimitsMatrix`
- `MermaidDiagram`, which renders `mermaid` code blocks on the client and is lazy-loaded only on pages that contain diagrams. This fixes the diagrams that currently show as raw code on three pages.

VitePress custom containers (`::: info`, `::: warning`, `::: danger`, `::: tip`) are styled as mockup callouts. A small Markdown rule turns inline code that is exactly an HTTP method (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) into a method chip.

The homepage explorer (`PlaybookExplorer`) is retired because the mockup's home has no explorer. Its data, `catalog/guides.yaml`, now feeds the hub Workflows and Guides tabs, and every guide stays reachable through the sidebar and Ctrl/⌘ K search (decision 6).

### 5.6 Delivery phases

Each phase gets its own implementation plan, written when the previous phase lands, starting with phase 1. Each phase is a series of focused commits on `dev`, pushed with CI green and checked on the Vercel preview:

1. **Design system and shell:** tokens, fonts, icons, top bar, sidebar, right rail and evidence card, search palette, article typography, tables, code blocks, callouts, scrollbar, drawer.
2. **Home and directory.**
3. **Marketplace hubs** for Amazon and TikTok Shop.
4. **Dossier and workflow templates:** frontmatter, page headers, method chips, code tabs, Mermaid rendering.
5. **New pages:** test reports, limits and quotas, guidelines, and the optional UI kit.

### 5.7 Testing and verification

- **Unit tests first** (TDD) for every derivation: status counts, changelog parsing, deprecation and limits validation, sidebar generation, frontmatter extraction, and test-run counting.
- **Build:** `npm run docs:build` must pass; VitePress fails on dead internal links, and the generator fails on invalid catalog data.
- **Lint and links:** markdownlint locally; markdownlint and lychee in CI on `dev`.
- **Visual check:** Playwright screenshots of home, directory, a hub, a dossier, and a workflow at 1440, 1024, and 390 px in light and dark mode, compared side by side with the mockup previews.
- **Accessibility:** keyboard pass through nav, sidebar, tabs, and search; contrast checked for both token sets.

### 5.8 Out of scope

Sample marketplaces, numbers, and test runs; the live "Add a marketplace" dialog; per-user pinned items; new marketplaces or new content claims. Content changes are limited to frontmatter and data restating facts already present in the docs, plus the `CONTRIBUTING.md` logo amendment if decision 8 is accepted.

### 5.9 Risks

| Risk | Mitigation |
|---|---|
| VitePress internal class names change on upgrade | `vitepress` stays pinned; overrides grouped in one stylesheet section with a comment naming the targeted component |
| Mermaid adds a large bundle | Dynamic import inside `MermaidDiagram`, only on pages with diagrams |
| 14 px UI text is small for long articles | Prose at 15 px (decision 5) |
| Sidebar chips rendered as HTML in item text | Text is generated from our own catalog data, never from user input |
| Brand owners object to logo use, or Simple Icons removes a mark | Logos are opt-in per catalog entry through the `logo` field and fall back to the monogram tile; removing one is a one-line catalog change |
| Icon-only buttons are ambiguous | Icon-only is limited to well-known utility actions, each with a tooltip and accessible name; primary actions keep labels |

## 6. Decisions for review

Defaults are listed first and will be used unless changed.

1. **Approach:** A, extending the VitePress default theme. Alternatives are B or C (section 4).
2. **Fonts:** self-host Inter and JetBrains Mono through `@fontsource` packages, with no third-party font requests. Alternatives are Google Fonts or system fonts only.
3. **Icons:** the `lucide-vue-next` package, the icon family the mockup imitates. The alternative is extending the hand-written `UiIcon` component.
4. **Diagrams:** the `mermaid` package behind a lazy-loaded client component.
5. **Article text size:** 15 px for long-form prose and 14 px for UI. The alternative is 14 px everywhere, as in the mockup.
6. **Homepage explorer:** retire it; guides surface in hub tabs, sidebar, and search. The alternative keeps it below the new home sections.
7. **UI kit page:** include it as an internal reference page in phase 5. The alternative is to skip it.
8. **Marketplace logos:** use the official Amazon and TikTok marks from Simple Icons with a trademark notice, and amend the `CONTRIBUTING.md` provider-assets rule to allow unaltered logos used only to identify a marketplace. The alternative keeps the neutral monogram tiles.
9. **Icon-only buttons:** icon-only for secondary and utility actions, with an icon plus a short label for primary actions (section 5.1a). The alternative makes every action icon-only with tooltips.
