# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Shopping Cart Migration Notes (Why SQLite Was Added)

### What changed

The backend database provider was switched from EF Core InMemory to EF Core SQLite for migration commands.

The key service registration now uses:

```csharp
options.UseSqlite("Data Source=shoppingcart.db");
```

### Why this was necessary

The InMemory provider is useful for simple runtime testing, but it is not a relational database provider.

EF Core migrations are built for relational providers because migrations generate relational schema operations such as:

- table creation
- foreign keys
- indexes
- constraints

When the project was using InMemory, EF tooling could build the project but failed during migration operations because migration services require a relational provider.

### How it works now

With SQLite configured:

1. EF can compare the current DbContext model against the last snapshot.
2. EF generates a migration file with schema operations (for example creating Carts and CartItems tables and their foreign keys).
3. EF applies those operations to a local SQLite database file named shoppingcart.db.

This enables the full migration workflow while keeping your cart models and API endpoint logic unchanged.

### Commands used

Run these from the backend folder:

```powershell
dotnet restore
dotnet ef migrations add AddShoppingCart
dotnet ef database update
```

### Outcome

The AddShoppingCart migration was created successfully and applied to the SQLite database, including:

- Carts table
- CartItems table
- foreign keys from CartItems to Carts and Products
- indexes on CartId and ProductId

## Cart API Mapping Strategy: Manual Mapping vs AutoMapper

For the shopping cart endpoints, we intentionally chose manual mapping instead of AutoMapper.

### Why we chose manual mapping

1. Cart responses include business-specific computed values, not just 1:1 property copies.
  - CartResponse totals are derived values (TotalItems, Subtotal, Total).
  - CartItemResponse includes LineTotal and flattened product fields.
2. The mapping logic is easy to read directly in the controller during M4 development.
3. With the current project size, manual mapping keeps behavior explicit and reduces hidden conventions.
4. It is simpler to debug because all transformation logic is visible at the endpoint level.

### Why not AutoMapper yet

1. AutoMapper provides the most value when there are many repetitive mappings.
2. In this codebase, mapping count is still small and highly custom for cart calculations.
3. Introducing profiles and mapping configuration now would add complexity with limited immediate payoff.

### Re-evaluation criteria

We should revisit AutoMapper when:

1. DTO mapping volume increases significantly across controllers.
2. Mapping logic becomes repetitive and mostly structural.
3. We want centralized mapping profiles with dedicated mapping tests.

