## Notifications Infrastructure Implementation Plan: GOOD TO GO

**Reminder:** Follow all rules in `RULES_AND_GUIDELINES.md` and architecture conventions in `CODEBASE_SUMMARY.md`. Controllers must be thin, business logic in services, validation in form requests, routes auto-registered via `ModuleServiceProvider`, all frontend calls via Wayfinder, shared `Pagination.tsx` for paginated views, no hardcoded URLs.

**TL;DR:** Build a global notification infrastructure using Laravel's built-in database notifications channel. This is foundational infrastructure that all future modules (Announcements, Leave, Travel Orders) will use to push notifications to users. Includes a persistent bell icon in the app header, a unified dropdown, read/unread management, and a scheduled cleanup job.

---

## Architecture Overview

This feature is a **hybrid of Core infrastructure and Module UI**. It does not have its own sidebar link. It provides:
- A `notifications` table (Laravel built-in)
- A `NotificationService` in `app/Core/Services/` — cross-cutting infrastructure consumed by all modules
- A `NotificationController` in `app/Modules/Notifications/` — routes and pages auto-registered by `ModuleServiceProvider`
- A `UserObserver` to handle automatic notification dismissal on password change
- A bell icon component in the app header with unread count badge
- A unified dropdown showing all notification types
- A scheduled command to prune notifications older than 1 year

**Why the split?** `NotificationService` is used by Personnel, Leave, Announcements, and future modules — it's cross-cutting infrastructure that belongs in `app/Core/Services/`, alongside `ModuleRegistry`. The controller, routes, and pages are module-scoped UI and belong in `app/Modules/Notifications/`.

---

## Notification Types

All notifications share a common JSON `data` structure stored in the `notifications.data` column:

```json
{
  "type": "announcement | directed | system",
  "subtype": "optional_identifier (e.g. default_password)",
  "title": "Notification headline",
  "body": "Full content (rich text for announcements, plain for others)",
  "from": "HR Admin | System | Department Name",
  "priority": "low | normal | high",
  "dismissible": true,
  "url": "/optional/link/to/related/resource"
}
```

The `dismissible` flag is `false` for system notifications like the default password nudge — these cannot be manually marked as read by the user. The `subtype` field enables targeted auto-dismissal without affecting other notifications of the same `type`.

---

## Steps

1. Run `php artisan notifications:table` to generate the `notifications` migration. Do not modify the generated migration — it is Laravel's standard polymorphic structure and is already PostgreSQL-compatible.

2. Add a scheduled cleanup command `app/Console/Commands/PruneOldNotifications.php` that deletes notifications where `created_at < now()->subYear()`. Register it in `routes/console.php` to run daily. This applies to all notification types including unread ones — 1 year is the hard retention limit.

3. Create `NotificationService` in `app/Core/Services/NotificationService.php` with the following public methods:
   - `notifyUser(User $user, array $data): void` — send to a single user
   - `notifyDepartment(int $departmentId, array $data): void` — send to all active users in a department
   - `notifyPosition(int $positionId, array $data): void` — send to all active users in a position
   - `notifyAll(array $data): void` — send to all active users
   - `markAsRead(string $notificationId, User $user): void` — marks as read only if `dismissible: true`, otherwise throws `HttpException(403)`
   - `markAllAsRead(User $user): void` — marks all **dismissible** notifications as read (non-dismissible ones are untouched)
   - `dismissBySubtype(User $user, string $subtype): void` — deletes notifications matching a specific subtype (used by observers)
   - `getUnreadCount(User $user): int`
   - `getRecentNotifications(User $user, int $limit = 20): Collection`

   All dispatch methods must use Laravel's `Notification::send()` with a generic `GenericDatabaseNotification` class that accepts the `$data` array as its payload.

   **Security:** All query methods must scope to the authenticated user. The controller must never accept a `user_id` parameter — always use `$request->user()`.

4. Create a generic `app/Notifications/GenericDatabaseNotification.php` that implements `toDatabase()` returning the `$data` array as-is. This is the single notification class used for all types — the `type` and `subtype` fields in the data payload differentiate them on the frontend.

