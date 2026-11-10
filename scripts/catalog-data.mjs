import { fileURLToPath } from 'node:url'

// Absolute path of the repository checkout (the directory above scripts/).
// fileURLToPath keeps Windows drive letters intact; URL.pathname would turn
// D:\repo into /D:/repo, which path.resolve then mangles into D:\D:\repo.
export const repositoryRoot = fileURLToPath(new URL('..', import.meta.url))
