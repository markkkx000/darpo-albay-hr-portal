# Frontend Modifications Guide

> **Audience:** AI agents tasked with modifying the look and feel of this application's UI.
> **Goal:** Change visual appearance without breaking frontend optimizations, behavioural logic, or rendering consistency.

---

## Golden Rule

**You may change how things _look_ — you must not change how things _work_.**

Visual modifications (colors, spacing, typography, borders, shadows, animations) are welcome. Behavioural modifications (state management, event handlers, data flow, Inertia navigation, form submissions, conditional rendering logic) require explicit user approval and are outside the scope of this guide.

---

## 1. React Compiler — The Non-Negotiable Constraint

This project uses **`babel-plugin-react-compiler`** (see `vite.config.ts`). The React Compiler applies automatic memoisation and optimisation at build time. Violating its rules will cause **build failures or silent runtime bugs**.

### What You Must Not Do

| Violation | Why It Breaks |
|---|---|
| Mutate props, state, or values returned by hooks | Compiler assumes immutability for memoisation |
| Call `setState` synchronously inside `useEffect` without a cleanup guard | Triggers infinite re-render loops that the compiler cannot optimise away |
| Spread unknown dynamic keys onto JSX elements | Breaks static analysis of prop shapes |
| Conditionally call hooks (`if (x) useState(...)`) | Violates Rules of Hooks — compiler enforces strictly |
| Read or write refs during render (outside effects/handlers) | Compiler may reorder or skip renders that depend on ref reads |

### What You Can Do Safely

- Change Tailwind utility classes in `className` strings — the compiler treats these as opaque strings.
- Swap one `lucide-react` icon for another (same import pattern).
- Add or modify CSS transitions/animations via Tailwind classes.
- Adjust spacing, padding, margins, font sizes, colors, border radii, shadows.
- Wrap existing elements in purely presentational `<div>` containers for layout purposes (no state, no hooks).
- Add `aria-*` attributes or `id` attributes for accessibility.

---

## 2. Layout System — Architecture You Must Preserve

### Layout Selection (`app.tsx`)

Layouts are resolved by page name in `createInertiaApp.layout()`:

| Page Name Pattern | Layout Applied |
|---|---|
| `welcome` | No layout (standalone) |
| `auth/*` | `AuthLayout` |
| `settings/*` | `AppLayout` → `SettingsLayout` (nested) |
| Everything else (including `Modules/*`) | `AppLayout` |

**Do not** assign layouts via `Component.layout` property — use the centralized `app.tsx` resolver. Pages define only `breadcrumbs` via the static `layout` property:

```tsx
ManageRecords.layout = {
    breadcrumbs: [
        { title: 'Attendance', href: attendanceIndexRoute().url },
        { title: 'Manage Records', href: '#' },
    ],
};
```

### Layout Component Chain

```
AppShell (SidebarProvider, manages sidebar open/close state)
  └─ AppSidebar (navigation links, dynamic module nav)
  └─ AppContent variant="sidebar" (SidebarInset wrapper + overflow-x-hidden)
       └─ AppSidebarHeader (breadcrumbs + sidebar trigger)
       └─ {children} ← your page renders here
```

**Rules:**
- **Never** wrap a module page in `AppLayout`, `AppShell`, or `SidebarProvider` manually — the layout is applied automatically.
- **Never** remove or alter `overflow-x-hidden` on `AppContent` — it prevents horizontal scroll breakage with the sidebar.
- **Never** add `max-w-*` constraints to module index pages or data-heavy table views. These pages use **fluid layouts** (`w-full`).
- Layout changes to `app-layout.tsx`, `app-sidebar-layout.tsx`, `app-content.tsx`, or `app-shell.tsx` affect **every page in the application**. Make such changes only when explicitly requested and with full awareness of the blast radius.

---

## 3. Reusable Components — Use What Exists

Before creating any new UI element, check the existing component inventory below. **Always prefer an existing component over creating a new one.** If no existing component fits, create a new one in `resources/js/components/{Module}/` for module-specific UI or `resources/js/components/` for shared UI, and document it in this file's component tables.

### Shared Components (`resources/js/components/`)

