// Display labels shared by the build (sidebar, catalog) and the theme components.
// Client-safe: no Node imports, so Vue components can import it directly.

// 'documented' → 'Documented'.
export const statusName = (status) => `${status.charAt(0).toUpperCase()}${status.slice(1)}`

// noun(1, 'API surface') → 'API surface'; noun(8, 'API surface') → 'API surfaces'.
export const noun = (count, one, many = `${one}s`) => (count === 1 ? one : many)

// plural(1, 'API surface') → '1 API surface'; plural(8, 'API surface') → '8 API surfaces'.
export const plural = (count, one, many) => `${count} ${noun(count, one, many)}`
