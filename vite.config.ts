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
  ],
  host_permissions: [
    "<all_urls>"
  ],
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
      js: ["src/content-scripts/index.ts"]
    }
  ],
  chrome_url_overrides: {
    newtab: "index.html"
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    crx({ manifest: manifest as unknown as ManifestV3Export }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})