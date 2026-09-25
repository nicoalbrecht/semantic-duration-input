import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    include: ['tests/**/*.spec.ts'],
    // Vuetify's components import their own CSS, which Node can't load untransformed.
    server: { deps: { inline: ['vuetify'] } },
  },
})
