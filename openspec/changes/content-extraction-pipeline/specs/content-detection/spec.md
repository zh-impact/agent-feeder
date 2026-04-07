## ADDED Requirements

### Requirement: URL-based detection
The detector SHALL classify pages as non-document based on URL patterns before examining DOM content.

#### Scenario: Root page
- **WHEN** the page URL path is "/" or empty
- **THEN** the detector SHALL return `isDocument: false` with reason "Root/home page"

#### Scenario: Search results page
- **WHEN** the page URL contains "/search", "?q=", or "?s="
- **THEN** the detector SHALL return `isDocument: false` with reason "Search results page"

#### Scenario: Non-HTML resource URL
- **WHEN** the page URL path ends with .json, .xml, .rss, or .atom
- **THEN** the detector SHALL return `isDocument: false` with reason "Non-HTML resource"

### Requirement: Meta tag detection
The detector SHALL classify pages as document based on meta tags indicating article content.

#### Scenario: Article published time meta tag
- **WHEN** the page contains a `<meta property="article:published_time">` tag
- **THEN** the detector SHALL return `isDocument: true` with reason containing "article:published_time"

#### Scenario: Open Graph article type
- **WHEN** the page contains `<meta property="og:type" content="article">`
- **THEN** the detector SHALL return `isDocument: true` with reason containing "og:type"

### Requirement: Semantic HTML detection
The detector SHALL classify pages as document based on semantic HTML elements.

#### Scenario: Article with time element
- **WHEN** the page contains both `<article>` and `<time datetime="...">` elements
- **THEN** the detector SHALL return `isDocument: true` with reason containing "<article>"

### Requirement: Word count detection
The detector SHALL use paragraph word count as a fallback signal.

#### Scenario: Insufficient text content
- **WHEN** the total word count across all `<p>` elements is less than 100
- **THEN** the detector SHALL return `isDocument: false` with reason containing "Too little text content"

#### Scenario: Sufficient text content
- **WHEN** the total word count across all `<p>` elements is 250 or more
- **THEN** the detector SHALL return `isDocument: true` with reason containing "Sufficient text content"
