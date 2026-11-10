const normalize = (value) => value.toLocaleLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')

function scoreField(query, field) {
  const normalizedQuery = normalize(query).trim()
  const normalizedField = normalize(field)
  if (!normalizedQuery) return 0
  if (!normalizedField) return -Infinity

  const exactIndex = normalizedField.indexOf(normalizedQuery)
  if (exactIndex !== -1) {
    const boundaryBonus = exactIndex === 0 || /[\s:/_-]/.test(normalizedField[exactIndex - 1]) ? 24 : 0
    return 120 + boundaryBonus - exactIndex - (normalizedField.length - normalizedQuery.length) * 0.05
  }

  const match = compactMatch(normalizedQuery, normalizedField)
  if (!match) return -Infinity
  return 72 - match.gaps * 2 - (match.end - normalizedQuery.length) * 0.08
}

// The tightest in-order match of the query's letters, or null. A match may skip at most as many
// characters as the query has, so typos like "amzn" still find "amazon" while letters scattered
// across a long summary ("europe" spread over a TikTok description) do not count.
function compactMatch(query, field) {
  let best = null
  for (let start = field.indexOf(query[0]); start !== -1; start = field.indexOf(query[0], start + 1)) {
    let position = start
    let gaps = 0
    let index = 1
    for (; index < query.length; index += 1) {
      const next = field.indexOf(query[index], position + 1)
      if (next === -1) break
      gaps += next - position - 1
      position = next
    }
    // Later starts see less of the field, so they cannot complete a match this one could not.
    if (index < query.length) break
    if (gaps <= query.length && (!best || gaps < best.gaps)) best = { gaps, end: position + 1 }
  }
  return best
}

export function fuzzyScore(query, fields) {
  const normalizedQuery = query.trim()
  if (!normalizedQuery) return 0
  const tokens = normalize(normalizedQuery).split(/\s+/).filter(Boolean)
  const scores = tokens.map((token) => Math.max(...fields.map((field) => scoreField(token, String(field)))))
  if (scores.some((score) => !Number.isFinite(score))) return -Infinity
  return scores.reduce((total, score) => total + score, 0) + (tokens.length > 1 ? 12 : 0)
}

export function fuzzySearch(items, query, getFields) {
  const normalizedQuery = query.trim()
  if (!normalizedQuery) return [...items]

  return items
    .map((item, index) => ({ item, index, score: fuzzyScore(normalizedQuery, getFields(item)) }))
    .filter(({ score }) => Number.isFinite(score))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ item }) => item)
}
