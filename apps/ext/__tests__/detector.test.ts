import { describe, it, expect, beforeEach } from 'vitest'
import { JSDOM } from 'jsdom'
import { detectDocument } from '../src/lib/detector'

function createDoc(html: string, url = 'https://example.com/article/hello-world') {
  const dom = new JSDOM(html, { url })
  return dom.window.document
}

const articleHtml = `
<html><head>
  <meta property="article:published_time" content="2024-01-01" />
</head><body>
  <article>
    <time datetime="2024-01-01">January 1, 2024</time>
    <h1>Test Article</h1>
    <p>This is the first paragraph of the article with enough content to be meaningful. It discusses various topics related to the subject at hand and provides context for the reader to understand the main argument being presented throughout the text.</p>
    <p>This is the second paragraph that continues the discussion. It elaborates on the points made earlier and introduces new information that supports the thesis. The content here is rich and informative, giving readers a comprehensive view of the topic being discussed in this particular article.</p>
    <p>A third paragraph rounds out the introduction. By now we have established a clear narrative and the reader should have a good understanding of what this article is about. The arguments are well supported and the evidence is compelling.</p>
  </article>
</body></html>
`

const shortHtml = `
<html><head></head><body>
  <nav>Home About Contact</nav>
  <h1>Welcome</h1>
  <p>Short page.</p>
</body></html>
`

describe('detectDocument', () => {
  it('detects article page via meta tag', () => {
    const doc = createDoc(articleHtml)
    const result = detectDocument(doc)
    expect(result.isDocument).toBe(true)
    expect(result.reason).toContain('article:published_time')
  })

  it('detects article via og:type=article', () => {
    const html = `
      <html><head><meta property="og:type" content="article" /></head><body>
        <p>Some short text.</p>
      </body></html>`
    const doc = createDoc(html)
    const result = detectDocument(doc)
    expect(result.isDocument).toBe(true)
    expect(result.reason).toContain('og:type')
  })

  it('detects article via semantic HTML', () => {
    const html = `
      <html><head></head><body>
        <article><time datetime="2024-01-01"></time>
          <p>Word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12 word13 word14 word15 word16 word17 word18 word19 word20 word21 word22 word23 word24 word25 word26 word27 word28 word29 word30 word31 word32 word33 word34 word35 word36 word37 word38 word39 word40 word41 word42 word43 word44 word45 word46 word47 word48 word49 word50</p>
        </article>
      </body></html>`
    const doc = createDoc(html)
    const result = detectDocument(doc)
    expect(result.isDocument).toBe(true)
    expect(result.reason).toContain('<article>')
  })

  it('rejects root/home page', () => {
    const doc = createDoc('<html><body><p>Some content here.</p></body></html>', 'https://example.com/')
    const result = detectDocument(doc)
    expect(result.isDocument).toBe(false)
    expect(result.reason).toContain('Root')
  })

  it('rejects search page', () => {
    const doc = createDoc('<html><body><p>Search results for query.</p></body></html>', 'https://example.com/search?q=test')
    const result = detectDocument(doc)
    expect(result.isDocument).toBe(false)
    expect(result.reason).toContain('Search')
  })

  it('rejects short content page', () => {
    const doc = createDoc(shortHtml)
    const result = detectDocument(doc)
    expect(result.isDocument).toBe(false)
    expect(result.reason).toContain('Too little')
  })

  it('accepts long content without meta tags', () => {
    const html = `
      <html><head></head><body>
        <h1>Long Article</h1>
        ${Array.from({ length: 20 }, (_, i) => `<p>This is paragraph ${i} with enough words to push the total count well above the two hundred fifty word threshold required for automatic document detection based on text content analysis alone.</p>`).join('\n')}
      </body></html>`
    const doc = createDoc(html)
    const result = detectDocument(doc)
    expect(result.isDocument).toBe(true)
    expect(result.reason).toContain('Sufficient')
  })
})
