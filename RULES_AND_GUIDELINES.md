# Rules and Guidelines

## Module Architecture Rule
"Keep role-specific modules as reusable components/pages rendered from `dashboard.tsx` or separate route pages. Never stuff multiple modules or large role conditionals into a single file."

---

## Frontend Rules
- Prefer one module per feature or role area.
- Keep `dashboard.tsx` shallow — delegate all role-specific content to child components in `resources/js/components/dashboard/`.
- Use separate pages and routes when a module needs its own route and lifecycle.
- New module pages go in `resources/js/pages/Modules/{ModuleName}/`.
- Reusable components go in `resources/js/components/` — not inside module page folders.
- Use the shared `Pagination.tsx` for all paginated views. Never create module-specific pagination components.
- All frontend route calls must use **Laravel Wayfinder** typed functions. No hardcoded URL strings.
- Run `php artisan wayfinder:generate` after registering any new backend routes.
- **Never manually wrap page components in `<AppLayout>`**. The layout is auto-applied by `app.tsx` via the `layout` resolver. Wrapping manually causes double-wrapping (double header/sidebar). Pages must render with a fragment (`<>...</>`) and use a static `.layout` property for breadcrumbs: `Index.layout = { breadcrumbs: [...] }`. Check existing module pages (e.g., `Personnel/Index.tsx`) for the correct pattern.
- **Dropdown/Combobox Truncation**: All dropdown triggers (`SelectTrigger`) and list items (`SelectItem`) must handle long content by truncating with an ellipsis (`...`). They must never overlap other UI components or expand the container horizontally beyond its intended bounds. Use `w-full` for form inputs to maintain consistent alignment.

- **State Refresh Rule**: Whenever a module's subpage or main page changes anything in the database (e.g., creating, updating, deleting), ensure that the whole module is refreshed whenever a user goes back to the main route (e.g., `/personnel`). This eliminates the need to manually refresh the page. Keep the existing redirection/navigation behavior of pages intact (e.g., achieve this by clearing Inertia history using `router.clearHistory()` on successful form submissions so that clicking 'back' forces a fresh data fetch).

---

## UI Feedback & Interaction
- **Immediate Feedback**: Always provide immediate visual feedback for user actions.
- **Toast Notifications**: Use `sonner` for toast notifications after successful data-modifying operations (POST, PUT, DELETE).
    - Example: `toast.success('Employee updated successfully');`
    - Implementation: Call `toast` within the `onSuccess` callback of Inertia `router` or `useForm` methods.
- **Scroll Position**: Use `preserveScroll: true` in the router options for operations that shouldn't reset the page scroll, such as inline updates in a table.
- **Form States**: Ensure submit buttons are disabled and show a loading state (e.g., `processing` from `useForm`) during form submission.
- **Scroll Bleeding & Wheel Events**: When preventing scroll bleed (e.g., inside a custom scrolling component like a calendar), avoid using React's synthetic `onWheel` event because React 17+ attaches passive listeners to the document root, causing `e.preventDefault()` to be ignored. Instead, use a `useEffect` hook to attach a native event listener with `{ passive: false }`.
- **Radix UI Nested Modals**: When rendering a Radix Popover (like a Select, Combobox, or Color Picker) from inside a Radix Dialog (which locks body scroll via `react-remove-scroll`), always set `modal={true}` on the `<Popover>` component. This allows the Popover to establish its own scroll lock layer so internal scrolling works correctly within its Portal.

---

## Common Components & Patterns
- **EmployeeSearch Component**:
    - When using `EmployeeSearch.tsx` for searching users in the backend, always implement **keyword-splitting logic** in the controller.
    - Instead of a single `where like` query, split the search string by spaces and iterate through the keywords.
    - Each keyword must be checked against `first_name`, `last_name`, and `employee_number` using a nested `where` closure.
    - Use `ilike` (PostgreSQL case-insensitive) instead of `like` for search queries.
    - This ensures that searching for a full name (e.g., "John Doe") correctly finds users whose names are split across columns.
    - Example implementation can be found in `UserRoleController@index` or `LeaveController@index`.

---

