## Announcements Implementation Plan: GOOD TO GO

**Reminder:** Follow all rules in `rules_and_guidelines.md` and architecture conventions in `codebase_summary.md`. Controllers must be thin, business logic in services, validation in form requests, routes auto-registered via `ModuleServiceProvider`, all frontend calls via Wayfinder, shared `Pagination.tsx` for paginated views, no hardcoded URLs. This module depends on the Notifications infrastructure — implement Notifications first.

**TL;DR:** HR and department heads can create announcements (with draft/publish workflow and rich text content), target them to specific audiences, and publish them. Publishing dispatches notifications to all targeted users via `NotificationService`. All authenticated users can view published announcements.

**Dependency:** `app/Core/Services/NotificationService.php` must exist before this module is implemented.

---

## Steps

1. Add `department_head` role in `RoleAndPermissionSeeder`. A department head is a user with this role whose `department_id` on the `users` table defines which department they manage. No schema changes needed — `users.department_id` already exists. The `department_head` role gets the same permissions as `employee` plus `announcements.view` and `announcements.manage`. Also rename the existing `announcements.publish` permission to `announcements.manage` throughout the seeder (including the `hr_admin` role assignment).

2. Create migration for `announcements` table:
   - `id`
   - `title` (string)
   - `content` (text — stores rich text HTML)
   - `posted_by` — use `$table->foreignId('posted_by')->nullable()->constrained('users')->nullOnDelete()`
   - `status` (string — `draft` or `published`, default `draft`)
   - `priority` (string — `low`, `normal`, `high`, default `normal`)
   - `published_at` (timestamp, nullable — set when status transitions to published)
   - `target_type` (string — `all`, `department`, `position`, `user`, default `all`)
   - `target_id` (unsignedBigInteger, nullable — references department/position/user id depending on `target_type`)
   - `created_at`, `updated_at`, `deleted_at` (soft deletes)

3. Create `Announcement` model in `app/Modules/Announcements/Models/Announcement.php` with:
   - Soft deletes
   - Relationship to `User` (posted_by)
   - Scopes: `scopePublished()`, `scopeDraft()`, `scopeByTarget()`
   - No external state machine package. The `draft → published` transition is enforced via a simple guard in `AnnouncementService::publish()` — if `$announcement->status !== 'draft'`, throw a `DomainException`. Once published, an announcement cannot be moved back to draft. It can only be soft deleted.

4. Create `AnnouncementService` in `app/Modules/Announcements/Services/AnnouncementService.php` with:
   - `create(array $data, User $author): Announcement` — creates a draft
   - `publish(Announcement $announcement, User $actor): void` — transitions status to published, sets `published_at`, then calls `NotificationService` to dispatch to the correct audience based on `target_type` and `target_id`
   - `update(Announcement $announcement, array $data): Announcement` — only allowed on drafts
   - `delete(Announcement $announcement): void` — soft delete
   - `getPublishedForUser(User $user): LengthAwarePaginator` — returns published announcements visible to the user based on their `department_id` and `position_id`
   - `getAllForHR(): LengthAwarePaginator` — returns all announcements (draft + published) for HR management view

   **Targeting logic in `publish()`:**
   - `target_type = all` → `NotificationService::notifyAll()`
   - `target_type = department` → `NotificationService::notifyDepartment($target_id)`
   - `target_type = position` → `NotificationService::notifyPosition($target_id)`
   - `target_type = user` → `NotificationService::notifyUser($user, data)`

   **Department head restriction:** Before dispatching, check if the actor has `department_head` role — if so, enforce that `target_type` must be `department` and `target_id` must equal `actor->department_id`. Throw an `UnauthorizedException` if violated.

5. Create Form Requests in `app/Modules/Announcements/Requests/`:
   - `AnnouncementCreateRequest` — validates `title` (required), `content` (required), `priority` (required, in: low,normal,high), `target_type` (required, in: all,department,position,user), `target_id` (required_unless: target_type,all — must exist in the referenced table)
   - `AnnouncementUpdateRequest` — same as create, but also validates that the announcement is still in `draft` status
   - `AnnouncementPublishRequest` — validates the announcement is in `draft` status and the actor has permission to publish to the specified target

