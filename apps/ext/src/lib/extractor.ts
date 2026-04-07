import { Readability } from '@mozilla/readability'
import type { ExtractionResult } from './types'
import { detectDocument } from './detector'

export interface ExtractOptions {
  /** Skip document detection and always attempt extraction */
  force?: boolean
}

/**
 * Extract article content from a document using Readability.
 * Returns null if the page is not a document or Readability fails to parse.
 */
export function extractFromDocument(doc: Document, options?: ExtractOptions): ExtractionResult | null {
  if (!options?.force) {
    const detection = detectDocument(doc)
    if (!detection.isDocument) {
      return null
    }
  }

  const clonedDoc = doc.cloneNode(true) as Document
  const reader = new Readability(clonedDoc, { charThreshold: 500 })

  let article
  try {
    article = reader.parse()
  } catch {
    return null
  }

  if (!article) {
    return null
  }

  return {
    url: doc.location.href,
    title: article.title ?? null,
    byline: article.byline ?? null,
    excerpt: article.excerpt ?? null,
    content: article.content ?? null,
    textContentLength: article.textContent?.length ?? 0,
    siteName: article.siteName ?? null,
    language: article.lang ?? null,
    extractedAt: Date.now(),
  }
}
