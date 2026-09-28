import { describe, expect, it } from 'vitest'
import { buildLlmsFiles, llmsPages, toPlainMarkdown } from '../docs/.vitepress/llms'

const siteUrl = 'https://nicoalbrecht.github.io/semantic-duration-input/'

describe('llms.txt', () => {
  const files = buildLlmsFiles()
  const pages = llmsPages().flatMap((group) => group.pages)

  it('lists every page with a description and links to its Markdown copy', () => {
    for (const page of pages) {
      expect(files['llms.txt']).toContain(`- [${page.title}](${siteUrl}${page.link.slice(1)}.md): ${page.description}`)
      expect(files[`${page.link.slice(1)}.md`]).toBe(`${page.markdown}\n`)
      expect(files['llms-full.txt']).toContain(page.markdown)
    }
    expect(files['llms.txt']).toContain('## Optional')
    expect(files['llms.txt']).not.toContain('playground')
  })

  it('leaves out what only renders in VitePress', () => {
    for (const page of pages) {
      let inFence = false
      for (const line of page.markdown.split('\n')) {
        if (/^\s*```/.test(line)) inFence = !inFence
        else if (!inFence) expect(line, page.link).not.toMatch(/^<(script|Demo|div|DurationInput)\b/)
      }
      expect(inFence, page.link).toBe(false)
    }
  })

  it('keeps code blocks and makes links absolute', () => {
    const markdown = toPlainMarkdown(
      [
        'See [Locales](./locales), [Core](../reference/core#types), [top](#units) and [MDN](https://developer.mozilla.org).',
        '',
        '<Demo placeholder="45" />',
        '<Demo size="lg">',
        '  <template #leading>⏱</template>',
        '</Demo>',
        '<div class="demo-controls vp-raw">',
        '  <select v-model="format"></select>',
        '</div>',
        '',
        '',
        '```vue',
        '<script setup lang="ts">',
        "import { ref } from 'vue'",
        '</script>',
        '```',
        '',
        '<script setup>',
        "const format = ref('minutes')",
        '</script>',
      ].join('\n'),
      '/guide/syntax',
    )
    expect(markdown).toBe(
      [
        `See [Locales](${siteUrl}guide/locales.md), [Core](${siteUrl}reference/core.md#types), [top](#units) and [MDN](https://developer.mozilla.org).`,
        '',
        '```vue',
        '<script setup lang="ts">',
        "import { ref } from 'vue'",
        '</script>',
        '```',
      ].join('\n'),
    )
  })
})
