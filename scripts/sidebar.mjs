// Builds the VitePress sidebar from catalog marketplace records (spec 5.2).
// VitePress renders sidebar text with v-html, so every catalog value is escaped here.

const htmlEscapes = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }
const escapeHtml = (value) => String(value).replace(/[&<>"]/g, (character) => htmlEscapes[character])

const statusName = (status) => `${status.charAt(0).toUpperCase()}${status.slice(1)}`

function logoTile(marketplace) {
  if (!marketplace.logo) {
    return `<span class="mip-logo mip-logo--mono" aria-hidden="true">${escapeHtml(marketplace.mark)}</span>`
  }
  const { hex, path, tone } = marketplace.logo
  return (
    `<span class="mip-logo" data-tone="${escapeHtml(tone)}" style="--mip-logo-color:#${escapeHtml(hex)}" aria-hidden="true">` +
    `<svg viewBox="0 0 24 24" focusable="false"><path d="${escapeHtml(path)}"/></svg></span>`
  )
}

function marketplaceTitle(marketplace) {
  const status = escapeHtml(marketplace.status)
  return (
    `${logoTile(marketplace)}<span class="mip-group-name">${escapeHtml(marketplace.name)}</span>` +
    `<span class="mip-badge mip-badge--${status}">${statusName(status)}</span>`
  )
}

function overviewGroup(marketplaces, docs) {
  return {
    text: 'Overview',
    items: [
      { text: 'Home', link: '/' },
      { text: `Marketplace directory<span class="mip-count">${marketplaces.length}</span>`, link: '/marketplaces/' },
      { text: 'Engineering docs', link: docs[0].href },
    ],
  }
}

function marketplaceGroups(marketplace, versionOf) {
  const groups = [
    {
      text: marketplaceTitle(marketplace),
      items: [
        { text: 'Overview', link: marketplace.guide },
        ...marketplace.buildSequence.map((step, index) => ({
          text: `<span class="mip-step">${index + 1}</span>${escapeHtml(step.label)}`,
          link: step.href,
        })),
      ],
    },
  ]

  if (marketplace.pages.length > 0) {
    groups.push({
      text: 'APIs &amp; guides',
      items: marketplace.pages.map((page) => {
        const version = versionOf(page.href)
        const chip = version ? `<span class="mip-chip">${escapeHtml(version)}</span>` : ''
        return { text: `${escapeHtml(page.label)}${chip}`, link: page.href }
      }),
    })
  }

  return groups
}

export function buildSidebar({ marketplaces, versionOf, docs }) {
  const overview = overviewGroup(marketplaces, docs)
  return {
    ...Object.fromEntries(
      marketplaces.map((marketplace) => [marketplace.guide, [overview, ...marketplaceGroups(marketplace, versionOf)]]),
    ),
    '/marketplaces/': [
      overview,
      {
        text: 'Marketplaces',
        items: marketplaces.map((marketplace) => ({ text: marketplaceTitle(marketplace), link: marketplace.guide })),
      },
    ],
    '/docs/': [overview, { text: 'Engineering', items: docs.map((doc) => ({ text: escapeHtml(doc.label), link: doc.href })) }],
  }
}
