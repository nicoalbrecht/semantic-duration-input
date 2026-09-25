import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    dts({ include: ['src'], tsconfigPath: './tsconfig.json', rollupTypes: false }),
  ],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'semantic-duration-input',
      cssFileName: 'semantic-duration-input',
    },
    rollupOptions: {
      external: ['vue'],
    },
  },
})
