## Why

The extension's content script currently runs Readability on every page and logs the result — no detection logic, no user control, no way to preview results. We need a proper content extraction pipeline that intelligently detects document-type pages, lets users choose between auto/manual extraction, and displays results in the popup UI.

## What Changes

- Add document type detection heuristics (URL patterns, meta tags, semantic HTML, word count) to avoid running Readability on non-document pages
- Add configurable trigger mode (auto or manual) persisted via WXT storage
- Add popup UI showing extraction results (title, byline, excerpt, content preview, character count)
- Add typed messaging layer between content script and popup (`browser.tabs.sendMessage`)
- Add `src/lib/` module structure for testable, reusable logic

## Capabilities

### New Capabilities
- `content-detection`: Detect whether a page is a document-type page using layered heuristics
- `content-extraction`: Extract article content from document pages using Readability with document cloning
- `extraction-config`: Persist user preferences (auto/manual trigger mode) via WXT storage

### Modified Capabilities
(none — this is the first feature)

## Impact

- **New files**: `src/lib/types.ts`, `src/lib/storage.ts`, `src/lib/detector.ts`, `src/lib/extractor.ts`, `src/lib/messaging.ts`, `src/entrypoints/popup/hooks/useExtraction.ts`, `__tests__/detector.test.ts`, `__tests__/extractor.test.ts`
- **Modified files**: `src/entrypoints/content.ts`, `src/entrypoints/popup/App.tsx`, `src/entrypoints/popup/style.css`, `tsconfig.json`
- **New dev dependency**: `jsdom` (for unit tests)
- **Dependencies**: `@mozilla/readability` already installed
