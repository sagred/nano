import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { crx, ManifestV3Export } from '@crxjs/vite-plugin'
import { resolve } from 'path'

const manifest = {
  manifest_version: 3,
  name: "Nano Search",
  version: "1.0.0",
  description: "Local AI-powered search through your browsing history and bookmarks",
  permissions: [
    "tabs",
    "history",
    "bookmarks",
    "storage",
    "unlimitedStorage",
    "scripting",
    "commands"
  ],
  host_permissions: [
    "<all_urls>"
  ],
  commands: {
    "show-text-options": {
      "suggested_key": {
        "default": "Ctrl+M",
        "mac": "Command+M"
      },
      "description": "Show text modification options"
    }
  },
  action: {
    default_title: "Nano Search"
  },
  background: {
    service_worker: "src/background/index.ts",
    type: "module"
  },
  content_scripts: [
    {
      matches: ["<all_urls>"],
      js: ["src/content-scripts/index.ts"],
      run_at: "document_idle"
    }
  ],
  chrome_url_overrides: {
    newtab: "index.html"
  },
  web_accessible_resources: [{
    resources: ["assets/*"],
    matches: ["<all_urls>"]
  }]
}

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