| Component | File | Usage |
|---|---|---|
| **Pagination** | `Pagination.tsx` | **Mandatory** for all paginated views. Never create module-specific pagination. |
| **Heading** | `heading.tsx` | Page/section headings with optional description. Supports `default` and `small` variants. |
| **Breadcrumbs** | `breadcrumbs.tsx` | Rendered by `AppSidebarHeader`. Do not render manually. |
| **DynamicIcon** | `dynamic-icon.tsx` | Renders Lucide icons from string names. Fallback: `LayoutDashboard`. |
| **StatCard** | `dashboard/stat-card.tsx` | Dashboard statistics display with gradient backgrounds. |
| **EmployeeSearch** | `EmployeeSearch.tsx` | Reusable employee search input with autocomplete. |
| **AppLogo / AppLogoIcon** | `app-logo.tsx` / `app-logo-icon.tsx` | Brand identity components. |
| **NavMain / NavFooter / NavUser** | `nav-main.tsx` / `nav-footer.tsx` / `nav-user.tsx` | Sidebar navigation sections. |
| **InputError** | `input-error.tsx` | Form field error display. |
| **AlertError** | `alert-error.tsx` | Alert-style error banners. |
| **TextLink** | `text-link.tsx` | Styled inline links. |
| **UserInfo** | `user-info.tsx` | User avatar + name display. |
| **AppearanceTabs** | `appearance-tabs.tsx` | Toggle between light, dark, and system themes. |
| **LiquidBackground** | `liquid-background.tsx` | Animated background effect for special sections. |
| **PasswordInput** | `password-input.tsx` | Input field with show/hide password toggle. |

### UI Primitives (`resources/js/components/ui/`)

These are Radix-based, CVA-styled primitives. **Do not modify files in `components/ui/`** — they are auto-generated/managed and excluded from ESLint. Consume them as-is.

| Primitive | Notes |
|---|---|
| `button.tsx` | Use `variant` and `size` props. Do not add one-off button styles. |
| `card.tsx` | `Card`, `CardHeader`, `CardContent`, `CardTitle`, `CardDescription`, `CardFooter`. |
| `dialog.tsx` | Modal dialogs. Used for confirmation and edit flows. |
| `badge.tsx` | Status indicators. Use `variant` prop (`default`, `secondary`, `destructive`, `outline`). |
| `select.tsx` | Styled select dropdowns. |
| `input.tsx` / `textarea.tsx` | Form inputs. |
| `label.tsx` | Form labels. |
| `skeleton.tsx` | Loading placeholders. Use for deferred prop loading states. |
| `separator.tsx` | Visual dividers. |
| `alert.tsx` | Alert banners. |
| `avatar.tsx` | User avatars with fallback initials. |
| `sheet.tsx` | Slide-out panels (used for mobile nav). |
| `sidebar.tsx` | Full sidebar system (`SidebarProvider`, `SidebarContent`, etc.). |
| `sonner.tsx` | Toast notifications. Use `toast()` from `sonner` for feedback. |
| `spinner.tsx` | Loading spinner. |
| `tooltip.tsx` | Hover tooltips. |

### Module-Specific Components

| Module | Components | Location |
|---|---|---|
| **Attendance** | `AttendanceFilters`, `AttendanceHistory`, `AttendanceRecordModal`, `AttendanceStatus`, `ClockDisplay` | `components/Attendance/` |
| **Personnel** | `EmployeeCard`, `EmployeeForm`, `EmployeeTable` | `components/Personnel/` |
| **Dashboard** | `AdminOverview`, `HROverview`, `EmployeeOverview`, `StatCard` | `components/dashboard/` |
| **Roles** | `RoleAssignmentModal`, `RoleModal`, `RolesNavigation` | `components/Roles/` |
| **Announcements** | `AnnouncementCard`, `AnnouncementForm`, `RichTextEditor`, `TargetSelector` | `components/Announcements/` |
| **Notifications** | `NotificationBell` | `components/notifications/` |
| **Leave** | `LeaveNavigation` | `pages/Modules/Leave/Components/` |

---

## 4. Styling Rules

### Tailwind CSS v4

This project uses **Tailwind CSS v4** with the `@tailwindcss/vite` plugin. The design system is defined in `resources/css/app.css` using CSS custom properties and `@theme`.

