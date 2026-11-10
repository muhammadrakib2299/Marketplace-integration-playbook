// Display labels shared by the build (sidebar, catalog) and the theme components.
// Client-safe: no Node imports, so Vue components can import it directly.

// 'documented' → 'Documented'.
export const statusName = (status) => `${status.charAt(0).toUpperCase()}${status.slice(1)}`