## Backend Rules
- Module controllers go in `app/Modules/{ModuleName}/Controllers/` — never in `app/Http/Controllers/`.
- Module routes go in `app/Modules/{ModuleName}/routes.php` — auto-registered by `ModuleServiceProvider`.
- **Route Security**: Always wrap internal module routes in the `auth` middleware inside `routes.php` (e.g., `Route::middleware('auth')->group(...)`). Do not rely solely on `$this->authorize()` in controllers, as unauthenticated guests will trigger fatal 500 errors if the middleware is missing.
- **Rate Limiting**: Always apply the `throttle` middleware to authentication, login, or sensitive endpoints to prevent brute-force attacks.
- **Never** manually `require` module routes in `web.php`. `routes/web.php` contains core auth and dashboard routes only.
- Business logic goes in a Service class under `app/Modules/{ModuleName}/Services/` — keep controllers thin.
- Validation goes in Form Request classes under `app/Modules/{ModuleName}/Requests/` — never validate inside controllers.
- **Input Filtering**: Never pass `$request->all()` directly to services, even for benign filter parameters. Always explicitly extract the expected keys using `$request->only(['search', 'status', 'from_date', 'to_date', ...])` to prevent unexpected parameter injection.
- **Performance**: `Model::preventLazyLoading(!app()->isProduction())` is enabled. You must use eager loading (`->with()`) to prevent N+1 queries; otherwise, the app will throw exceptions in local development.
- **Model Definition**: Use Laravel 13 PHP attributes (`#[Fillable]`, `#[Hidden]`) instead of protected properties.
- **Mass Assignment**: Security-sensitive fields like `password`, `remember_token`, and `email_verified_at` must **never** be included in the `#[Fillable]` attribute. Update them explicitly using `$model->forceFill(['password' => Hash::make(...)])->save()`.
- Real-world entity tables must use `softDeletes()`.
- **API Resources & Inertia**: When returning individual Eloquent models via Inertia, use `$resource->resolve()` (e.g., `UserResource::make($user)->resolve()`) instead of globally disabling wrapping (`JsonResource::withoutWrapping()`). This ensures the frontend receives a flattened object (no `data` wrapper) for individual records, while allowing paginated collections to maintain their expected wrapper structure natively.
- **PII Protection & Audit Logs**: Encrypt highly sensitive PII fields (like `monthly_salary`, `tin_number`) using Laravel's `encrypted` cast. To prevent these encrypted fields from leaking in plain text via system audit logs, you must implement the `beforeActivityLogged(\Spatie\Activitylog\Models\Activity $activity)` method on the Eloquent model to explicitly redact sensitive keys from `$activity->attribute_changes`.
- Each module that needs a sidebar link must include `app/Modules/{ModuleName}/navigation.php`. Read `ModuleServiceProvider.php` and an existing `navigation.php` (e.g. Attendance) before writing a new one to match the expected format.

---

## Migration Guidelines
- **PostgreSQL for all environments.** Local development uses PostgreSQL via Docker Compose (Laravel Sail). Production uses PostgreSQL via Supabase. Tests run against PostgreSQL (`phpunit.xml` sets `DB_CONNECTION=pgsql`).
- **Supabase / Database Security**: Keep RLS (Row Level Security) enabled with NO policies for Laravel backend-only setups. This default-denies all external/public PostgREST API access while allowing the Laravel backend (which connects via connection string) full access. Ignore "RLS Enabled No Policy" lint warnings. Never grant `EXECUTE` on `SECURITY DEFINER` functions to the `anon` or `public` roles unless intentionally exposing an unauthenticated endpoint.
- All migrations must be PostgreSQL-compatible. Never use SQLite-only column types or syntax.
- Safe column types: `string()`, `text()`, `boolean()`, `date()`, `timestamp()`, `json()`, `unsignedBigInteger()`.
- Always define foreign key constraints explicitly — do not rely on naming conventions.
- Use `softDeletes()` on tables representing real-world entities (employees, leave requests, attendance records, etc.).
- Lookup tables (`leave_types`, `divisions`, `positions`, `employment_statuses`, etc.) must never be hard deleted — use `is_active = false` to deactivate.
- Never store structured data as a plain string column if it will be referenced by other tables or used in reports — use a lookup table.
- Always add `unique()` constraints at the database level for fields that must be unique (e.g. `employee_number`, `email`) — do not rely on validation alone.
- Use `ilike` for case-insensitive search queries — never rely on SQLite `like` behavior.

---

## Shared Props & Background Tasks
- Never add module-specific data to `HandleInertiaRequests.php` global shared props.
- **Lazy Loading**: Use closures in `HandleInertiaRequests.php` for any global prop that requires a database query to ensure it only runs when needed.
- **Background Mutations**: For operations that don't need full page navigation or reloads (e.g., status updates, marking as read), use the Inertia v3 **`useHttp`** hook instead of `router.post()`.
- Pass module data via individual Inertia page responses in the controller.
- Changes to `HandleInertiaRequests.php` must be deliberate and affect all pages — not one module.

---

## Permission Naming Convention
- Use dot notation: `module.action` (e.g. `attendance.clock`, `personnel.view`, `leave.manage`).
- Always seed permissions in `RoleAndPermissionSeeder` — never hardcode role checks in controllers.
- Use route middleware (`permission:module.action`) for route-level protection.
- Use `authorize()` in Form Requests for request-level permission checks.

---

## Testing Guidelines
- All tests run against **PostgreSQL** (configured in `phpunit.xml`). Never assume SQLite behavior.
- Feature tests use `RefreshDatabase` (configured globally in `tests/Pest.php`).
- Module-specific tests go in `tests/Feature/Modules/` subdirectories where a dedicated subdirectory exists for that module. Standalone cross-cutting tests (e.g. `AttendanceHistoryTest.php`) may live directly under `tests/Feature/`.
- Use `ilike` instead of `like` in test assertions and search queries for PostgreSQL compatibility.
- CI runs via GitHub Actions (`tests.yml`) against a PostgreSQL service container.

