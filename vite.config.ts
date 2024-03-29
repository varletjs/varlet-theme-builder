import vue from '@vitejs/plugin-vue'
import jsx from '@vitejs/plugin-vue-jsx'
import autoImport from 'unplugin-auto-import/vite'
import components from 'unplugin-vue-components/vite'
import compression from 'vite-plugin-compression2'
import progress from 'vite-plugin-progress'
import unoCSS from 'unocss/vite'
import { fileURLToPath, URL } from 'node:url'
import { VarletImportResolver } from '@varlet/import-resolver'
import { defineConfig } from 'vitest/config'

// Use as needed
// import eruda from 'vite-plugin-eruda'
// import { analyzer } from 'vite-bundle-analyzer'

export default defineConfig({
  base: './',

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  server: {
    host: '0.0.0.0',
    port: 10086
  },

  build: {
    target: ['ios12']
  },

  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'istanbul'
    },
    setupFiles: ['tests/setup.ts'],
    include: ['tests/**/*.spec.ts'],
    server: {
      deps: {
        inline: ['@varlet/ui']
      }
    }
  },

  plugins: [
    vue({
      template: {
        transformAssetUrls: {
          img: ['src'],
          video: ['src'],
          audio: ['src'],
          'var-image': ['src'],
          'var-avatar': ['src'],
          'var-card': ['src'],
          'var-app-bar': ['image']
        }
      }
    }),

    jsx(),

    components({
      resolvers: [VarletImportResolver()]
    }),

    autoImport({
      imports: ['vue', 'vue-router', 'pinia', 'vue-i18n'],
      resolvers: [VarletImportResolver({ autoImport: true })],
      eslintrc: { enabled: true }
    }),

    compression({
      include: [/\.html$/, /\.css$/, /\.js$/, /\.ttf$/],
      skipIfLargerOrEqual: true
    }),

    progress(),

    unoCSS()

    // analyzer()
    // eruda()
  ]
})