5. Create `NotificationController` in `app/Modules/Notifications/Controllers/NotificationController.php` with:
   - `GET /notifications` — returns an Inertia page with paginated notifications for the authenticated user (used for "View All" page)
   - `GET /notifications/recent` — returns a **JSON response** with the 20 most recent notifications for the authenticated user (used by the bell dropdown). This must return `response()->json(...)`, not an Inertia response.
   - `POST /notifications/{id}/read` — marks a single notification as read (delegates to `NotificationService::markAsRead`, returns 403 if `dismissible: false`)
   - `POST /notifications/read-all` — marks all **dismissible** notifications as read for the authenticated user (non-dismissible notifications like the password nudge are untouched)

6. Create `app/Modules/Notifications/routes.php` with the above routes, all protected by `auth` middleware. No permission middleware needed — all authenticated users can access their own notifications. Do **not** create a `navigation.php` file — `ModuleServiceProvider` only loads it if it exists, so omitting it is the clean approach for modules with no sidebar link.

7. Add a `DefaultPasswordNotification` dispatch in `app/Modules/Personnel/Services/EmployeeService.php` — when a new user is created, call `NotificationService::notifyUser()` with:
```json
   {
     "type": "system",
     "subtype": "default_password",
     "title": "Please change your default password",
     "body": "Your account was created with a default password. Please change it immediately in your profile settings.",
     "from": "System",
     "priority": "high",
     "dismissible": false,
     "url": "/settings/security"
   }
```

8. Create `app/Observers/UserObserver.php` to handle automatic dismissal of the default password notification. The observer listens for the `updated` event on the `User` model and checks if the `password` attribute was changed (using `$user->isDirty('password')` or `$user->wasChanged('password')`). When detected, it calls `NotificationService::dismissBySubtype($user, 'default_password')` to delete the notification. Register the observer in `AppServiceProvider::boot()` or via the `#[ObservedBy]` attribute on the `User` model. This keeps the `SecurityController` thin — it does not need to know about notifications.

9. Share unread notification count globally via `HandleInertiaRequests.php`:
   - Add `notifications.unread_count` to the shared props using a **lazy closure** to avoid running the query on every request unless the prop is consumed:
     ```php
     'notifications' => fn () => auth()->check() ? [
         'unread_count' => auth()->user()->unreadNotifications()->count(),
     ] : null,
     ```
   - This is an intentional, documented exception to the "no module data in shared props" rule because the bell icon is global infrastructure visible on every authenticated page.

10. Create the bell icon component `resources/js/components/notifications/NotificationBell.tsx`:
    - Displays a bell icon (`lucide-react`: `Bell`) in the app header, top right.
    - Shows an unread count badge when `notifications.unread_count > 0`.
    - On click, opens a dropdown and fetches the 20 most recent notifications using a standard `fetch()` call to the Wayfinder-generated URL for `GET /notifications/recent` (the JSON endpoint). The notification list is not a shared Inertia prop — it lives entirely in local component state.
    - Each notification shows: headline (title), source (from), timestamp, and a `˅` chevron to expand and reveal the body.
    - Expand/collapse is local UI state — no server call needed.
    - Notifications with `dismissible: false` show no dismiss button.
    - Notifications with `dismissible: true` show an `×` button that calls `fetch()` on the Wayfinder-generated URL for `POST /notifications/{id}/read`.
    - "Mark all as read" button at the top of the dropdown.
    - "View All" link at the bottom that navigates to the notifications index page using Wayfinder route functions or Inertia `router.visit()` — no hardcoded URL strings.
    - High priority notifications (`priority: high`) are visually distinct — use `text-destructive` or an amber accent.

11. Create `resources/js/pages/Modules/Notifications/Index.tsx` — a full paginated list of all notifications for the current user. Uses shared `Pagination.tsx`. Columns: type badge, title (expandable), from, date, read/unread status.

12. Integrate `NotificationBell.tsx` into the app header. Read `app-sidebar.tsx` and `app-shell.tsx` to find the correct insertion point in the existing header structure — do not restructure the layout, just insert the bell component.

