# Adding Modules

When adding role-specific modules, follow this rule:

"If you add role-specific modules, keep them as reusable components/pages and render them from `dashboard.tsx` or from separate route pages. That will keep the codebase clean rather than stuffing everything into one file."

- Prefer one module per feature or role area.
- Keep dashboard behavior shallow by delegating work to child components.
- Use separate pages/routes when a module needs its own route and lifecycle.
- Avoid adding large role-specific logic directly inside `dashboard.tsx`.
- Reusable components should be extracted into `resources/js/components/` or `resources/js/pages/` as needed.
