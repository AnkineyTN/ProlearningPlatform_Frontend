# Notification — Todo & Goal Deadline Reminder

## Overview

Tính năng tự động gửi thông báo nhắc nhở người dùng về:
- **Daily task** chưa làm trước khi hết ngày
- **Weekly task** chưa làm vào cuối tuần
- **Goal** sắp đến deadline (còn 1 ngày / 1 tuần / 1 tháng)
- **Goal** không có hoạt động gì trong hơn 1 tuần

Người dùng có thể bật/tắt từng loại và tự chọn giờ nhận thông báo thông qua API cài đặt. Scheduler phía backend chạy **mỗi giờ** và chỉ gửi đến những user có preference giờ khớp với giờ hiện tại.

---

## Base URL

```
/api
```

Tất cả endpoint đều yêu cầu **JWT access token** trong header:

```
Authorization: Bearer <access_token>
```

---

## 1. Notification Preference API

### 1.1 Lấy preference hiện tại

```
GET /api/notifications/preferences
```

**Response `200 OK`:**

```json
{
  "status": "success",
  "message": "Get user notification preferences successfully",
  "data": {
    "dueCardReminderEnabled": true,
    "systemAnnouncementEnabled": true,
    "accountActivityEnabled": true,
    "dailyTodoReminderEnabled": true,
    "dailyTodoReminderHour": 20,
    "weeklyTodoReminderEnabled": true,
    "weeklyTodoReminderHour": 20,
    "goalDeadlineReminderEnabled": true,
    "goalInactiveReminderEnabled": true,
    "goalReminderHour": 9
  }
}
```

---

### 1.2 Cập nhật preference

```
PUT /api/notifications/preferences
```

**Request body** (tất cả field đều **optional** — chỉ gửi field muốn thay đổi):

```json
{
  "dueCardReminderEnabled": true,
  "systemAnnouncementEnabled": true,
  "accountActivityEnabled": true,
  "dailyTodoReminderEnabled": true,
  "dailyTodoReminderHour": 20,
  "weeklyTodoReminderEnabled": true,
  "weeklyTodoReminderHour": 20,
  "goalDeadlineReminderEnabled": true,
  "goalInactiveReminderEnabled": true,
  "goalReminderHour": 9
}
```

**Validation:**

| Field | Type | Ràng buộc |
|---|---|---|
| `dueCardReminderEnabled` | boolean | — |
| `systemAnnouncementEnabled` | boolean | — |
| `accountActivityEnabled` | boolean | — |
| `dailyTodoReminderEnabled` | boolean | — |
| `dailyTodoReminderHour` | integer | 0–23 |
| `weeklyTodoReminderEnabled` | boolean | — |
| `weeklyTodoReminderHour` | integer | 0–23 |
| `goalDeadlineReminderEnabled` | boolean | — |
| `goalInactiveReminderEnabled` | boolean | — |
| `goalReminderHour` | integer | 0–23 |

**Giá trị mặc định** (khi user chưa từng set):

| Field | Default |
|---|---|
| `dailyTodoReminderEnabled` | `true` |
| `dailyTodoReminderHour` | `20` (20:00) |
| `weeklyTodoReminderEnabled` | `true` |
| `weeklyTodoReminderHour` | `20` (20:00) |
| `goalDeadlineReminderEnabled` | `true` |
| `goalInactiveReminderEnabled` | `true` |
| `goalReminderHour` | `9` (09:00) |

**Response `200 OK`:** trả về object preference đã cập nhật, cùng format với GET.

**Ví dụ — chỉ tắt daily reminder và đổi giờ goal:**

```json
{
  "dailyTodoReminderEnabled": false,
  "goalReminderHour": 8
}
```

---

## 2. Notification List API (hiện có)

### 2.1 Lấy danh sách notification

```
GET /api/notifications?page=0&size=20
```

**Response `200 OK`:**

