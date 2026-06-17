// mrds-data-loader — Vite 插件
//
// 方案:build time 写一个真实 ESM 文件到 theme/data/mrds-data.js
// 组件用 `import { data } from 'virtual:mrds-data'` 的形式被代理
// 到这个文件,SSG 端能正常解析。
//
// 备选方案:直接 `import data from '../data/mrds-data.js'`,
// 但为了保持"零侵入"组件代码 + 未来可换实现,继续用虚拟模块代理。
//
// 关键修复:虚拟模块的 load 同时 export 真实模块的内容,
// 让 Vite 在 SSR 端也能 inline。

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import type { Plugin, ViteDevServer } from 'vite'

/* ------------------------------------------------------------------ */
/* 配置                                                                */
/* ------------------------------------------------------------------ */

const RESOURCE_DIR = '004.Mcoo Resource Download Site'

// 真实数据文件路径(放 theme/data/ 下,跟插件同级,但独立目录)
// docs/.vitepress/theme/data/mrds-data.js
const DATA_FILE_ABS = resolve(__dirname, '../data/mrds-data.js')
// 为虚拟模块注册,供组件 import
const VIRTUAL_ID = 'virtual:mrds-data'
const RESOLVED_VIRTUAL_ID = '\0' + VIRTUAL_ID

/* ------------------------------------------------------------------ */
/* YAML 解析(同阶段 2 首次)                                            */
/* ------------------------------------------------------------------ */

interface YamlScalar { type: 'scalar'; value: string }
interface YamlArray { type: 'array'; items: string[] }
type YamlValue = YamlScalar | YamlArray

function parseScalar(s: string): string {
  s = s.trim()
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1)
  }
  return s
}

function parseFrontmatter(yaml: string): Record<string, YamlValue> {
  const result: Record<string, YamlValue> = {}
  // 兼容 CRLF / LF / CR
  const lines = yaml.split(/\r?\n/)
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) { i++; continue }
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)$/)
    if (!m) { i++; continue }
    const key = m[1]
    const rest = m[2].trim()
    if (rest === '') {
      const items: string[] = []
      let isArray = true
      let isBlock = false
      while (i + 1 < lines.length) {
        const next = lines[i + 1]
        if (!next.trim()) { i++; continue }
        if (next.match(/^\s+-\s+/)) {
          items.push(parseScalar(next.replace(/^\s*-\s*/, '')))
          i++
        } else if (next.match(/^\s{2,}[A-Za-z_][A-Za-z0-9_-]*:/)) {
          isArray = false
          isBlock = true
          const blockIndent = next.match(/^(\s+)/)![1].length
          while (i + 1 < lines.length) {
            const sub = lines[i + 1]
            if (!sub.trim() || sub.length < blockIndent) break
            if (!sub.startsWith(' '.repeat(blockIndent))) break
            const subMatch = sub.match(/^\s+([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)$/)
            if (!subMatch) break
            result[`${key}.${subMatch[1]}`] = { type: 'scalar', value: parseScalar(subMatch[2]) }
            i++
          }
          break
        } else { break }
      }
      if (isArray && !isBlock) result[key] = { type: 'array', items }
      i++
      continue
    }
    if (rest.startsWith('[') && rest.endsWith(']')) {
      const inner = rest.slice(1, -1)
      const items = inner.split(',').map(parseScalar).filter((s) => s !== '')
      result[key] = { type: 'array', items }
    } else {
      result[key] = { type: 'scalar', value: parseScalar(rest) }
    }
    i++
  }
  return result
}

function getScalar(fm: Record<string, YamlValue>, key: string, fallback = ''): string {
  const v = fm[key]
  if (!v || v.type !== 'scalar') return fallback
  return v.value || fallback
}

function getArray(fm: Record<string, YamlValue>, key: string, fallback: string[] = []): string[] {
  const v = fm[key]
  if (!v || v.type !== 'array') return fallback
  return v.items
}

function splitFrontmatter(raw: string): { yaml: string; content: string } {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!m) return { yaml: '', content: raw }
  return { yaml: m[1], content: m[2] }
}

function extractCategoryFromPath(filePath: string): string {
  const parts = filePath.split(sep)
  if (parts.length < 2) return ''
  const dir = parts[parts.length - 2]
  return dir.replace(/^\d+\.?\s*/, '').trim()
}

