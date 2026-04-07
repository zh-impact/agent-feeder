import { useExtraction } from './hooks/useExtraction'

function App() {
  const { state, result, error, detection, triggerMode, extract, setTriggerMode } = useExtraction()

  return (
    <div className="w-[400px] min-h-[200px] p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">Agent Feeder</h1>
        <label className="flex items-center gap-2 text-xs text-gray-500">
          <span>{triggerMode === 'auto' ? 'Auto' : 'Manual'}</span>
          <button
            role="switch"
            aria-checked={triggerMode === 'auto'}
            onClick={() => setTriggerMode(triggerMode === 'auto' ? 'manual' : 'auto')}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
              triggerMode === 'auto' ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform ${
                triggerMode === 'auto' ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </label>
      </div>

      {/* Loading */}
      {state === 'loading' && (
        <div className="flex items-center justify-center py-8 text-gray-400">
          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Detecting page...
        </div>
      )}

      {/* Idle - show extract button */}
      {state === 'idle' && (
        <div className="flex flex-col items-center py-8 gap-3">
          <p className="text-sm text-gray-500">This page looks like a document</p>
          <button
            onClick={extract}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Extract Content
          </button>
        </div>
      )}

      {/* Extracting */}
      {state === 'extracting' && (
        <div className="flex items-center justify-center py-8 text-gray-400">
          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Extracting...
        </div>
      )}

      {/* Result */}
      {state === 'result' && result && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug">
            {result.title}
          </h2>
          {result.byline && <p className="text-xs text-gray-500">{result.byline}</p>}
          {result.siteName && <p className="text-xs text-gray-400">{result.siteName}</p>}
          {result.excerpt && (
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {result.excerpt}
            </p>
          )}
          {result.content && (
            <p
              className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed prose"
              dangerouslySetInnerHTML={{ __html: result.content }}
            />
          )}
          <div className="flex items-center gap-4 pt-2 border-t border-gray-100 dark:border-gray-700">
            <span className="text-xs text-gray-400">
              {result.textContentLength.toLocaleString()} characters
            </span>
            <button
              onClick={extract}
              className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
            >
              Re-extract
            </button>
          </div>
        </div>
      )}

      {/* Non-document */}
      {state === 'non-document' && detection && (
        <div className="flex flex-col items-center py-8 gap-2">
          <div className="text-2xl">&#128196;</div>
          <p className="text-sm text-gray-500 text-center">
            This page does not appear to be a document
          </p>
          <p className="text-xs text-gray-400">{detection.reason}</p>
          <button
            onClick={extract}
            className="mt-2 text-xs text-blue-600 hover:text-blue-700 transition-colors"
          >
            Force extract anyway
          </button>
        </div>
      )}

      {/* Error */}
      {state === 'error' && (
        <div className="flex flex-col items-center py-8 gap-3">
          <div className="text-2xl">&#9888;&#65039;</div>
          <p className="text-sm text-red-600 text-center">{error}</p>
          <button
            onClick={extract}
            className="mt-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  )
}

export default App
