import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import dts from 'vite-plugin-dts'

const fileName = 'semantic-duration-input'

/**
 * Emits `dist/tailwind.css` for apps that use Tailwind themselves: it lets their build scan our
 * bundle for classes and adds the `--sdi-*` tokens.
 */
function tailwindEntry(): Plugin {
  return {
    name: 'sdi-tailwind-entry',
    apply: 'build',
    generateBundle() {
      const vars = readFileSync(resolve(import.meta.dirname, 'src/styles/vars.css'), 'utf8')
      this.emitFile({
        type: 'asset',
        fileName: 'tailwind.css',
        source: `/* Import after "tailwindcss": @import "semantic-duration-input/tailwind.css"; */\n@source "./${fileName}.js";\n\n${vars}`,
      })
    },
  }
}

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    dts({ include: ['src'], tsconfigPath: './tsconfig.json', rollupTypes: false }),
    tailwindEntry(),
  ],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      formats: ['es'],
      fileName,
      cssFileName: fileName,
    },
    rollupOptions: {
      external: ['vue', 'tailwind-variants', 'tailwind-merge'],
    },
  },
})
