import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { crx, ManifestV3Export } from '@crxjs/vite-plugin'
import { resolve } from 'path'
import manifest from './manifest.json'
export default defineConfig({
  plugins: [
    react(),
    crx({ manifest: manifest as unknown as ManifestV3Export }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@lib': resolve(__dirname, './src/lib'),
      '@styles': resolve(__dirname, './src/styles'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background/index.ts'),
        'content-scripts': resolve(__dirname, 'src/content-scripts/index.ts'),
        sidepanel: resolve(__dirname, 'src/sidepanel.html')
      },
      output: {
        entryFileNames: '[name].js'
      }
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
  }
})