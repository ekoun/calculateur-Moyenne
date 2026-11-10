import { defineConfig, type Plugin } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

function offlinePwaPlugin(): Plugin {
  let basePath = '/'

  return {
    name: 'offline-pwa',
    apply: 'build',
    configResolved(config) {
      basePath = config.base.endsWith('/') ? config.base : `${config.base}/`
    },
    generateBundle(_options, bundle) {
      const cacheVersion = Object.keys(bundle)
        .sort()
        .join('|')
        .split('')
        .reduce((hash, character) => (Math.imul(hash, 31) + character.charCodeAt(0)) | 0, 0)
        .toString(36)
      const precacheUrls = Array.from(new Set([
        basePath,
        `${basePath}index.html`,
        `${basePath}manifest.webmanifest`,
        `${basePath}favicon.svg`,
        `${basePath}icons/icon-192.svg`,
        `${basePath}icons/icon-512.svg`,
        ...Object.keys(bundle).map((fileName) => `${basePath}${fileName}`),
      ]))
      const serviceWorker = `
const CACHE_PREFIX = 'reatd-pwa-'
const CACHE_NAME = '${`reatd-pwa-${cacheVersion}`}'
const PRECACHE_URLS = ${JSON.stringify(precacheUrls)}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME)
    await cache.addAll(PRECACHE_URLS)
    await self.skipWaiting()
  })())
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys()
    await Promise.all(cacheNames
      .filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
      .map((name) => caches.delete(name)))
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request)
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME)
          await cache.put('${basePath}index.html', response.clone())
        }
        return response
      } catch {
        return (await caches.match(request)) || (await caches.match('${basePath}index.html'))
      }
    })())
    return
  }

  event.respondWith((async () => {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) return cachedResponse

    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      await cache.put(request, response.clone())
    }
    return response
  })())
})
`

  const indexHtml = bundle['index.html']
  if (indexHtml?.type === 'asset') {
    this.emitFile({ type: 'asset', fileName: '404.html', source: indexHtml.source })
  }
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: serviceWorker })
    },
  }
}

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    offlinePwaPlugin(),
  ],
  resolve: {
    alias: {
      // Alias @ to the app directory under src
      // imports like "@/components/..." will resolve to src/app/components
      '@': path.resolve(__dirname, './src/app'),
    },
  },

  // Prevent esbuild from choking on corrupted or large source maps such as
  // jspdf.es.min.js.map. The plugin simply treats any `.map` import as an
  // empty text file so that the optimizer can continue.
  optimizeDeps: {
    // jspdf is a known culprit; excluding it means it will be handled by
    // Vite's native ESM pipeline instead of esbuild pre-bundling.
    exclude: ['jspdf'],
    esbuildOptions: {
      plugins: [
        {
          name: 'ignore-map-files',
          setup(build) {
            build.onLoad({ filter: /\.map$/ }, () => ({ contents: '', loader: 'text' }))
          },
        },
      ],
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
