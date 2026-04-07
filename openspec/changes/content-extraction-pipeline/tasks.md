## 1. Foundation

- [x] 1.1 Create `src/lib/types.ts` with ExtractionResult, DocumentDetection, TriggerMode types
- [x] 1.2 Create `src/lib/storage.ts` with WXT `storage.defineItem` for triggerMode (default: "manual")
- [x] 1.3 Add `jsdom` dev dependency for unit tests
- [x] 1.4 Exclude `__tests__/` from tsconfig.json

## 2. Document Detection

- [x] 2.1 Create `src/lib/detector.ts` with layered heuristics: URL patterns → meta tags → semantic HTML → word count
- [x] 2.2 Create `__tests__/detector.test.ts` with tests for all detection signals (8 scenarios)

## 3. Content Extraction

- [x] 3.1 Create `src/lib/extractor.ts` with `extractFromDocument(doc, options?)` pure function
- [x] 3.2 Implement document cloning before Readability to prevent DOM mutation
- [x] 3.3 Create `__tests__/extractor.test.ts` with mocked Readability (4 scenarios)

## 4. Messaging

- [x] 4.1 Create `src/lib/messaging.ts` with `sendToContentScript(tabId, type)` and `onContentScriptMessage(type, handler)` typed wrappers
- [x] 4.2 Support message types: `extract` and `detectDocument`

## 5. Content Script

- [x] 5.1 Rewrite `src/entrypoints/content.ts` with message handlers for `extract` and `detectDocument`
- [x] 5.2 Add auto-extraction logic: read triggerMode from storage, extract after 1s delay when auto

## 6. Popup UI

- [x] 6.1 Create `src/entrypoints/popup/hooks/useExtraction.ts` hook with state machine (loading → idle/non-document → extracting → result/error)
- [x] 6.2 Rewrite `src/entrypoints/popup/App.tsx` with extraction result preview, trigger mode toggle, and state views
- [x] 6.3 Update `src/entrypoints/popup/style.css` with Tailwind CSS base styles

## 7. Verification

- [x] 7.1 Run `pnpm --filter @repo/ext test:run` — all 11 tests pass
- [x] 7.2 Run `pnpm --filter @repo/ext compile` — TypeScript type check passes
- [ ] 7.3 Manual E2E: `pnpm --filter @repo/ext dev`, load in Chrome, test on article page and non-article page
- [ ] 7.4 Manual E2E: toggle auto mode, navigate to article, verify auto-extraction works
