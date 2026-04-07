import { extractFromDocument } from '@/lib/extractor'
import { detectDocument } from '@/lib/detector'
import { onContentScriptMessage } from '@/lib/messaging'
import { triggerModeItem } from '@/lib/storage'

// Keep last extraction result in memory for popup to retrieve
let lastResult: Awaited<ReturnType<typeof extractFromDocument>> = null

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',

  async main() {
    onContentScriptMessage('extract', async () => {
      const result = extractFromDocument(document, { force: true })
      if (!result) {
        throw new Error('Could not extract content from this page')
      }
      lastResult = result
      return result
    })

    onContentScriptMessage('detectDocument', async () => {
      return detectDocument(document)
    })

    // Auto-extract if configured
    try {
      const triggerMode = await triggerModeItem.getValue()
      if (triggerMode === 'auto') {
        setTimeout(() => {
          const result = extractFromDocument(document)
          if (result) {
            lastResult = result
            console.log('[agent-feeder] Auto-extracted:', result.title)
          }
        }, 1000)
      }
    } catch (e) {
      console.error('[agent-feeder] Auto-extract failed:', e)
    }
  },
})
