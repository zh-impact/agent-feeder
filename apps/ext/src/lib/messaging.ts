import type { ExtractionResult, DocumentDetection } from './types'

type MessageType = 'extract' | 'detectDocument'

interface ContentMessage {
  type: MessageType
}

type MessageResponse = ExtractionResult | DocumentDetection

/** Send a message from popup to content script */
export async function sendToContentScript<K extends MessageType>(
  tabId: number,
  type: K,
): Promise<MessageResponse> {
  const message: ContentMessage = { type }
  return browser.tabs.sendMessage(tabId, message)
}

/** Register a message handler in the content script */
export function onContentScriptMessage<K extends MessageType>(
  type: K,
  handler: () => Promise<MessageResponse | null>,
): void {
  browser.runtime.onMessage.addListener((message: ContentMessage, _sender, sendResponse) => {
    if (message.type === type) {
      handler()
        .then(sendResponse)
        .catch((err) => {
          console.error(`[agent-feeder] Handler for ${type} failed:`, err)
          sendResponse({ error: err.message })
        })
      return true // keep channel open for async response
    }
  })
}
