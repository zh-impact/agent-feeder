import { useState, useEffect, useRef, useCallback } from 'react'
import type { ExtractionResult, DocumentDetection, TriggerMode } from '@/lib/types'
import { sendToContentScript } from '@/lib/messaging'
import { triggerModeItem } from '@/lib/storage'

type ExtractionState = 'loading' | 'idle' | 'extracting' | 'result' | 'error' | 'non-document'

interface UseExtractionReturn {
  state: ExtractionState
  result: ExtractionResult | null
  error: string
  detection: DocumentDetection | null
  triggerMode: TriggerMode
  extract: () => Promise<void>
  setTriggerMode: (mode: TriggerMode) => Promise<void>
}

export function useExtraction(): UseExtractionReturn {
  const [state, setState] = useState<ExtractionState>('loading')
  const [result, setResult] = useState<ExtractionResult | null>(null)
  const [error, setError] = useState('')
  const [detection, setDetection] = useState<DocumentDetection | null>(null)
  const [triggerMode, setTriggerModeState] = useState<TriggerMode>('manual')
  const tabIdRef = useRef<number | null>(null)

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
      if (!tab?.id) {
        setState('error')
        setError('Cannot access current tab')
        return
      }
      tabIdRef.current = tab.id

      const mode = await triggerModeItem.getValue()
      setTriggerModeState(mode)

      // Try to get cached result from content script
      try {
        const cached = await sendToContentScript(tab.id, 'extract')
        if (cached && 'textContentLength' in cached) {
          setResult(cached as ExtractionResult)
          setState('result')
          return
        }
      } catch {
        // No cached result, continue to detect
      }

      // Detect document type
      const det = (await sendToContentScript(tab.id, 'detectDocument')) as DocumentDetection
      setDetection(det)
      setState(det.isDocument ? 'idle' : 'non-document')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize')
      setState('error')
    }
  }

  const extract = useCallback(async () => {
    if (!tabIdRef.current) return
    setState('extracting')
    try {
      const res = (await sendToContentScript(tabIdRef.current, 'extract')) as ExtractionResult
      setResult(res)
      setState('result')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Extraction failed')
      setState('error')
    }
  }, [])

  const setTriggerMode = useCallback(async (mode: TriggerMode) => {
    await triggerModeItem.setValue(mode)
    setTriggerModeState(mode)
  }, [])

  return { state, result, error, detection, triggerMode, extract, setTriggerMode }
}