---

## Security & Deployment Guidelines
- **Defense in Depth**: Always use `$this->authorize(...)` inside Controller methods, even if the route is already protected by route middleware (`permission:module.action`).
- **Server-Side HTML Sanitization**: Any rich-text content (e.g., from Tiptap editors like in Announcements) must be sanitized server-side (e.g. using `mews/purifier`) before being saved to the database. Client-side DOMPurify is not enough to prevent stored XSS attacks via API manipulation.
- **HTTP Security Headers**: The application must enforce security headers via middleware (e.g. `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `Referrer-Policy: strict-origin-when-cross-origin`).
- **Secure Sessions**: Ensure `SESSION_SECURE_COOKIE=true` is set in the production `.env` file since `config/session.php` does not default to `true`.
- **Spatie Permission Caching**: Always call `app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions()` in the service layer after explicitly creating or deleting roles. Spatie handles cache clearing on `syncPermissions()`, but not on model creation/deletion.
- **Production Caching**: Production deployment scripts MUST run `php artisan config:cache`, `route:cache`, `view:cache`, `event:cache`, and `permission:cache-reset`.
- **Data Isolation Scope**: When building HR actions (like Leave, Attendance, Document Requests), explicitly confirm the business requirement for cross-division scoping. If a role (e.g. `division_head`) should only see records within their division, you must explicitly enforce `$user->division_id === $target->division_id` in the controller or policy.
- **CSV Injection (Formula Injection)**: When exporting data to CSV, all user-controlled string fields (e.g., descriptions, names) must be sanitized. If a field starts with `=`, `+`, `-`, `@`, `\t`, `\r`, or `\n`, prefix it with a single quote (`'`) to prevent execution in spreadsheet software.

---

## Module Checklist
Before considering a module complete, verify:
- [ ] Routes are in `app/Modules/{ModuleName}/routes.php` (auto-registered, not in `web.php`)
- [ ] Controller is thin — delegates all logic to a Service class
- [ ] Validation uses Form Request classes — no validation in controllers
- [ ] Migration is PostgreSQL-compatible (see Migration Guidelines above)
- [ ] Lookup tables use `is_active` instead of hard deletes
- [ ] Real-world entity tables use `softDeletes()`
- [ ] Foreign key constraints are explicitly defined in migrations
- [ ] Wayfinder functions generated and used for all frontend route calls
- [ ] Frontend pages are under `resources/js/pages/Modules/{ModuleName}/`
- [ ] Shared `Pagination.tsx` used for paginated views
- [ ] No large conditionals added to `dashboard.tsx`
- [ ] Permissions seeded in `RoleAndPermissionSeeder` using dot notation
- [ ] `navigation.php` present and formatted correctly if module needs a sidebar link
- [ ] Success actions provide toast notifications via `sonner`
- [ ] `php artisan migrate:fresh --seed` runs cleanly with no errors
- [ ] All Pest tests pass (`php artisan test --compact --filter={ModuleName}`)
- [ ] `vendor/bin/pint --dirty --format agent` run on all PHP files
- [ ] `npm run build` completes with no errors

---

## UI Conventions
- **Fluid layouts** (`w-full`) for module indexes and data-heavy tables — avoid restrictive `max-w-*` containers for these views.
- **Debounced search**: 500ms debounce + instant Enter key trigger across all search inputs.
- **Pagination**: Always use the shared `Pagination.tsx` component with `meta` prop for "Showing X to Y of Z" info.
- **Employee Search**: Use the shared `EmployeeSearch.tsx` component for employee selection/filtering with autocomplete.
- **Error display**: Use `alert-error.tsx` for alert-style error banners and `input-error.tsx` for inline form field errors.
- **Icons**: Always use `lucide-react`. For dynamic icon rendering from strings, use `dynamic-icon.tsx`.
- **Management buttons**: Module management actions (e.g., "Manage Announcements", "Attendance Management") are rendered as in-module buttons (top-right of the module page), not as sidebar entries. They are gated by appropriate permissions (e.g., `announcements.manage`, `attendance.logs.manage`).
- **Inertia History Management**: For subpage forms (like `Create`/`Edit` pages), append `router.clearHistory()` to the `onSuccess` callback of mutations. This ensures that when a user navigates back to the main list via the browser's "Back" button, Inertia forces a fresh data fetch rather than loading a stale cache. This eliminates the need for manual page refreshes while preserving the expected redirection flows.
- **Toast Notifications**: Use `sonner` for immediate visual feedback after successful data-modifying operations (POST, PUT, DELETE). Use `toast.success('Message')` within the `onSuccess` callback.
- **Required Fields**: Visually highlight mandatory inputs with a red asterisk (*) beside the label.
- **Interactive Counters**: For simple numeric increments, use `+` and `-` button pairs with a **500ms debounce** to batch updates and prevent server-side race conditions or excessive load.
- **UI State Persistence**: Use `localStorage` to persist non-critical UI preferences, such as table column visibility, across browser reloads.
- **Card Styling**: Use `matte-card elev-2` classes for card containers throughout modules.

# 🧠 Agent UI/UX Design Rules

> A comprehensive ruleset for designing user interfaces and experiences.
> Grounded in the Laws of UX (lawsofux.com) and Laws of UI (uilaws.com).

---

## 📋 Table of Contents

1. [General Design Philosophy](#1-general-design-philosophy)
2. [Cognitive Load & Memory](#2-cognitive-load--memory)
3. [Visual Design Laws](#3-visual-design-laws)
4. [Gestalt Principles](#4-gestalt-principles)
5. [Interaction & Behavior](#5-interaction--behavior)
6. [Typography & Readability](#6-typography--readability)
7. [Color & Contrast](#7-color--contrast)
8. [Layout & Spacing](#8-layout--spacing)
9. [Navigation & Information Architecture](#9-navigation--information-architecture)
10. [Feedback & System Response](#10-feedback--system-response)
11. [Accessibility](#11-accessibility)
12. [Performance & Perception](#12-performance--perception)
13. [Code Efficiency & Anti-Bloat](#13-code-efficiency--anti-bloat)
14. [Important Specifications](#14-important-specifications)

---

## 1. General Design Philosophy

### Occam's Razor
- **Rule:** Always choose the simplest solution that works. Remove any element that does not serve a clear purpose.
- **Apply:** If two designs achieve the same goal, always ship the simpler one. Every added element must justify its existence.

### Light & Dark Mode Variants
- **Rule:** Every component or UI update must have light and dark mode variants or be visually acceptable for both modes.
- **Apply:** Test all UI changes in both themes. Use semantic color tokens (e.g., `text-foreground`, `bg-background`) that adapt automatically, or use `.dark` specific variants when custom colors are required. Avoid hardcoding colors that only work in one mode.
- **Strict Requirement:** Every element should adapt depending on the appearance (light/dark/system).

### Aesthetic-Usability Effect
- **Rule:** Users perceive visually pleasing designs as more usable, even when they are functionally identical to less attractive designs.
- **Apply:** Invest in aesthetics — clean layouts, consistent spacing, and refined visuals build user trust and perceived quality.

### Jakob's Law
- **Rule:** Users spend most of their time on *other* products. They expect your interface to work like the ones they already know.
- **Apply:** Follow established UI conventions (e.g., hamburger menus, back buttons, form patterns). Only deviate from convention when there is a strong, justified reason.

### Postel's Law (Robustness Principle)
- **Rule:** Be liberal in what you accept from users, and conservative in what you output.
- **Apply:** Accept flexible user inputs (varied date formats, typos, partial queries). Always return clean, well-structured, predictable output.

### Paradox of the Active User
- **Rule:** Users never read documentation — they start interacting immediately.
- **Apply:** Design for discoverability. UIs must be self-explanatory. Never rely on external docs to explain basic interactions.

---

## 2. Cognitive Load & Memory

### Cognitive Load
- **Rule:** Minimize the mental effort required to understand and use the interface.
- **Apply:**
  - Break complex tasks into smaller, sequential steps.
  - Use progressive disclosure — show only what is needed at each stage.
  - Avoid overwhelming users with too much information at once.

### Miller's Law
- **Rule:** The average person can hold ~7 (±2) items in working memory at one time.
- **Apply:**
  - Group related options together; never display more than 7 choices in a flat list.
  - Use chunking to organize long content into digestible sections.

### Chunking
- **Rule:** Breaking information into grouped, meaningful units aids comprehension and memory.
- **Apply:** Organize form fields, settings, and content into clearly labeled logical groups. Use visual separators (whitespace, dividers) between chunks.

### Working Memory
- **Rule:** Working memory is limited and volatile — users forget things quickly.
- **Apply:**
  - Persist user context across screens (e.g., show what step they are on).
  - Never make users memorize information from one screen to use on another.
  - Use inline validation and real-time feedback so users do not have to backtrack.

### Cognitive Bias
- **Rule:** Users are subject to systematic errors in judgment that affect how they perceive and interact with your interface.
- **Apply:**
  - Avoid dark patterns that exploit biases (e.g., anchoring, scarcity manipulation).
  - Design for rational decision-making: provide clear comparisons, transparent pricing, and neutral default options.

### Selective Attention
- **Rule:** Users focus only on a subset of stimuli — usually those relevant to their current goal.
- **Apply:**
  - Eliminate visual noise and irrelevant elements on task-critical screens.
  - Use visual hierarchy to guide the user's eye directly to what matters most.

---

## 3. Visual Design Laws

### Symmetry
- **Rule:** The human eye naturally perceives symmetrical elements as a single, unified whole.
- **Apply:** Use symmetrical layouts for balanced, professional-looking screens. Asymmetry should be intentional and used to create visual emphasis.

### Rule of Thirds
- **Rule:** Dividing a layout into a 3×3 grid and placing key elements along grid lines or intersections creates more balanced, visually engaging compositions.
- **Apply:** Position primary CTAs, hero images, and focal points along the rule-of-thirds grid rather than dead center.

### Von Restorff Effect (Isolation Effect)
- **Rule:** When multiple similar objects are present, the one that differs from the rest is most likely to be remembered.
- **Apply:**
  - Use visual differentiation (color, size, shape) to highlight the most important CTA on a screen.
  - Avoid making everything stand out — when everything is emphasized, nothing is.

### Law of Similarity
- **Rule:** The eye groups similar elements together into a complete picture, even when they are separated.
- **Apply:** Use consistent styles (same color, shape, size) for elements that belong to the same category or share similar behavior.

### Law of Prägnanz (Law of Good Form)
- **Rule:** Users interpret ambiguous or complex visuals in the simplest possible way.
- **Apply:** Simplify icons, illustrations, and layouts. Use clean, recognizable shapes. Avoid overly abstract or ambiguous visual metaphors.

### Dual-Mode Design Mandate
- **Rule:** Every element introduced to the interface — whether created from scratch or imported — must be explicitly designed for both light and dark mode appearances, ensuring full visual cohesion across system themes. Color values, borders, shadows, icons, and illustrations must never be hardcoded to a single appearance; instead, they must be defined in paired opposites (e.g., near-black on light / near-white on dark for text, elevated surfaces inverting accordingly) and must remain consistent with all other active design rules such as contrast ratios, hierarchy, and spacing. Any change made in one mode must be mirrored and validated in the other before it is considered complete.
- **Apply:** When assigning color to any element, always define both states:
  - **Text:** Use a dark tone (e.g., `#1A1A1A`) on light backgrounds and a light tone (e.g., `#F5F5F5`) on dark backgrounds.
  - **Surfaces:** Use white or light-neutral fills in light mode and deep-neutral or near-black fills in dark mode.
  - **Borders & dividers:** Use low-contrast darks in light mode and low-contrast lights in dark mode.
  - **Shadows:** Use dark semi-transparent drops in light mode; switch to subtle inner glows or lightened edges in dark mode.
  - **Icons & illustrations:** Ensure assets are either theme-adaptive (SVG with dynamic fills) or provided in two explicit variants — never rely on a single static asset to serve both modes.

---

## 4. Gestalt Principles

### Law of Proximity
- **Rule:** Objects near each other are perceived as grouped together.
- **Apply:**
  - Place related elements (labels + inputs, buttons + descriptions) close to each other.
  - Use spacing intentionally — larger gaps signal separation; tighter spacing signals relationship.

### Law of Common Region
- **Rule:** Elements sharing a defined boundary (e.g., a card, a box) are perceived as belonging to the same group.
- **Apply:** Use cards, panels, and containers to visually group related content. Do not mix unrelated content inside the same bounding region.

### Law of Uniform Connectedness
- **Rule:** Elements visually connected by lines or shapes are perceived as more related than unconnected elements.
- **Apply:** Use connector lines in flows, breadcrumbs in navigation, and step indicators in wizards to communicate relationship and sequence.

### Closure
- **Rule:** The human mind fills in missing parts to perceive a complete, familiar shape.
- **Apply:** You can use partial shapes or negative space in icons and illustrations — users will mentally complete them. This can create clean, minimal visual designs.

### Continuity
- **Rule:** Elements arranged along a line or curve are perceived as more related than those that are not.
- **Apply:** Align elements along a consistent axis. Use visual flow (arrows, progressive steps, scrolling direction) to guide users through a sequence.

---

## 5. Interaction & Behavior

### Fitts's Law
- **Rule:** The time to reach a target depends on the distance to it and its size. Larger, closer targets are easier to hit.
- **Apply:**
  - Make primary action buttons large and easy to tap/click.
  - Place frequently used controls close to where the user's attention already is.
  - On mobile, size touch targets to a minimum of 44×44px.
  - Place destructive actions (delete, cancel) away from primary actions to prevent mis-taps.

### Hick's Law
- **Rule:** Decision time increases with the number and complexity of choices.
- **Apply:**
  - Reduce the number of options on any screen. Prefer fewer, clearer choices.
  - Use progressive disclosure to hide advanced options until they are needed.
  - For onboarding flows, guide users through decisions one at a time.

### Choice Overload
- **Rule:** Presenting too many options causes decision paralysis and reduces satisfaction.
- **Apply:**
  - Cap dropdown menus and option lists where possible.
  - Offer smart defaults and recommendations to reduce the burden of choosing.
  - For e-commerce and data-heavy UIs, provide robust filtering and sorting.

### Goal-Gradient Effect
- **Rule:** Users increase their effort and motivation as they get closer to completing a goal.
- **Apply:**
  - Show progress bars, step counts, and completion percentages in multi-step flows.
  - Give users an early head start (e.g., pre-fill progress) to encourage completion.

### Zeigarnik Effect
- **Rule:** People remember incomplete tasks better than completed ones.
- **Apply:**
  - Use "Continue where you left off" patterns to re-engage users with unfinished tasks.
  - Surface incomplete items (empty states, partial profiles, draft content) to motivate completion.

### Peak-End Rule
- **Rule:** Users judge an experience by its most intense moment (peak) and how it ends — not by the average of all moments.
- **Apply:**
  - Design moments of delight at key peaks (successful checkout, task completion, first use).
  - End interactions on a positive note: success screens, confirmation messages, and appreciation copy matter.
  - Minimize painful moments — especially at the end of a flow (e.g., do not end with a confusing error).

### Parkinson's Law
- **Rule:** Work expands to fill the time available for its completion.
- **Apply:**
  - Set clear, reasonable time constraints for tasks where applicable (e.g., countdown timers, deadlines).
  - Do not over-engineer forms or flows — limit steps to what is strictly necessary.

---

## 6. Typography & Readability

### Typography Hierarchy
- **Rule:** A clear hierarchy in text sizes and styles guides users through content and improves comprehension.
- **Apply:**
  - Use at most 3–4 distinct text sizes: heading, subheading, body, caption.
  - Make hierarchy obvious — headings should be significantly larger than body text.
  - Use font weight (bold vs. regular) and color to reinforce hierarchy without adding new sizes.

### Readability Rules
- **Rule:** Text must be easy to read at a glance.
- **Apply:**
  - Body text: minimum 16px on web, 14px on mobile (with adequate line height).
  - Line length: 50–75 characters per line for body text (the optimal reading range).
  - Line height: 1.4–1.6× the font size for body copy.
  - Avoid all-caps for body text; reserve it for labels and short UI elements.
  - Left-align body text for most languages; avoid justified alignment on screen.

---

## 7. Color & Contrast

### Color Theory
- **Rule:** Colors evoke emotions and associations. Color combinations create harmony or discord.
- **Apply:**
  - Define a primary, secondary, and accent color palette — and stick to it.
  - Use color semantically: green = success, red = error/danger, yellow = warning, blue = information.
  - Never rely on color alone to communicate meaning — always pair with icons or text labels for accessibility.

### Contrast
- **Rule:** Elements that contrast with their surroundings attract attention and are more memorable.
- **Apply:**
  - Maintain a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text (WCAG AA standard).
  - Use high-contrast color for primary CTAs to make them unmissable.
  - Ensure interactive elements are visually distinct from non-interactive ones.
  - **Contrast is King:** Hover gradients must ALWAYS transform child texts to dark/black shades to maintain maximum accessibility.

---

## 8. Layout & Spacing

### White Space (Negative Space)
- **Rule:** Proper use of white space enhances readability, focus, and overall visual appeal.
- **Apply:**
  - Do not fear empty space — it gives content room to breathe and improves comprehension.
  - Use consistent spacing scales (e.g., 4px, 8px, 16px, 24px, 32px, 64px) for margin and padding.
  - Increase whitespace around important elements to give them visual weight.

### Consistency
- **Rule:** Consistent design elements across an interface enhance usability and reduce cognitive friction.
- **Apply:**
  - Use a design system or component library and never deviate from it without a documented reason.
  - Button sizes, colors, border radii, shadows, and spacing must be consistent throughout.
  - Interaction patterns (how modals open, how errors appear, how forms validate) must behave identically across all screens.

### Grid Systems
- **Rule:** Layouts built on a defined grid are more organized, predictable, and easier to scan.
- **Apply:**
  - Use a 12-column grid for web layouts; 4-column for mobile.
  - Align all elements to the grid. Avoid arbitrary positioning.
  - Apply the Rule of Thirds for hero sections and key marketing layouts.

---

## 9. Navigation & Information Architecture

### Mental Model
- **Rule:** Users approach your interface with a pre-existing mental model of how they expect it to work.
- **Apply:**
  - Structure navigation and terminology to match how users already think about the domain.
  - Conduct user research to understand existing mental models before designing flows.
  - If you must break a user's mental model, provide clear onboarding to establish a new one.

### Serial Position Effect
- **Rule:** Users best remember the first and last items in a list or sequence.
- **Apply:**
  - Place the most important navigation items first or last.
  - Put the primary CTA at the end of a form or onboarding flow.
  - Avoid burying critical actions in the middle of long lists or menus.

### Pareto Principle (80/20 Rule)
- **Rule:** Roughly 80% of effects come from 20% of causes.
- **Apply:**
  - Identify the 20% of features your users use 80% of the time — and optimize those ruthlessly.
  - Surface the most-used actions prominently; deprioritize or hide rarely-used ones.
  - Focus design and engineering effort on the highest-impact flows first.

---

## 10. Feedback & System Response

### Doherty Threshold
- **Rule:** Productivity peaks when the system responds in under 400ms. Delays above this break user flow.
- **Apply:**
  - Target interaction response times under 100ms for instant feel, under 400ms for acceptable.
  - For operations that take longer, show a progress indicator immediately (within 100ms of action).
  - Use optimistic UI updates where safe — update the UI before the server confirms to feel faster.

### Feedback Principles
- **Rule:** Users must always know the result of their actions.
- **Apply:**
  - Provide immediate visual feedback for every interaction (button press, form submit, toggle).
  - Use loading states, skeleton screens, and progress bars for async operations.
  - Show clear success and error states — never leave the user in an ambiguous state.
  - Inline validation on forms should trigger on blur (not on every keystroke).

### Flow State
- **Rule:** When users are fully immersed and in a state of flow, their productivity and satisfaction are highest.
- **Apply:**
  - Minimize interruptions (modals, popups, notifications) during task-critical flows.
  - Remove unnecessary confirmation dialogs unless the action is destructive and irreversible.
  - Design task flows to be linear and uninterrupted where possible.

---

## 11. Accessibility

### Core Accessibility Rules
- **Rule:** Interfaces must be usable by people with a wide range of abilities.
- **Apply:**
  - All interactive elements must be keyboard-navigable with visible focus indicators.
  - All images must have descriptive `alt` text.
  - Form fields must have visible, associated labels — never use placeholder text as a label substitute.
  - Color must never be the sole indicator of meaning (see Color Theory above).
  - Support screen readers by using semantic HTML and proper ARIA roles where necessary.
  - Minimum touch target size: 44×44px (Fitts's Law applied to accessibility).

### Inclusive Design
- **Rule:** Design for the edges — when you design for users with the most constraints, you improve the experience for everyone.
- **Apply:**
  - Design for low-bandwidth and offline-first where applicable.
  - Avoid motion-heavy animations for users who prefer reduced motion (`prefers-reduced-motion`).
  - Support dynamic font sizes (do not hardcode px for text — use relative units like `rem`).

---

## 12. Performance & Perception

### Perceived Performance
- **Rule:** How fast the interface *feels* is as important as how fast it actually is.
- **Apply:**
  - Use skeleton screens instead of spinners for content loading.
  - Load above-the-fold content first; defer everything else.
  - Add subtle animations and transitions to mask loading latency and make the UI feel alive.
  - Never show a blank screen — always show something immediately.

### Tesler's Law (Law of Conservation of Complexity)
- **Rule:** Every system has an irreducible amount of complexity. It cannot be eliminated — only transferred.
- **Apply:**
  - Absorb complexity into the system so the user does not have to deal with it.
  - Smart defaults, auto-fill, and intelligent suggestions reduce complexity for the user by shifting it to the backend.
  - Do not oversimplify to the point of removing necessary control from power users.

---

## 13. Code Efficiency & Anti-Bloat

### Prevent Code Bloating
- **Rule:** Every line of UI code must justify its existence. Redundant markup, duplicated utility classes, and re-implemented existing components are treated as bugs, not style.
- **Apply:**
  - **Reuse before you write.** Before adding any new component, class, or style block, check the existing component inventory (`FRONTEND_MODIFICATIONS_GUIDE.md §3`) and the design token system (`app.css`). If something already does the job, use it.
  - **Deduplicate Tailwind classes.** Never repeat the same utility class on the same element. Conflicting or overriding classes (e.g., `p-4 p-6` on one element) must be resolved immediately.
  - **Use `cn()` for conditional classes.** Never concatenate class strings manually — it produces duplicates and conflicts that are invisible at a glance but break the rendered output.
  - **CSS tokens over inline values.** Never hardcode a spacing, color, radius, or shadow value that already has a corresponding CSS custom property or Tailwind token. Hardcoded values fork the design system and create drift.
  - **No wrapper divs without purpose.** Every `<div>` must serve a declared layout or grouping role. Pure "just in case" wrappers are removed.
  - **Flatten shallow component trees.** If a component renders a single child with no added logic or styling, it is not a component — inline it.
  - **One source of truth per visual rule.** If a style is defined in `app.css` as a utility class, do not redefine it inline in JSX. Reference the class; do not copy the declaration.
  - **Dead code is removed immediately.** Commented-out JSX blocks, unused imports, and orphaned CSS classes must be deleted — not left "for reference."
  - **Avoid Over-engineering Image Cropping:** When displaying user-uploaded images (like avatars), prefer native CSS (`object-fit: cover` on `aspect-square` containers) over complex frontend canvas-cropping or bounding-box workflows. This keeps the application simple, performant, and adheres to standard modern platform behavior.

---

## 14. Important Specifications

> [!IMPORTANT]
> Whenever this markdown file (`UIUX_RULES.md`) is mentioned, referenced, or when you are prompted to remember these UI/UX design rules, you MUST always follow all rules and guidelines stated under these Important (or Considered) Specifications.

### Rounded Elements
- **Rule:** Use consistent rounding across the interface to maintain a unified, modern aesthetic.
- **Apply:**
  - Standard containers and cards should use `rounded-xl` or `rounded-2xl` for a soft, premium feel.
  - Interactive buttons and pills should be fully rounded (`rounded-full`) or precisely match the container's inner radius.
  - Avoid sharp corners (`rounded-none`) unless explicitly required by a full-bleed layout.

### Light & Dark Mode Synchronization
- **Rule:** Both modes must feel like two sides of the same coin — thematic parallel and cohesive.
- **Apply:**
  - Ensure visual hierarchy and physical depth translate perfectly between light and dark themes.
  - Shadows in light mode must translate to subtle borders or inner glows in dark mode to maintain elevation.
  - Colors should automatically map to their mode-specific semantic tokens without requiring explicit overriding classes whenever possible.
  - **Base Contrast:** Enforce high-contrast readability by using black text and icons in light mode and white text and icons in dark mode as the default standard.

### Interactive Elements & Branding
- **Rule:** Enforce the "Premium UI" brand identity across all interactive components to ensure a cohesive and high-end agency experience.
- **Apply:**
  - **Dropdowns & Selects:** Dropdown menus and select items should utilize the `item-hover-gradient` utility. Hover states must feature the "floating bubble" effect with precisely centered text and indicators.
  - **Navigation & Sidebars:** For continuous navigation lists like sidebars, use a subtle neutral hover (`var(--sidebar-accent)` via `sidebar-neutral-hover`) for inactive items to avoid visual fatigue. Reserve the bright green-yellow gradient exclusively for the active state (often implemented as a fluidly sliding `motion.div` pill).
  - **Form Controls & Triggers:** Do not use the master `<Button>` component for `<SelectTrigger>` or Combobox triggers. Use standard semantic HTML `<button>` or form control styling. Using the master `<Button>` component improperly applies heavy hover gradients (`item-hover-gradient`) and bouncy spring-press physics to standard form inputs, which breaks UI consistency. Form inputs should remain visually neutral.
  - **Buttons:** Primary call-to-action buttons should have the iconic fully rounded shape (`rounded-full`) and the signature green-yellow gradient (`btn-specular`). Always use the default size for action buttons to maintain the ideal pill-shape padding (which automatically adjusts padding for icons), providing a generous, breathable click target. Avoid using `size="sm"` or explicitly overriding padding (e.g., `px-4`) for standard page header or action buttons unless strictly constrained by a compact table layout.
  - **CSS over JS for Interaction:** Never over-engineer simple hover states (like sliding backgrounds) using complex JavaScript coordinate tracking or `useRef` maps if native CSS utilities or simple Framer Motion layout animations (`layoutId`) can achieve the same effect natively and performantly.
  - **Interactive Hover Specification:** The default interactive hover gradient is green-yellow (`var(--grad-primary)`) unless explicitly stated otherwise (like in sidebars). All brand-gradient interactive elements must use black-colored icons (`text-black`) when hovered to ensure optimal high-contrast accessibility on the gradient background. For text/label elements:
    - **Element Covered by Gradient Hover:** When the element itself is covered by the green-yellow gradient hover background, all text and icons inside it MUST be black (`text-black`) to contrast with the bright gradient.
    - **Element NOT Covered by Gradient Hover (Offset Hover):** When only a sibling container (e.g., an icon container) gets the gradient hover while the text area remains on the card background, the hovered text must transition to white (`text-white`) in dark mode, and black (`text-black`) in light mode.

### Edge-Case UI Interactions & Scroll Physics
- **Rule:** Scroll behaviors and masking effects must degrade gracefully and work predictably across edge cases.
- **Apply:**
  - **Fade-out Effects:** When applying a `mask-image` fade to long text (e.g., notification previews), use fixed `rem` values (e.g., `black 4.5rem, transparent 6rem`) instead of percentages. This ensures that short text (under 2-3 lines) does not unnecessarily fade out.
  - **Scrollable Popovers (Radix UI):** When placing scrollable content inside a Radix Popover with a styling container (like `.matte-card` which uses `overflow-hidden` for border-radius), never apply `overflow-y-auto` directly to the outer container as the `hidden` rule will swallow the scrollbar. Instead, wrap the inner content in a new `<div className="overflow-y-auto">` and apply height constraints there: `style={{ maxHeight: 'calc(var(--radix-popover-content-available-height, 85vh) - 2px)' }}`.

---

## ✅ Quick-Reference Checklist

Use this before shipping any UI screen or flow:

- [ ] Does this screen have a single, clear purpose?
- [ ] Is the primary action obvious and easy to reach? (Fitts's Law)
- [ ] Are there fewer than 7 choices presented at once? (Miller's Law + Hick's Law)
- [ ] Is the layout consistent with the rest of the product? (Jakob's Law + Consistency)
- [ ] Are related elements visually grouped? (Law of Proximity + Common Region)
- [ ] Is white space used to reduce visual clutter?
- [ ] Does text meet minimum contrast ratios (4.5:1)?
- [ ] Is every interaction followed by immediate feedback? (Doherty Threshold)
- [ ] Does the most important content appear first and last? (Serial Position Effect)
- [ ] Is the design accessible by keyboard and screen reader?
- [ ] Have we designed a memorable peak and a positive ending? (Peak-End Rule)
- [ ] Is this the simplest design that solves the problem? (Occam's Razor)
- [ ] Are all existing components and tokens reused instead of re-implemented? (Anti-Bloat)
- [ ] Are there any unused imports, dead JSX blocks, or duplicate classes to remove? (Anti-Bloat)

---

*Sources: [Laws of UX](https://lawsofux.com/) by Jon Yablonski · [Laws of UI](https://www.uilaws.com/)*
