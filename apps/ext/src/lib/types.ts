/** Result from Readability extraction */
export interface ExtractionResult {
  url: string
  title: string | null
  byline: string | null
  excerpt: string | null
  /** Full HTML content of the article */
  content: string | null
  /** Plain text content length */
  textContentLength: number
  siteName: string | null
  language: string | null
  /** Timestamp when extraction was performed */
  extractedAt: number
}

/** Result of document type detection */
export interface DocumentDetection {
  isDocument: boolean
  reason: string
}

/** Trigger mode for extraction */
export type TriggerMode = 'manual' | 'auto'
