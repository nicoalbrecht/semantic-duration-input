import type { DefaultTheme } from 'vitepress'

export const repo = 'https://github.com/nicoalbrecht/semantic-duration-input'
// Default branch, for the changelog and "edit this page" links.
export const branch = 'main'
export const base = '/semantic-duration-input/'
export const siteUrl = `https://nicoalbrecht.github.io${base}`

/** The docs navigation. `llms.ts` lists the pages in the same order. */
export const sidebar = [
  {
    text: 'Guide',
    items: [
      { text: 'Getting started', link: '/guide/getting-started' },
      { text: 'Syntax', link: '/guide/syntax' },
      { text: 'Behaviour', link: '/guide/behaviour' },
      { text: 'Value formats', link: '/guide/value-formats' },
      { text: 'Locales', link: '/guide/locales' },
      { text: 'Custom units', link: '/guide/units' },
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
] satisfies DefaultTheme.SidebarItem[]