function extractCoverFromContent(content: string): string {
  const m = content.match(/https?:\/\/[^\s'"<>)]+\.(?:png|jpg|jpeg|webp|gif)/i)
  return m?.[0] ?? ''
}

/**
 * 从 .md 正文里抓 <AuthorCard ...> 标签的属性
 * 投稿风格统一是这种写法:多行、缩进、属性值双引号
 * 返回 { avatar, name, link, subtitle } 取到的子集
 */
function extractAuthorCardInfo(content: string): {
  avatar?: string
  name?: string
  link?: string
  subtitle?: string
} {
  // 匹配 <AuthorCard ...> 开始标签(自闭合也算)
  const m = content.match(/<AuthorCard\b[^>]*\/?\s*>/s)
  if (!m) return {}
  const tag = m[0]
  const result: Record<string, string> = {}
  for (const key of ['avatar', 'name', 'link', 'subtitle']) {
    const re = new RegExp(`(?:^|\\s)${key}\\s*=\\s*"([^"]*)"`, 'i')
    const mm = tag.match(re)
    if (mm) result[key] = mm[1]
  }
  return result
}

/* ------------------------------------------------------------------ */
/* 扫描 + 生成数据                                                     */
/* ------------------------------------------------------------------ */

interface Resource {
  id: string
  title: string
  link: string
  cover: string
  description: string
  category: string
  tags: string[]
  date: string
  author: { name: string; avatar: string; link: string; subtitle: string }
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    const st = statSync(p)
    if (st.isDirectory()) walk(p, out)
    else if (entry.endsWith('.md') && !entry.startsWith('.')) out.push(p)
  }
  return out
}

function makeId(link: string, filePath: string): string {
  if (link) return link.replace(/^\//, '').replace(/\//g, '-')
  return filePath.split(sep).pop()!.replace(/\.md$/, '')
}

function buildResource(filePath: string, docsRoot: string): Resource {
  const raw = readFileSync(filePath, 'utf-8')
  const { yaml, content } = splitFrontmatter(raw)
  const fm = parseFrontmatter(yaml)

  const title = getScalar(fm, 'title') || filePath.split(sep).pop()!.replace(/\.md$/, '')
  const permalink = getScalar(fm, 'permalink')
  const date = getScalar(fm, 'date').split(' ')[0]
  const description = getScalar(fm, 'description')
  const tags = getArray(fm, 'tags')

  // 作者信息优先从正文 <AuthorCard> 读(投稿风格已统一写在那里)
  // fallback 到 frontmatter 的 author 块(老格式兼容)
  const fromCard = extractAuthorCardInfo(content)
  const authorName =
    fromCard.name ||
    getScalar(fm, 'author.name') ||
    getScalar(fm, 'author')
  const authorLink =
    fromCard.link ||
    getScalar(fm, 'author.link')
  const authorAvatar =
    fromCard.avatar ||
    getScalar(fm, 'author.avatar') ||
    getScalar(fm, 'avatar') ||
    ''
  const authorSubtitle =
    fromCard.subtitle ||
    getScalar(fm, 'author.subtitle') ||
    getScalar(fm, 'subtitle') ||
    ''

  const rel = relative(docsRoot, filePath)
  return {
    id: makeId(permalink, filePath),
    title,
    link: permalink,
    cover: extractCoverFromContent(content),
    description,
    category: extractCategoryFromPath(rel),
    tags,
    date,
    author: { name: authorName, avatar: authorAvatar, link: authorLink, subtitle: authorSubtitle },
  }
}

function generateData(docsRoot: string): Resource[] {
  const resourceDir = join(docsRoot, RESOURCE_DIR)
  if (!existsSync(resourceDir)) return []
  return walk(resourceDir)
    .map((f) => buildResource(f, docsRoot))
    .sort((a, b) => {
      if (!a.date && !b.date) return 0
      if (!a.date) return 1
      if (!b.date) return -1
      return a.date < b.date ? 1 : -1
    })
}

function writeDataFile(docsRoot: string): void {
  const items = generateData(docsRoot)
  const dir = dirname(DATA_FILE_ABS)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  // 输出 ESM 模块,带 JSDoc 类型提示
  const banner = `// AUTO-GENERATED by mrds-data-loader. DO NOT EDIT.
// 数据来源:docs/${RESOURCE_DIR} 下所有 .md 的 frontmatter
// 重新生成方式:dev 修改任意 .md 自动触发 / build 自动触发
`
  const content =
    banner +
    `\nexport const data = ${JSON.stringify(items, null, 2)};\n`
  writeFileSync(DATA_FILE_ABS, content, 'utf-8')
}

/* ------------------------------------------------------------------ */
/* Vite 插件                                                           */
/* ------------------------------------------------------------------ */

export function mrdsDataLoader(): Plugin {
  // __filename 在 Node 端指向插件文件自身
  // docs/.vitepress/theme/plugins/mrds-data-loader.ts
  // → docs/(plugins → theme → .vitepress → docs)
  const docsRoot = resolve(__dirname, '../../../')

  return {
    name: 'mrds-data-loader',
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID
    },
    load(id) {
      if (id !== RESOLVED_VIRTUAL_ID) return
      // 确保 data 文件存在(可能被 watcher 删掉,build 时也写一次)
      if (!existsSync(DATA_FILE_ABS)) writeDataFile(docsRoot)
      // 虚拟模块 re-export 真实文件的内容
      // Vite 会读 DATA_FILE_ABS 并 inline
      return `export * from ${JSON.stringify(DATA_FILE_ABS)};`
    },
    // build/SSG 启动时先生成数据文件
    buildStart() {
      writeDataFile(docsRoot)
    },
    // dev 模式启动时也写一次
    configureServer(server: ViteDevServer) {
      // 第一次写(如果 .js 不存在)
      if (!existsSync(DATA_FILE_ABS)) writeDataFile(docsRoot)
      // 监听 .md 文件变化
      server.watcher.add(join(docsRoot, RESOURCE_DIR, '**/*.md'))
      const regenerate = () => {
        writeDataFile(docsRoot)
        // 让 Vite 知道 data.js 变了,触发依赖它的模块重新编译
        const mod = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_ID)
        if (mod) {
          server.moduleGraph.invalidateModule(mod)
          server.ws.send({ type: 'full-reload' })
        }
      }
      server.watcher.on('change', regenerate)
      server.watcher.on('add', regenerate)
      server.watcher.on('unlink', regenerate)
    },
  }
}
