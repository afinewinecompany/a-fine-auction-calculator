# Story 13.7: Broadcast In-App Notifications

**Story ID:** 13.7
**Story Key:** 13-7-broadcast-in-app-notifications
**Epic:** Epic 13 - Admin Operations & Monitoring
**Status:** dev-complete

---

## Story

As an **administrator**,
I want to broadcast in-app notifications to users during incidents,
So that I can communicate system status and expected resolution times.

---

## Acceptance Criteria

**Given** I am on the admin dashboard at `/admin`
**When** I use the Broadcast Notifications tool
**Then** I can compose a notification message with title and body
**And** I can select notification type: info, warning, error
**And** I can choose to broadcast to all users or specific user by email
**And** clicking "Send Notification" broadcasts the message
**And** users see the notification as a toast in their app
**And** notifications are logged in the database for audit trail
**And** I can view history of sent notifications
**And** the UI uses shadcn/ui dialog for compose form

---

## Developer Context

### Story Foundation from Epic

From **Epic 13: Admin Operations & Monitoring** (docs/epics.md lines 434-443):

This story implements in-app notification broadcasting (FR60), enabling administrators to communicate with users during incidents. It's the seventh story in Epic 13.

**Core Responsibilities:**

- **Notification Composer:** UI to create notification messages
- **Broadcast Mechanism:** Send notifications to all users or specific user
- **Notification Types:** Info, warning, error with color coding
- **Toast Display:** Show notifications in user's app via Sonner
- **Audit Trail:** Log all sent notifications
- **History View:** Display past broadcasts

**Relationship to Epic 13:**

This is Story 7 of 11 in Epic 13. It depends on:
- **Story 13.1**: Admin dashboard route

### Technical Requirements

#### Database Schema

```sql
-- supabase/migrations/018_notifications.sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'error')),
  target_user_id UUID REFERENCES users(id),
  sent_by UUID REFERENCES users(id),
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Only admins can insert notifications
CREATE POLICY "Admins can send notifications"
  ON notifications FOR INSERT
  USING ((SELECT is_admin FROM users WHERE id = auth.uid()));

-- RLS: Users can view their notifications or global ones
CREATE POLICY "Users can view their notifications"
  ON notifications FOR SELECT
  USING (target_user_id IS NULL OR target_user_id = auth.uid());
```

#### Notification Type

```typescript
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error';
  targetUserId: string | null;
  sentBy: string;
  sentAt: string;
}
```

#### Broadcast Service

```typescript
// src/features/admin/services/notificationService.ts
export async function broadcastNotification(
  title: string,
  message: string,
  type: 'info' | 'warning' | 'error',
  targetUserId: string | null
): Promise<void> {
  const supabase = getSupabase();
  await supabase.from('notifications').insert({
    title,
    message,
    type,
    target_user_id: targetUserId,
  });
}
```

---

## Tasks / Subtasks

- [x] **Task 1: Create Notifications Database Table**
  - [x] Create migration with notifications table (existed: supabase/migrations/018_notifications.sql)
  - [x] Add RLS policies for admin insert and user select

- [x] **Task 2: Define Notification Type**
  - [x] Add to admin.types.ts (already existed: Notification, NotificationType, SendNotificationInput, NotificationHistoryItem)

- [x] **Task 3: Create Notification Service**
  - [x] Implement broadcastNotification function (src/features/admin/services/notificationService.ts)
  - [x] Implement getNotificationHistory function
  - [x] Implement getUserNotifications function

- [x] **Task 4: Create BroadcastNotificationDialog Component**
  - [x] Compose form with title, message, type (src/features/admin/components/BroadcastNotificationDialog.tsx)
  - [x] User selection (all or specific by email)
  - [x] Send button with loading state
  - [x] Toast feedback for success/error

- [x] **Task 5: Create NotificationHistoryWidget Component**
  - [x] Display sent notifications (src/features/admin/components/NotificationHistoryWidget.tsx)
  - [x] Show timestamp, type, target
  - [x] Color-coded notification types (info/warning/error)
  - [x] Auto-refresh every minute

- [x] **Task 6: Create useNotifications Hook (User Side)**
  - [x] Poll for new notifications (src/features/admin/hooks/useNotifications.ts)
  - [x] Display as toast when received (info/warning/error toast variants)
  - [x] Deduplicate notifications by ID

- [x] **Task 7: Update AdminDashboard**
  - [x] Add NotificationHistoryWidget to dashboard (src/features/admin/components/AdminDashboard.tsx)
  - [x] Export all new components and hooks from index.ts

- [x] **Task 8: Add Tests**
  - [x] Test notification service (tests/features/admin/notificationService.test.ts)
  - [x] Test BroadcastNotificationDialog (tests/features/admin/BroadcastNotificationDialog.test.tsx)
  - [x] Test NotificationHistoryWidget (tests/features/admin/NotificationHistoryWidget.test.tsx)
  - [x] Test useNotificationHistory hook (tests/features/admin/useNotificationHistory.test.tsx)
  - [x] Test useNotifications hook (tests/features/admin/useNotifications.test.tsx)

- [x] **Task 9: Test End-to-End**
  - [x] All unit tests passing (36 tests)

---

## Summary

Story 13.7 adds in-app notification broadcasting for admin-to-user communication.

**Deliverable:** BroadcastNotificationDialog and NotificationHistoryWidget for admin dashboard, plus user-side notification display.

**Implementation Estimate:** 4-5 hours
