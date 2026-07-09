# Tasks: space-reservation-categories

## Implementation Tasks

- [x] 1. Add reactive state and computed properties to DashboardView
  - [x] 1.1 Add `activeCategory: null` and `_savedCategory: null` to data()
  - [x] 1.2 Add `categoriasPanel` computed (3 tile descriptors with count/availableCount from `spaces`)
  - [x] 1.3 Add `activeCategoryMeta` computed (descriptor for active tile or null)
  - [x] 1.4 Add `espaciosCategoriaActiva` computed (espaciosFiltrados scoped to active category)

- [x] 2. Add and modify methods
  - [x] 2.1 Add `selectCategory(key)` method (toggle/switch activeCategory and filtros.tipo, call aplicarFiltros)
  - [x] 2.2 Modify `limpiarFiltros()` to preserve filtros.tipo when activeCategory !== null
  - [x] 2.3 Modify `watch: activeTab` to save activeCategory on leave and restore _savedCategory on return

- [-] 3. Update Reservas tab template
  - [ ] 3.1 Replace the `<!-- Results -->` block with Category_Panel (3 tiles) shown when activeCategory === null
  - [ ] 3.2 Add Category_Section (back button + space cards grid) shown when activeCategory !== null
  - [ ] 3.3 Lock tipo filter: replace select with read-only pill when activeCategory !== null