6. Create `AnnouncementController` in `app/Modules/Announcements/Controllers/AnnouncementController.php` with:
   - `index` — public list of published announcements for current user
   - `show` — single announcement view
   - `manage` — HR/department_head management list (all statuses)
   - `create` — create form
   - `store` — save draft
   - `edit` — edit form (draft only)
   - `update` — update draft
   - `publish` — transition to published and dispatch notifications
   - `destroy` — soft delete

7. Create `app/Modules/Announcements/routes.php`. **Static routes must be registered before wildcard `{announcement}` routes** to avoid the wildcard capturing `/manage` and `/create`:
   - `GET /` — index (all authenticated users, `announcements.view`)
   - `GET /manage` — management list (`announcements.manage`)
   - `GET /create` — create form (`announcements.manage`)
   - `POST /` — store draft (`announcements.manage`)
   - `GET /{announcement}` — show (all authenticated users, `announcements.view`)
   - `GET /{announcement}/edit` — edit form (`announcements.manage`, draft only)
   - `PUT /{announcement}` — update draft (`announcements.manage`)
   - `POST /{announcement}/publish` — publish (`announcements.manage`)
   - `DELETE /{announcement}` — soft delete (`announcements.manage`)

8. Create `app/Modules/Announcements/navigation.php` registering two sidebar links:
   - "Announcements" — visible to all roles with `announcements.view` (links to `/announcements`)
   - "Manage Announcements" — visible only to roles with `announcements.manage` (links to `/announcements/manage`)
   Read `app/Modules/Attendance/navigation.php` for the correct closure format before writing this file.

9. Seed permissions in `RoleAndPermissionSeeder`:
   - `announcements.view` — employee, hr_staff, hr_admin, super_admin, department_head
   - `announcements.manage` — hr_staff, hr_admin, super_admin, department_head

10. Create frontend pages in `resources/js/pages/Modules/Announcements/` using Wayfinder for all routing. **All pages must use fragments (`<>...</>`) — never wrap in `<AppLayout>`.** Declare breadcrumbs via a static `.layout` property (e.g., `Index.layout = { breadcrumbs: [...] }`). See `FRONTEND_MODIFICATIONS_GUIDE.md` §2 and `Personnel/Index.tsx` for the correct pattern.
    - `Index.tsx` — paginated list of published announcements visible to the current user. Each card shows: title, priority badge, posted by, published date, and a `˅` chevron to expand and read the full rich text content inline. Uses shared `Pagination.tsx`.
    - `Show.tsx` — full single announcement view with rich text rendered safely.
    - `Manage.tsx` — HR management table showing all announcements (draft + published) with status badges, priority, target audience, and actions (Edit, Publish, Delete).
    - `Create.tsx` — create form with rich text editor, priority selector, target type/id selectors.
    - `Edit.tsx` — pre-filled form, identical to Create. Only accessible for drafts.

11. Add reusable components in `resources/js/components/Announcements/`:
    - `AnnouncementCard.tsx` — expandable card with chevron toggle for the index view.
    - `AnnouncementForm.tsx` — shared form used by Create and Edit pages. Includes rich text editor integration.
    - `TargetSelector.tsx` — dynamic target type/id selector: when `target_type` is `department`, shows department dropdown; when `position`, shows position dropdown; when `user`, shows employee search/select; when `all`, shows nothing.

12. **Rich text editor:** Use **Tiptap** (`@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`) for the rich text editor and `dompurify` for HTML sanitization. Tiptap is headless (fully styleable with Tailwind) and produces clean HTML. Render stored HTML using `dangerouslySetInnerHTML` wrapped in `DOMPurify.sanitize()` to prevent XSS.

13. Run `php artisan wayfinder:generate` after all routes are registered.

