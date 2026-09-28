import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { branch, repo, sidebar, siteUrl } from './site'

/**
 * The docs for LLMs and coding agents (https://llmstxt.org): `llms.txt` (an index), `llms-full.txt`
 * (every page in one file) and a Markdown copy of each page. The docs site serves all of them, and
 * the npm package ships `llms.txt` and `llms-full.txt` in `dist/`.
 */

const docsDir = resolve(import.meta.dirname, '..')
// Pages that only work in a browser.
const interactive = new Set(['/playground'])
// Sidebar groups renamed for llms.txt. "Optional" marks links an agent can skip.
const sections: Record<string, string> = { More: 'Optional' }

export interface LlmsPage {
  /** The sidebar link, e.g. `/guide/syntax`. */
  link: string
  title: string
  description: string
  /** The page without frontmatter, demos and page scripts, with absolute links. */
  markdown: string
}

/** The pages in sidebar order, without interactive ones. */
export function llmsPages(): { section: string; pages: LlmsPage[] }[] {
  return sidebar.map((group) => ({
    section: sections[group.text] ?? group.text,
    pages: group.items.filter((item) => !interactive.has(item.link)).map((item) => readPage(item.link, item.text)),
  }))
}

/** File contents by path relative to the output directory. */
export function buildLlmsFiles(): Record<string, string> {
  const groups = llmsPages()
  const intro = readFileSync(resolve(import.meta.dirname, 'llms-intro.md'), 'utf8').trim()
  const index = [
    intro,
    ...groups.map(({ section, pages }) =>
      [`## ${section}`, '', ...pages.map((page) => `- [${page.title}](${mdUrl(page.link)}): ${page.description}`)].join('\n'),
    ),
  ]
  index[index.length - 1] += `\n- [Changelog](${repo}/blob/${branch}/CHANGELOG.md): Release notes for every version.`

  const pages = groups.flatMap((group) => group.pages)
  const files: Record<string, string> = {
    'llms.txt': `${index.join('\n\n')}\n`,
    'llms-full.txt': `${[intro, ...pages.map((page) => page.markdown)].join('\n\n---\n\n')}\n`,
  }
  for (const page of pages) files[`${page.link.slice(1)}.md`] = `${page.markdown}\n`
  return files
}

export function writeLlmsFiles(outDir: string) {
  for (const [file, content] of Object.entries(buildLlmsFiles())) {
    const path = resolve(outDir, file)
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, content)
  }
}

function mdUrl(link: string) {
  return `${siteUrl}${link.slice(1)}.md`
}

function readPage(link: string, title: string): LlmsPage {
  const source = readFileSync(resolve(docsDir, `.${link}.md`), 'utf8')
  const frontmatter = /^---\n([\s\S]*?)\n---\n/.exec(source)
  const description = frontmatter && /^description:\s*(.+)$/m.exec(frontmatter[1])?.[1]
  if (!description) throw new Error(`[llms] ${link}.md needs a description in its frontmatter`)
  const body = frontmatter ? source.slice(frontmatter[0].length) : source
  return { link, title, description, markdown: toPlainMarkdown(body, link) }
}

/** Drops what only renders in VitePress (`<Demo>`, page scripts, `vp-raw` blocks) and makes links absolute. */
export function toPlainMarkdown(body: string, link: string): string {
  const out: string[] = []
  let fence: string | undefined
  let skipUntil: RegExp | undefined
  for (const line of body.split('\n')) {
    if (fence) {
      if (line.trim().startsWith(fence)) fence = undefined
      out.push(line)
    } else if (skipUntil) {
      if (skipUntil.test(line)) skipUntil = undefined
    } else if (/^\s*(`{3,}|~{3,})/.test(line)) {
      fence = /^\s*(`{3,}|~{3,})/.exec(line)![1]
      out.push(line)
    } else if (line.startsWith('<script')) {
      if (!line.includes('</script>')) skipUntil = /<\/script>/
    } else if (line.startsWith('<Demo')) {
      if (!/\/>\s*$|<\/Demo>/.test(line)) skipUntil = /\/>\s*$|<\/Demo>/
    } else if (/^<div\b[^>]*\bvp-raw\b/.test(line)) {
      skipUntil = /^<\/div>/
    } else {
      out.push(line.replace(/\]\(([^)\s]+)\)/g, (_, target: string) => `](${absoluteLink(target, link)})`))
    }
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

function absoluteLink(target: string, from: string) {
  if (/^[a-z]+:/i.test(target) || target.startsWith('#')) return target
  const url = new URL(target, `https://docs${from}`)
  return `${mdUrl(url.pathname.replace(/\.md$/, ''))}${url.hash}`
}