13. Run `php artisan wayfinder:generate` after all routes are registered.

14. Write Pest tests in `tests/Feature/NotificationTest.php` covering:
    - `notifyUser` dispatches and stores a notification for the correct user
    - `notifyDepartment` dispatches to all active users in the department
    - `notifyAll` dispatches to all active users
    - `markAsRead` sets `read_at` for dismissible notifications
    - Non-dismissible notifications cannot be marked as read via the API (returns 403)
    - `markAllAsRead` sets `read_at` on all dismissible notifications only (non-dismissible untouched)
    - Cleanup command deletes notifications older than 1 year
    - Default password notification is created on user creation
    - Default password notification is auto-deleted after password change (via observer)
    - Users cannot read/dismiss another user's notification (scoped to authenticated user)

15. Run `vendor/bin/pint --dirty --format agent` on all PHP files.
16. Run `npm run lint` and `npm run build` — both must exit with code 0.

---

## Relevant Files

- `database/migrations/XXXX_create_notifications_table.php` (generated by artisan)
- `app/Notifications/GenericDatabaseNotification.php`
- `app/Core/Services/NotificationService.php`
- `app/Observers/UserObserver.php`
- `app/Modules/Notifications/Controllers/NotificationController.php` (handles index, recent, read, read-all)
- `app/Modules/Notifications/routes.php`
- `app/Console/Commands/PruneOldNotifications.php`
- `app/Http/Middleware/HandleInertiaRequests.php` (add `notifications.unread_count` via lazy closure)
- `app/Modules/Personnel/Services/EmployeeService.php` (add default password notification dispatch)
- `resources/js/components/notifications/NotificationBell.tsx`
- `resources/js/pages/Modules/Notifications/Index.tsx`
- `tests/Feature/NotificationTest.php`

---

## Verification

1. Run `php artisan route:list` — confirm all `/notifications` routes are registered.
2. Run `php artisan test --compact --filter=Notification` — all tests pass.
3. Create a new employee via Personnel Directory and verify:
   - A high-priority non-dismissible notification appears in their bell dropdown.
   - The `×` dismiss button is absent on that notification.
   - After changing password in settings, the notification disappears automatically (via observer).
4. As `super_admin`, call `notifyAll` manually via tinker and verify all active users receive the notification.
5. Verify `notifyDepartment` only delivers to users whose `department_id` matches.
6. Verify the unread count badge updates after marking notifications as read.
7. Verify "Mark all as read" clears only dismissible notifications, not the password nudge.
8. Seed 5+ notifications older than 1 year manually, run the cleanup command, verify they are deleted.
9. Verify `npm run build` passes with no errors after bell component integration.

---

## Decisions

- Laravel's built-in `database` notifications channel is used — no custom `notifications` table schema needed. This is already PostgreSQL-compatible.
- A single `GenericDatabaseNotification` class handles all notification types — the `type` and `subtype` fields in the JSON payload differentiate behavior on the frontend.
- `NotificationService` lives in `app/Core/Services/` because it is cross-cutting infrastructure consumed by multiple modules — not module-scoped.
- `notifications.unread_count` is the only notification data added to global shared props via a lazy closure — an intentional exception to the shared props rule because the bell icon is global infrastructure.
- Non-dismissible notifications (`dismissible: false`) are only removed by system events (password change via `UserObserver`), never by user action. The API returns 403 if a user attempts to mark one as read manually.
- Password change auto-dismissal is handled by a `UserObserver` on the `User` model — this keeps `SecurityController` thin and ensures dismissal works regardless of where the password is changed (settings, admin reset, etc.).
- Notification retention is 1 year maximum. The cleanup command runs daily and deletes all notifications older than 1 year regardless of read status.
- The bell dropdown fetches the 20 most recent notifications on open — no real-time WebSocket polling. The unread count in shared props updates on every Inertia page load.
- No `navigation.php` file is created — `ModuleServiceProvider` only loads it if present, so omitting it is cleaner than an empty file.
- `department_head` role is not added in this plan — it will be added in the Announcements plan where it is first needed for targeted push permissions.