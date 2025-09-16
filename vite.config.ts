import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { execSync } from 'node:child_process'
import fs from 'node:fs'

// Try to read git short hash (7 chars). If not available (no git), fall back to package.json version.
function getGitShortHash(): string | undefined {
  try {
    const hash = execSync('git rev-parse --short=7 HEAD', { encoding: 'utf8' }).trim()
    return hash || undefined
  } catch (e) {
    return undefined
  }
}

const gitHash = getGitShortHash()
let defineGit: Record<string, string> = {}
if (gitHash) {
  defineGit['__GIT_HASH__'] = JSON.stringify(gitHash)
} else {
  // fallback to package.json version if no git
  try {
    const pkg = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'))
    defineGit['__GIT_HASH__'] = JSON.stringify(pkg.version || '')
  } catch (e) {
    defineGit['__GIT_HASH__'] = JSON.stringify('')
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  },
  define: defineGit
})