# Requirements Document

## Introduction

This feature adds a category-based navigation layer to the "Reservar Espacios" (Space Reservation) section of the DashboardView. When a user visits or clicks on the space reservation section, they will see three category tiles — Laboratorios, Salas de Auditorio, and Canchas — instead of a flat list. Clicking a category expands it to show its available spaces. This improves discoverability and reduces cognitive load when many spaces are listed.

## Glossary

- **Dashboard**: The main authenticated user view at `DashboardView.vue`.
- **Category_Panel**: The UI section that displays the three space category tiles.
- **Category_Section**: An expandable/collapsible container for a single space category's spaces.
- **Space_Card**: The existing card component that displays a single reservable space.
- **Space_Category**: One of three groupings: `Laboratorios`, `Salas de Auditorio` (mapped from backend type `Salas`), or `Canchas`.
- **Active_Category**: The currently expanded Category_Section.
- **Reservas_Tab**: The `reservas` tab inside the Dashboard.

---

## Requirements

### Requirement 1: Display Category Tiles on the Reservas Tab

**User Story:** As a student, I want to see the three space categories clearly when I open the reservation section, so that I can quickly locate the type of space I need.

#### Acceptance Criteria

1. WHEN the user navigates to the Reservas_Tab, THE Category_Panel SHALL display exactly three category tiles: Laboratorios, Salas de Auditorio, and Canchas.
2. THE Category_Panel SHALL render the category tiles before showing any Space_Card list.
3. WHEN no category is selected, THE Category_Panel SHALL show all three tiles in an unselected state.
4. THE Category_Panel SHALL display a representative icon and label for each Space_Category tile.

---

### Requirement 2: Expand a Category to Show Its Spaces

**User Story:** As a student, I want to click a category and see only the spaces that belong to it, so that I don't have to scroll through unrelated spaces.

#### Acceptance Criteria

1. WHEN the user clicks a category tile, THE Category_Section SHALL expand and display only the Space_Cards belonging to that Space_Category.
2. WHEN a Category_Section is expanded, THE Dashboard SHALL visually highlight the selected category tile to indicate it is active.
3. WHEN the user clicks the same active category tile again, THE Category_Section SHALL collapse and return to the all-tiles view.
4. WHEN the user clicks a different category tile while one Category_Section is already expanded, THE Dashboard SHALL collapse the current Active_Category and expand the newly selected one.

---

### Requirement 3: Category-Scoped Search and Filtering

**User Story:** As a student, I want the existing search filters to apply only within the selected category, so that my results remain focused on the relevant space type.

#### Acceptance Criteria

1. WHILE a Category_Section is expanded, THE Dashboard SHALL apply existing search filters (nombre, capacidad_min, capacidad_max) only to spaces within that Space_Category.
2. WHILE a Category_Section is expanded, the tipo filter SHALL be locked to the Active_Category's type and SHALL NOT be editable by the user.
3. WHEN a Category_Section is collapsed, THE Dashboard SHALL reset the tipo filter and restore all filter controls to their previous state.

---

### Requirement 4: Empty State per Category

**User Story:** As a student, I want to see a meaningful message when a category has no available spaces, so that I know to look elsewhere.

#### Acceptance Criteria

1. WHEN a Category_Section is expanded and contains zero Space_Cards after filtering, THE Category_Section SHALL display a message indicating no spaces are available for that category.
2. THE Category_Panel SHALL display the count of available spaces next to each category tile label.
3. IF the space list fails to load, THEN THE Category_Panel SHALL display an error message and SHALL NOT show category tiles with stale counts.

---

### Requirement 5: State Persistence Within Session

**User Story:** As a student, I want the expanded category to remain open when I return to the Reservas tab during the same session, so that I don't have to re-select my category after browsing a space detail.

#### Acceptance Criteria

1. WHEN the user navigates away from the Reservas_Tab and returns within the same session, THE Dashboard SHALL restore the previously Active_Category if one was selected.
2. WHEN the user performs a full page reload, THE Dashboard SHALL display the Category_Panel with no Active_Category selected.
