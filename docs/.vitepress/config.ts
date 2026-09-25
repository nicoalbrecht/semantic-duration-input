import { defineConfig } from 'vitepress'
import tailwindcss from '@tailwindcss/vite'

const repo = 'https://github.com/nicoalbrecht/semantic-duration-input'
// Default branch, for the changelog and "edit this page" links.
const branch = 'feat/initial-scaffold'

export default defineConfig({
  title: 'Semantic Duration Input',
  description: 'A Vue 3 input that understands "2h", "1h30", "3 Tage" and "PT1H30M".',
  base: '/semantic-duration-input/',
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
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting started', link: '/guide/getting-started' },
          { text: 'Syntax', link: '/guide/syntax' },
          { text: 'Behaviour', link: '/guide/behaviour' },
          { text: 'Value formats', link: '/guide/value-formats' },
          { text: 'Locales', link: '/guide/locales' },
          { text: 'Forms and validation', link: '/guide/forms' },
          { text: 'Styling', link: '/guide/styling' },
          { text: 'Integrations', link: '/guide/integrations' },
          { text: 'Nuxt', link: '/guide/nuxt' },
          { text: 'Headless usage', link: '/guide/headless' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'Component', link: '/reference/component' },
          { text: 'Core API', link: '/reference/core' },
        ],
      },
      {
        text: 'More',
        items: [
          { text: 'Playground', link: '/playground' },
          { text: 'Migrating to 0.2', link: '/migration/0.2' },
        ],
      },
    ],
    search: { provider: 'local' },
    socialLinks: [{ icon: 'github', link: repo }],
    editLink: { pattern: `${repo}/edit/${branch}/docs/:path`, text: 'Edit this page on GitHub' },
    footer: { message: 'Released under the MIT License.' },
  },
  vite: {
    plugins: [tailwindcss()],
  },
})
