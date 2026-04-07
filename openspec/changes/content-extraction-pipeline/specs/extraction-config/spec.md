## ADDED Requirements

### Requirement: Trigger mode storage
The extension SHALL persist the trigger mode preference using WXT storage.

#### Scenario: Default trigger mode
- **WHEN** no trigger mode has been set
- **THEN** the storage SHALL default to "manual"

#### Scenario: Trigger mode persistence
- **WHEN** the user changes the trigger mode
- **THEN** the new mode SHALL be persisted to `browser.storage.local` and available across extension restarts

### Requirement: Popup trigger mode toggle
The popup SHALL provide a toggle to switch between manual and auto trigger modes.

#### Scenario: Toggle to auto mode
- **WHEN** the user clicks the toggle to enable auto mode
- **THEN** the mode SHALL be updated to "auto" and persisted to storage

#### Scenario: Toggle to manual mode
- **WHEN** the user clicks the toggle to enable manual mode
- **THEN** the mode SHALL be updated to "manual" and persisted to storage
