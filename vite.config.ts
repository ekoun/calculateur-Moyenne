import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
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