14. Write Pest tests in `tests/Feature/AnnouncementTest.php` covering:
    - Draft creation by HR roles
    - Draft cannot be created by employee role (403)
    - Draft update succeeds on draft status
    - Draft update fails on published announcement
    - Publish transitions status and sets `published_at`
    - Publish dispatches notification to correct audience (mock `NotificationService`)
    - Department head can only publish to their own department
    - Department head cannot publish to `target_type = all` (403)
    - Employee can view published announcements
    - Employee cannot view drafts (404/403)
    - Soft delete removes from published list

15. Run `vendor/bin/pint --dirty --format agent` on all PHP files.
16. Run `npm run lint` and `npm run build` — both must exit with code 0.

---

## Relevant Files

- `database/migrations/XXXX_create_announcements_table.php`
- `app/Modules/Announcements/Models/Announcement.php`
- `app/Modules/Announcements/Services/AnnouncementService.php`
- `app/Modules/Announcements/Requests/AnnouncementCreateRequest.php`
- `app/Modules/Announcements/Requests/AnnouncementUpdateRequest.php`
- `app/Modules/Announcements/Requests/AnnouncementPublishRequest.php`
- `app/Modules/Announcements/Controllers/AnnouncementController.php`
- `app/Modules/Announcements/routes.php`
- `app/Modules/Announcements/navigation.php`
- `database/seeders/RoleAndPermissionSeeder.php`
- `resources/js/pages/Modules/Announcements/Index.tsx`
- `resources/js/pages/Modules/Announcements/Show.tsx`
- `resources/js/pages/Modules/Announcements/Manage.tsx`
- `resources/js/pages/Modules/Announcements/Create.tsx`
- `resources/js/pages/Modules/Announcements/Edit.tsx`
- `resources/js/components/Announcements/AnnouncementCard.tsx`
- `resources/js/components/Announcements/AnnouncementForm.tsx`
- `resources/js/components/Announcements/TargetSelector.tsx`
- `tests/Feature/AnnouncementTest.php`

---

## Verification

1. Run `php artisan route:list` — confirm all `/announcements` routes are registered.
2. Run `php artisan test --compact --filter=Announcement` — all tests pass.
3. As `hr_admin`, create a draft announcement and verify it appears in Manage with `draft` status badge.
4. Edit the draft and verify changes are saved.
5. Publish the draft and verify:
   - Status changes to `published` with `published_at` set.
   - Targeted users receive a notification in their bell dropdown.
   - The announcement appears in the employee index view.
6. Verify a published announcement cannot be edited (edit form returns 403 or redirects).
7. As `employee`, verify they can view published announcements but cannot access `/announcements/manage`, `/announcements/create`, or edit routes (403).
8. As `department_head`, verify they can only target their own department — attempting `target_type = all` returns a validation error.
9. Verify the expandable card on the index page shows/hides content on chevron click without a page reload.
10. Verify rich text content renders correctly (bold, lists, headings) in both the card expand view and the Show page.
11. Soft delete an announcement and verify it disappears from the employee index but remains visible in the HR Manage view with a deleted indicator.

---

## Decisions

- `draft → published` is a one-way state transition enforced by a simple guard in `AnnouncementService::publish()`. No external state machine package — a `DomainException` is thrown if `status !== 'draft'`. Published announcements cannot be reverted to draft — they can only be soft deleted.
- `target_type` and `target_id` are stored on the announcement itself for auditability — you can always see who was targeted.
- Department heads are scoped to their own `department_id` at the service layer, not just the permission layer, to prevent targeting other departments even if the permission is somehow granted.
- Tiptap is chosen for rich text over alternatives (Quill, ProseMirror directly) because it is headless, actively maintained, and has first-class React support.
- Rich text HTML is stored as-is in the `content` column and sanitized on render using `DOMPurify.sanitize()` — never on storage — to preserve formatting fidelity.
- `announcements.manage` is granted to `hr_staff` — they can create and manage announcements, consistent with their role in Leave Tracking where they can also process requests.
- The existing `announcements.publish` permission in the seeder is renamed to `announcements.manage` (broader scope covering all CRUD + publish).
- `department_head` gets the same permissions as `employee` plus `announcements.view` and `announcements.manage`.
- The "Announcements" sidebar link appears for all roles. "Manage Announcements" appears only for roles with `announcements.manage`.