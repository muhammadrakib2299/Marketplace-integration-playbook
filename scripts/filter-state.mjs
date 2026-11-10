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

// Writes the non-default filter values into the URL. Parameters the state does not own (any key not
// in `defaults`, such as utm_source) are kept from `currentSearch`; owned keys are always rewritten.
export function writeFilterState(pathname, state, defaults, hash = '', currentSearch = '') {
  const params = new URLSearchParams(currentSearch)
  Object.keys(defaults).forEach((key) => params.delete(key))
  Object.entries(state).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== defaults[key]) {
      params.set(key, String(value))
    }
  })
  const query = params.toString()
  return `${pathname}${query ? `?${query}` : ''}${hash}`
}
