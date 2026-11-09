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

  let queryIndex = 0
  let fieldIndex = 0
  let gaps = 0
  let previousMatch = -1
  while (queryIndex < normalizedQuery.length && fieldIndex < normalizedField.length) {
    if (normalizedQuery[queryIndex] === normalizedField[fieldIndex]) {
      if (previousMatch !== -1) gaps += fieldIndex - previousMatch - 1
      previousMatch = fieldIndex
      queryIndex += 1
    }
    fieldIndex += 1
  }

  if (queryIndex !== normalizedQuery.length) return -Infinity
  return 72 - gaps * 2 - (fieldIndex - normalizedQuery.length) * 0.08
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
