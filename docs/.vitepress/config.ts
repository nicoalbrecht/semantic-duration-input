import { defineConfig } from 'vitepress'
import tailwindcss from '@tailwindcss/vite'
import { writeLlmsFiles } from './llms'
import { base, branch, npm, repo, sidebar } from './site'

export default defineConfig({
  title: 'Semantic Duration Input',
  description: 'A Vue 3 input that understands "2h", "1h30", "3 Tage" and "PT1H30M".',
  base,
  cleanUrls: true,
  lastUpdated: true,
  head: [['meta', { name: 'theme-color', content: '#5f67ee' }]],
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Reference', link: '/reference/component' },
      { text: 'Playground', link: '/playground' },
      { text: 'Changelog', link: `${repo}/blob/${branch}/CHANGELOG.md` },
    ],
    sidebar,
    search: { provider: 'local' },
    socialLinks: [
      { icon: 'github', link: repo },
      { icon: 'npm', link: npm },
    ],
    editLink: { pattern: `${repo}/edit/${branch}/docs/:path`, text: 'Edit this page on GitHub' },
    footer: { message: 'Released under the MIT License.' },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  buildEnd({ outDir }) {
    writeLlmsFiles(outDir)
  },
})
