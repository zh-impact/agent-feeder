import type { DocumentDetection } from './types'

/**
 * Detect whether the current page is a document-type page.
 * Uses multiple heuristics in order of cost (cheap first).
 */
export function detectDocument(doc: Document): DocumentDetection {
  const url = doc.location.href
  const path = doc.location.pathname.toLowerCase()

  // Signal 1: URL patterns
  if (path === '/' || path === '') {
    return { isDocument: false, reason: 'Root/home page' }
  }
  if (url.includes('/search') || url.includes('?q=') || url.includes('?s=')) {
    return { isDocument: false, reason: 'Search results page' }
  }
  if (path.match(/\.(json|xml|rss|atom)(\?|$)/)) {
    return { isDocument: false, reason: 'Non-HTML resource' }
  }

  // Signal 2: Meta tags
  const metaArticle = doc.querySelector('meta[property="article:published_time"]')
  if (metaArticle) {
    return { isDocument: true, reason: 'Has article:published_time meta tag' }
  }

  const metaOgType = doc.querySelector('meta[property="og:type"]')
  const ogType = metaOgType?.getAttribute('content') ?? ''
  if (ogType === 'article') {
    return { isDocument: true, reason: 'og:type is article' }
  }

  // Signal 3: Semantic HTML
  const hasArticle = doc.querySelector('article') !== null
  const hasTimeElement = doc.querySelector('time[datetime]') !== null
  if (hasArticle && hasTimeElement) {
    return { isDocument: true, reason: 'Has <article> and <time> elements' }
  }

  // Signal 4: Word count of paragraph content
  const paragraphs = doc.querySelectorAll('p')
  let totalWords = 0
  for (const p of paragraphs) {
    totalWords += p.textContent?.split(/\s+/).filter(Boolean).length ?? 0
  }

  if (totalWords < 100) {
    return { isDocument: false, reason: `Too little text content (${totalWords} words)` }
  }

  return {
    isDocument: totalWords >= 250,
    reason: totalWords >= 250
      ? `Sufficient text content (${totalWords} words)`
      : `Marginal text content (${totalWords} words)`,
  }
}
