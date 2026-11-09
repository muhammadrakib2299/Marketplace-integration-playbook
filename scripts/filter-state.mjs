export function readFilterState(search, defaults, allowed = {}) {
  const params = new URLSearchParams(search)
  return Object.fromEntries(
    Object.entries(defaults).map(([key, fallback]) => {
      const value = params.get(key)
      const validValues = allowed[key]
      return [key, value && (!validValues || validValues.includes(value)) ? value : fallback]
    }),
  )
}

export function writeFilterState(pathname, state, defaults, hash = '') {
  const params = new URLSearchParams()
  Object.entries(state).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== defaults[key]) {
      params.set(key, String(value))
    }
  })
  const query = params.toString()
  return `${pathname}${query ? `?${query}` : ''}${hash}`
}