```json
{
  "status": "success",
  "data": {
    "notifications": [
      {
        "id": 123,
        "type": "DAILY_TODO_REMINDER",
        "title": "Daily Tasks Reminder",
        "message": "You have 3 incomplete daily task(s) today. Don't let them slip!",
        "data": null,
        "actionUrl": "/todos",
        "isRead": false,
        "createdAt": "2026-05-26T20:00:00+07:00",
        "readAt": null
      }
    ],
    "unreadCount": 5,
    "currentPage": 0,
    "totalPages": 2,
    "totalElements": 32
  }
}
```

---

### 2.2 Các endpoint khác (hiện có)

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/notifications/unread` | Danh sách chưa đọc (phân trang) |
| `GET` | `/api/notifications/unread/count` | Số lượng chưa đọc |
| `PATCH` | `/api/notifications/{id}/read` | Đánh dấu 1 notification đã đọc |
| `PATCH` | `/api/notifications/read` | Đánh dấu nhiều đã đọc (body: `{ "notificationIds": [1,2,3] }`) |
| `PATCH` | `/api/notifications/read-all` | Đánh dấu tất cả đã đọc |
| `DELETE` | `/api/notifications/{id}` | Xoá notification |

---

## 3. Notification Types — Enum Values

Dùng để phân loại và render UI phù hợp cho từng loại thông báo.

### Loại mới (todo & goal reminders):

| Enum | Title mặc định | Mô tả |
|---|---|---|
| `DAILY_TODO_REMINDER` | Incomplete daily tasks | Daily task hôm nay chưa làm |
| `WEEKLY_TODO_REMINDER` | Incomplete weekly tasks | Weekly task trong tuần chưa làm |
| `GOAL_DEADLINE_REMINDER` | Goal deadline approaching | Goal sắp đến hạn (1 ngày / 1 tuần / 1 tháng) |
| `GOAL_INACTIVE_REMINDER` | No activity on goal | Goal không có hoạt động > 7 ngày |

### Các loại hiện có:

| Enum | Mô tả |
|---|---|
| `CARD_DUE_REMINDER` | Thẻ flashcard cần ôn tập |
| `STUDY_SESSION_REMINDER` | Nhắc học |
| `WEEKLY_SUMMARY` | Tổng kết tuần học |
| `NOTE_INVITE` | Được mời cộng tác note |
| `NOTE_INVITE_ACCEPTED` | Lời mời note được chấp nhận |
| `FLASHCARD_INVITE` | Được mời cộng tác flashcard |
| `EXAM_INVITE` | Được mời cộng tác exam |
| `ACCOUNT_BLOCKED` | Tài khoản bị khoá |
| `ACCOUNT_UNBLOCKED` | Tài khoản được mở khoá |
| `ACCOUNT_UPGRADED` | Tài khoản nâng cấp PRO |
| `SYSTEM_ANNOUNCEMENT` | Thông báo hệ thống |
| `ACCOUNT_ACTIVITY` | Hoạt động tài khoản |
| `GENERAL` | Thông báo chung |

---

## 4. Thông báo mẫu (Content)

### DAILY_TODO_REMINDER

- **Tiếng Anh:**
  - Title: `Daily Tasks Reminder`
  - Message: `You have {n} incomplete daily task(s) today. Don't let them slip!`
- **Tiếng Việt:**
  - Title: `Nhắc nhở task hôm nay`
  - Message: `Bạn còn {n} task hôm nay chưa hoàn thành. Cố lên nào!`
- **`actionUrl`:** `/todos`

---

### WEEKLY_TODO_REMINDER

- **Tiếng Anh:**
  - Title: `Weekly Tasks Reminder`
  - Message: `This week is almost over! You still have {n} weekly task(s) to complete.`
- **Tiếng Việt:**
  - Title: `Nhắc nhở task tuần này`
  - Message: `Tuần này sắp kết thúc! Bạn còn {n} task tuần chưa hoàn thành.`
- **`actionUrl`:** `/todos`

---

### GOAL_DEADLINE_REMINDER

- **Tiếng Anh:**
  - Title: `Goal Deadline Approaching`
  - Message: `Your goal "{goal title}" is due in {1 day | 1 week | 1 month}. Keep pushing!`
- **Tiếng Việt:**
  - Title: `Deadline mục tiêu sắp đến`
  - Message: `Mục tiêu "{goal title}" sẽ đến hạn sau {1 ngày | 1 tuần | 1 tháng}. Tiếp tục cố gắng nhé!`
