import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'node:fs'
import { defineConfig } from 'vite'

function githubPagesSpaFallback() {
  return {
    apply: 'build' as const,
    closeBundle() {
      copyFileSync('dist/index.html', 'dist/404.html')
    },
    name: 'github-pages-spa-fallback',
  }
}

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/FramedPhysic/' : '/',
  plugins: [react(), tailwindcss(), githubPagesSpaFallback()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    host: true,
  }
})
