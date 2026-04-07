## Context

The browser extension (`apps/ext`) has a basic content script that runs Readability on every page. This needs to become a proper pipeline with document detection, configurable triggers, and popup-based result preview. The extension runs under Chrome MV3 using WXT.

Current state:
- Content script runs Readability on all URLs at `document_end`, logging results
- No document type detection
- No user configuration
- No popup integration
- Background script is a stub

## Goals / Non-Goals

**Goals:**
- Detect document-type pages before extraction to avoid wasting resources
- Support manual and automatic extraction trigger modes
- Display extraction results in the popup with key metadata
- Maintain a clean module structure under `src/lib/` for testability

**Non-Goals:**
- Content transformation or formatting for AI consumption (future change)
- Cross-tab result aggregation
- Result export/download functionality
- Content script UI (floating panel, sidebar, etc.)

## Decisions

### 1. No extra messaging library — native `browser.tabs.sendMessage`

**Decision**: Use native WebExtension messaging APIs with lightweight typed wrappers instead of `@webext-core/messaging`.

**Rationale**: Only 2 message types (`extract`, `detectDocument`) between popup and content script. The overhead of an extra dependency isn't justified for this scope. Typed wrappers in `messaging.ts` provide sufficient safety.

**Alternative considered**: `@webext-core/messaging` — provides type-safe protocol maps but adds 3 dependencies and ~2KB. Would be worthwhile if message complexity grows.

### 2. No background relay — direct popup↔content communication

**Decision**: Popup communicates directly with content script via `browser.tabs.sendMessage`. Config is read/written via WXT `storage.defineItem` which works in any extension context.

**Rationale**: The background script adds no value for this feature — storage is accessible everywhere, and `tabs.sendMessage` directly reaches the content script. Keeping background minimal avoids unnecessary indirection.

**Alternative considered**: Background as message relay/cache — cleaner separation but adds latency and complexity for no practical benefit at this scale.

### 3. Document cloning before Readability

**Decision**: Always clone the document with `document.cloneNode(true)` before passing to Readability.

**Rationale**: Readability mutates the document it receives (removes scripts, styles, non-content nodes). Without cloning, the live page DOM gets destroyed, leaving users with a blank page.

### 4. Layered detection heuristics (cheap first)

**Decision**: Run heuristics in order of cost: URL patterns → meta tags → semantic HTML → word count.

**Rationale**: Most rejections (home pages, search pages) can be determined from the URL alone, avoiding DOM queries entirely. Expensive word count analysis only runs if cheaper signals are inconclusive.

### 5. Content script caches result in memory

**Decision**: Keep last extraction result in a module-level variable in the content script, not in storage.

**Rationale**: The content script persists as long as the page is open. When the popup re-opens, it sends a fresh `detectDocument` + `extract` request. This avoids storage overhead and stale data concerns. If the content script was killed (page unloaded), a fresh extraction is appropriate anyway.

## Risks / Trade-offs

- **[Detection false negatives]** Some document pages may not match any heuristic (e.g., plain HTML docs without meta tags or semantic elements) → Mitigated by word count fallback; users can force-extract from the popup UI
- **[Memory usage]** Cloning the document doubles DOM memory temporarily → Acceptable since extraction is a one-shot operation; cloned doc is garbage-collected after extraction
- **[Content script not injected]** On `chrome://`, `about:`, or restricted pages, no content script runs → Popup catches the messaging error and shows a user-friendly message
- **[Readability performance on large pages]** Very large DOMs may cause noticeable delay → `charThreshold: 500` filters out low-content results quickly; extraction only runs when user-triggered or auto-mode is on