**Rules:**
- Use **semantic color tokens** (`text-foreground`, `bg-background`, `text-muted-foreground`, `bg-primary`, `text-destructive`, etc.) — never hardcode raw color values like `#ff0000` or `rgb(...)`.
- **Dual-Mode Design Mandate:** Every UI update must have light and dark mode variants. Refer to `UIUX_RULES.md` for detailed design principles.
- Use the project's font stack: `font-sans` resolves to `'Instrument Sans'` — do not import additional fonts without approval.
- Use the project's border radius tokens: `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl` — do not hardcode pixel radii.

### Class Merging

The project uses `clsx` + `tailwind-merge` via the `cn()` utility from `@/lib/utils`. **Always** use `cn()` when conditionally combining classes:

```tsx
// ✅ Correct
className={cn("base-classes", condition && "conditional-classes")}

// ❌ Wrong — string concatenation can produce invalid or conflicting classes
className={`base-classes ${condition ? "conditional" : ""}`}
```

### Icons

- **Only** use `lucide-react` icons.
- For dynamic icon rendering from backend strings, use the `DynamicIcon` component.
- Standard icon sizes: `h-4 w-4` (inline/buttons), `h-5 w-5` (navigation/headers), `h-8 w-8` (empty states).

---

## 5. Page Structure Conventions

Every module page follows this structure. Maintain it when making visual modifications.

```tsx
export default function PageName({ ...props }: Props) {
    // 1. State and hooks at the top
    // 2. Event handlers
    // 3. Helper/formatting functions
    // 4. Render

    return (
        <>
            <Head title="Page Title" />

            {/* Page content — fluid width, internal padding */}
            <div className="p-4 w-full">
                {/* Page header: title + description + primary action */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <Heading 
                        title="Title" 
                        description="Description" 
                    />
                    <Button>Primary Action</Button>
                </div>

                {/* Filters (if applicable) */}
                <ModuleFilters ... />

                {/* Data table wrapped in Card */}
                <Card className="matte-card elev-1 overflow-hidden bg-background">
                    <CardHeader className="bg-muted/30 pb-4">...</CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">...</table>
                        </div>
                        <div className="px-6 border-t border-muted/30">
                            <Pagination links={data.links} meta={data} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Modals rendered outside the page content flow */}
            <SomeModal ... />
        </>
    );
}

// Breadcrumbs declared as a static property
PageName.layout = {
    breadcrumbs: [
        { title: 'Module', href: moduleRoute().url },
        { title: 'Page', href: '#' },
    ],
};
```

### Key Structural Rules

1. **`<Head title="..." />`** — always the first child. Do not remove or reorder.
2. **Fluid container** — `p-4 w-full` for index/table pages. Do not add `max-w-*` constraints. `mx-auto` is only meaningful when paired with a `max-w-*` — omit it on fluid pages.
3. **Responsive header** — `flex-col md:flex-row` pattern for title + action button. Use the `<Heading />` component.
4. **Table overflow** — `overflow-x-auto` wrapper is required for horizontal scroll on small screens.
5. **Pagination** — always inside the `CardContent`, after the table, with a top border separator.
6. **Modals** — rendered as siblings to the main content `<div>`, never nested inside it.
7. **Breadcrumbs & Routes** — defined via `PageName.layout` static property. **Always** use Wayfinder route functions (e.g., `attendanceIndexRoute().url`) for `href` values.

---

## 6. Behavioural Patterns You Must Not Touch

The following patterns are critical to application functionality. When making visual changes, **do not modify, remove, or restructure** these:

### Inertia Navigation & Data Flow
- `router.reload({ only: [...] })` — partial reloads for performance.
- `router.visit()` / `router.delete()` / `router.post()` — navigation and mutations.
- `preserveScroll` and `preserveState` on `<Link>` and pagination — prevents scroll jumps.
- `<Head title="..." />` — Inertia page title management.

### Search & Filter Debouncing
- 500ms debounced search inputs with instant Enter key trigger.
- Filter state synced with URL query parameters via `router.visit()`.
- Do not restructure filter components or change their `onChange`/`onKeyDown` handlers.

### Conditional Rendering by Permission
- `auth.permissions?.includes('...')` — gates UI elements by permission.
- Do not remove or alter these conditionals. You may style the gated elements differently.

### Toast Notifications
- `toast.success()` / `toast.error()` from `sonner` — used in `onSuccess`/`onError` callbacks.
- Do not change toast trigger points or messages without approval.