- **`actionUrl`:** `/goals/{goalId}`

---

### GOAL_INACTIVE_REMINDER

- **Tiếng Anh:**
  - Title: `Goal Check-in`
  - Message: `It's been over a week since you updated "{goal title}". How's progress going?`
- **Tiếng Việt:**
  - Title: `Nhắc nhở cập nhật mục tiêu`
  - Message: `Đã hơn 1 tuần bạn không cập nhật "{goal title}". Tiến độ đến đâu rồi?`
- **`actionUrl`:** `/goals/{goalId}`

---

## 5. Logic kích hoạt (để FE hiểu context)

| Loại | Khi nào gửi | Điều kiện |
|---|---|---|
| `DAILY_TODO_REMINDER` | Mỗi ngày, đúng giờ `dailyTodoReminderHour` | User có todo type `DAILY`, `dueDate = hôm nay`, `status = TODO` |
| `WEEKLY_TODO_REMINDER` | Mỗi **Chủ nhật**, đúng giờ `weeklyTodoReminderHour` | User có todo type `WEEKLY`, `dueDate` trong tuần này, `status = TODO` |
| `GOAL_DEADLINE_REMINDER` | Mỗi ngày, đúng giờ `goalReminderHour` | Goal `IN_PROGRESS` có `targetDate` = hôm nay + 1 ngày / 7 ngày / 30 ngày |
| `GOAL_INACTIVE_REMINDER` | Mỗi **thứ Hai**, đúng giờ `goalReminderHour` | Goal `IN_PROGRESS` không có bất kỳ cập nhật nào (cả goal lẫn todos của nó) trong 7 ngày |

---

## 6. Gợi ý UI cho trang Settings

### Layout gợi ý: "Notification Settings"

```
┌─────────────────────────────────────────────────────────────┐
│  Notifications                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Flashcard                                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Due card reminders          [Toggle ON/OFF]        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Daily Tasks                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Daily task reminders        [Toggle ON/OFF]        │   │
│  │  Remind me at                [Time Picker: 20:00]   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Weekly Tasks                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Weekly task reminders       [Toggle ON/OFF]        │   │
│  │  Remind me at (every Sunday) [Time Picker: 20:00]   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Goals                                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Deadline reminders          [Toggle ON/OFF]        │   │
│  │  Inactivity reminders        [Toggle ON/OFF]        │   │
│  │  Remind me at                [Time Picker: 09:00]   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  System                                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  System announcements        [Toggle ON/OFF]        │   │
│  │  Account activity            [Toggle ON/OFF]        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Lưu ý UX:
- `goalReminderHour` dùng chung cho cả **deadline reminder** và **inactivity reminder** của goal — chỉ cần 1 time picker cho cả 2
- `dailyTodoReminderHour` và `weeklyTodoReminderHour` là **2 giờ riêng biệt**
- Time picker nên cho phép chọn **giờ nguyên** (0–23), không cần phút
- Khi toggle tắt một loại, nên **ẩn** time picker của nó đi (không cần gửi giờ nếu disabled)
- Nên **debounce hoặc có nút Save** khi thay đổi, tránh gọi API quá nhiều lần

---

## 7. Ví dụ flow gọi API

### Bật daily reminder và đặt giờ nhắc là 9pm:

```http
PUT /api/notifications/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "dailyTodoReminderEnabled": true,
  "dailyTodoReminderHour": 21
}
```

### Tắt goal inactivity reminder:

```http
PUT /api/notifications/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "goalInactiveReminderEnabled": false
}
```

### Tắt toàn bộ goal reminder:

```http
PUT /api/notifications/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "goalDeadlineReminderEnabled": false,
  "goalInactiveReminderEnabled": false
}
```

---

## 8. Error Responses

### 400 Bad Request — Hour ngoài range:

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": {
    "dailyTodoReminderHour": "must be less than or equal to 23"
  }
}
```

### 401 Unauthorized:

```json
{
  "status": "error",
  "message": "Unauthorized"
}
```
