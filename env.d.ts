/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Build-time injected git short hash (or package version fallback)
declare const __GIT_HASH__: string