### Dialog State Management
- Modal open/close state (`isModalOpen`, `setIsModalOpen`, `recordToDelete`, etc.).
- `onOpenChange` handlers on `<Dialog>` components.

---

## 7. Mandatory Pre-Commit Checklist

After making any frontend modifications, you **must** run both commands and ensure they pass with zero errors before considering the work complete.

### 1. Lint Check and Auto-Fix
```bash
npm run lint
```
This runs `eslint . --fix`. Key rules enforced:
- `import/order` — imports must be alphabetically ordered by group.
- `@typescript-eslint/consistent-type-imports` — use `import type` for type-only imports.
- `@stylistic/brace-style` — `1tbs` brace style, no single-line blocks.
- `@stylistic/padding-line-between-statements` — blank lines around control flow statements.
- `curly` — always use braces, even for single-line `if`/`else`/`for`.

### 2. Production Build
```bash
npm run build
```
This runs `vite build`. It will catch:
- TypeScript type errors.
- React Compiler violations.
- Missing imports or broken module resolution.
- Tailwind class generation issues.

**Both commands must exit with code 0.** If either fails, fix the errors before proceeding.

---

## 8. Common Visual Modification Scenarios

### ✅ Safe Changes (no approval needed)

| Change | Example |
|---|---|
| Adjust spacing/padding | `p-4` → `p-6`, `gap-4` → `gap-6` |
| Change font weight/size | `text-3xl font-bold` → `text-2xl font-semibold` |
| Modify colors using tokens | `text-primary` → `text-muted-foreground` |
| Add/remove shadows | `shadow-md` → `shadow-lg` or remove entirely |
| Add/remove borders | `border-none` → `border` |
| Adjust border radius | `rounded-xl` → `rounded-lg` |
| Add hover/focus states | `hover:bg-muted/50`, `focus:ring-2` |
| Add CSS transitions | `transition-colors duration-200` |
| Swap Lucide icons | `<Clock />` → `<Timer />` |
| Add empty-state illustrations | New presentational elements in empty-data branches |
| Restyle table rows/cells | Change cell padding, row hover colour, header background |
| Adjust responsive breakpoints | `md:flex-row` → `lg:flex-row` |

### ⚠️ Changes Requiring Caution

| Change | Risk |
|---|---|
| Rearranging DOM order of interactive elements | May break tab order, screen readers, or group-hover patterns |
| Adding wrapper `<div>` around stateful components | May interrupt React Compiler optimisation boundaries |
| Changing `className` on UI primitives (`components/ui/*`) | These files are managed — modify consuming code instead |
| Altering grid/flex structure of filter bars | May break responsive layout or input sizing |

### 🚫 Changes Requiring Explicit Approval

| Change | Why |
|---|---|
| Modifying `app.tsx` layout resolver | Affects every page in the application |
| Adding new CSS custom properties to `app.css` | Extends the design system — needs design review |
| Changing the sidebar width or collapse behaviour | Impacts all authenticated pages |
| Adding new font imports | Increases bundle size, changes typography globally |
| Installing new npm dependencies | Must be approved per project rules |
| Modifying files in `components/ui/` | Auto-generated primitives — changes may be overwritten |

---

## 9. Quick Reference: File Impact Map

| File(s) Modified | Impact Scope |
|---|---|
| `resources/css/app.css` | **Global** — every page, light and dark mode |
| `resources/js/app.tsx` | **Global** — layout resolution, providers, theme init |
| `resources/js/layouts/*` | **Global** — all pages using that layout |
| `resources/js/components/app-sidebar.tsx` | **Global** — sidebar on all authenticated pages |
| `resources/js/components/app-header.tsx` | **Global** — top header navigation |
| `resources/js/components/app-content.tsx` | **Global** — content wrapper for all pages |
| `resources/js/components/Pagination.tsx` | **Multi-page** — all paginated views |
| `resources/js/components/heading.tsx` | **Multi-page** — wherever `<Heading>` is used |
| `resources/js/components/ui/*` | **Multi-page** — all consumers of that primitive |
| `resources/js/components/{Module}/*.tsx` | **Module-scoped** — only pages within that module |
| `resources/js/pages/Modules/{Module}/*.tsx` | **Single page** — only that specific page |
| `resources/js/components/dashboard/*.tsx` | **Dashboard only** — role-specific dashboard panels |
