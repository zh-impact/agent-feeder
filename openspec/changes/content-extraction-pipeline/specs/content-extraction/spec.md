## ADDED Requirements

### Requirement: Document cloning before extraction
The extractor SHALL clone the document before passing it to Readability to prevent live DOM mutation.

#### Scenario: Page DOM preserved after extraction
- **WHEN** Readability extraction completes
- **THEN** the original page DOM SHALL remain intact and unmodified

### Requirement: Extraction with detection gate
The extractor SHALL run document detection before extraction unless forced.

#### Scenario: Non-document page extraction blocked
- **WHEN** `extractFromDocument` is called without `force: true` on a non-document page
- **THEN** the extractor SHALL return `null` without running Readability

#### Scenario: Force extraction bypasses detection
- **WHEN** `extractFromDocument` is called with `force: true` on any page
- **THEN** the extractor SHALL skip document detection and attempt Readability directly

### Requirement: Extraction result structure
The extractor SHALL return a structured result with article metadata.

#### Scenario: Successful extraction
- **WHEN** Readability successfully parses a document page
- **THEN** the result SHALL include: url, title, byline, excerpt, content (HTML), textContentLength, siteName, language, extractedAt

#### Scenario: Readability parse failure
- **WHEN** Readability.parse() returns null or throws an error
- **THEN** the extractor SHALL return `null`

### Requirement: Content script message handling
The content script SHALL respond to extraction requests from the popup.

#### Scenario: Extract message
- **WHEN** the content script receives an "extract" message
- **THEN** it SHALL run `extractFromDocument` with `force: true` and return the result

#### Scenario: Detect document message
- **WHEN** the content script receives a "detectDocument" message
- **THEN** it SHALL return the document detection result for the current page

### Requirement: Auto-extraction on page load
The content script SHALL automatically extract content when configured to auto mode.

#### Scenario: Auto mode triggers extraction
- **WHEN** the trigger mode is "auto" and the content script loads on a page
- **THEN** it SHALL wait 1 second then run extraction, caching the result in memory
