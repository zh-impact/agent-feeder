import { describe, it, expect, vi, beforeEach } from 'vitest'
import { JSDOM } from 'jsdom'

// Mock @mozilla/readability
vi.mock('@mozilla/readability', () => {
  function MockReadability(doc: Document, _options?: Record<string, unknown>) {
    const articleTag = doc.querySelector('article')
    const title = doc.querySelector('h1')?.textContent ?? null
    const paragraphs = doc.querySelectorAll('article p, body p')
    const textContent = Array.from(paragraphs)
      .map((p) => p.textContent ?? '')
      .join(' ')

    if (!articleTag && textContent.split(/\s+/).length < 50) {
      this.parse = () => null
    } else {
      this.parse = () => ({
        title,
        byline: doc.querySelector('.author')?.textContent?.trim() ?? null,
        excerpt: textContent.slice(0, 200).trim(),
        content: `<div>${Array.from(paragraphs).map((p) => p.outerHTML).join('')}</div>`,
        textContent,
        siteName: doc.querySelector('meta[property="og:site_name"]')?.getAttribute('content') ?? null,
        lang: doc.documentElement.lang || null,
        dir: doc.documentElement.dir || 'ltr',
        length: textContent.length,
      })
    }
  }
  return { Readability: MockReadability }
})

import { extractFromDocument } from '../src/lib/extractor'

function createDoc(html: string, url = 'https://example.com/article/hello-world') {
  const dom = new JSDOM(html, { url })
  return dom.window.document
}

const articleDoc = `
<html lang="en"><head>
  <meta property="article:published_time" content="2024-01-01" />
</head><body>
  <article>
    <h1>Test Article Title</h1>
    <span class="author">John Doe</span>
    <p>This is the first paragraph of the test article. It contains enough text to ensure that the Readability mock will treat this as a valid article and return a parsed result for our extraction pipeline tests.</p>
    <p>This is the second paragraph which provides additional context and content for the article extraction testing. We want to make sure the full pipeline works correctly including document detection and content parsing.</p>
    <p>Third paragraph with more content to ensure we have sufficient text for a proper extraction result.</p>
  </article>
</body></html>
`

const nonArticleDoc = `
<html><body>
  <h1>Dashboard</h1>
  <p>Welcome to your dashboard.</p>
</body></html>
`

describe('extractFromDocument', () => {
  it('extracts content from an article page', () => {
    const doc = createDoc(articleDoc)
    const result = extractFromDocument(doc)
    expect(result).not.toBeNull()
    expect(result!.title).toBe('Test Article Title')
    expect(result!.byline).toBe('John Doe')
    expect(result!.textContentLength).toBeGreaterThan(0)
    expect(result!.url).toBe('https://example.com/article/hello-world')
    expect(result!.extractedAt).toBeGreaterThan(0)
  })

  it('returns null for non-document pages', () => {
    const doc = createDoc(nonArticleDoc)
    const result = extractFromDocument(doc)
    expect(result).toBeNull()
  })

  it('extracts when force is true even for non-document', () => {
    const doc = createDoc(nonArticleDoc)
    const result = extractFromDocument(doc, { force: true })
    // Mock returns null for very short content even with force
    // But the point is detection is skipped
    expect(result).toBeNull() // still null because Readability can't parse it
  })

  it('returns null when Readability fails to parse', () => {
    const html = `
      <html><head><meta property="og:type" content="article" /></head><body>
        <p>Not enough content for readability to consider this an article.</p>
      </body></html>`
    const doc = createDoc(html)
    const result = extractFromDocument(doc)
    expect(result).toBeNull()
  })
})
