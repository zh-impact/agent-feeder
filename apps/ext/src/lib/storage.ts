import type { TriggerMode } from './types'

export const triggerModeItem = storage.defineItem<TriggerMode>('local:triggerMode', {
  fallback: 'manual',
})
