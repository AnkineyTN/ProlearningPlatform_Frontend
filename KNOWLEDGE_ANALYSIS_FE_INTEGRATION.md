# Knowledge Analysis — Integration Guide

---

## Backend API — Frontend Integration

Auth: `Bearer <token>` header bắt buộc cho tất cả endpoint.

---

### 1.1 Trigger Analysis Sau Khi Hoàn Thành Study Session

Gọi sau khi user kết thúc flashcard review session (session status = `COMPLETED`).

```
POST /sets/{setId}/flashcards/{flashcardId}/sessions/{sessionId}/analysis
```

**Response `201 Created`:**
```json
{
  "status": "success",
  "message": "Analysis created",
  "data": {
    "id": 42,
    "sourceType": "FLASHCARD",
    "sourceId": 7,
    "sessionRefId": 15,
    "topicAccuracies": [
      { "topic": "Present Perfect", "accuracy": 0.90 },
      { "topic": "Past Simple",     "accuracy": 0.45 }
    ],
    "strengths":    "You demonstrate strong command of Present Perfect...",
    "weaknesses":   "Past Simple needs attention...",
    "improvements": "Focus on irregular verb forms...",
    "createdAt":    "2026-05-01T10:00:00Z",
    "contributingSources": null
  }
}
```

**Errors:**

| Status | Khi nào                                                                           |
|--------|-----------------------------------------------------------------------------------|
| `400`  | Session chưa COMPLETED, hoặc không có card nào có topic (chưa assign topic)       |
| `404`  | Session không tồn tại hoặc không thuộc về user này                                |
| `409`  | Đã có analysis cho session này — response body trả về analysis cũ (không tạo mới) |

**Frontend flow:**
```
[User finish review session]
  → POST /sessions/{sessionId}/analysis
  → 201: hiển thị màn hình analysis result
  → 409: analysis đã tồn tại → fetch bằng GET /analyses và hiển thị bản cũ
  → 400 "no topics": hiển thị "Topics are being assigned, please try again shortly"
       (topic assignment đang chạy async sau khi tạo flashcard AI)
```

---

### 1.2 Trigger Analysis Sau Khi Nộp Exam

Gọi sau khi user submit exam attempt (attempt status = `SUBMITTED`).

```
POST /sets/{setId}/exams/{examId}/attempts/{attemptId}/analysis
```

**Response `201 Created`:** Cùng structure như trên (`sourceType: "EXAM"`, `sessionRefId` = `attemptId`).

**Errors:**

| Status | Khi nào |
|--------|---------|
| `400` | Attempt chưa SUBMITTED, hoặc không có question nào có topic |
| `404` | Attempt không tồn tại hoặc không thuộc về user |
| `409` | Đã có analysis cho attempt này |

**Lưu ý Essay:** Nếu exam có essay questions chưa được chấm (AI đang xử lý), những câu đó sẽ bị bỏ qua khi tính accuracy. Analysis vẫn được tạo dựa trên các câu đã chấm xong.

---

### 1.3 Set-Level Analysis

Tổng hợp analysis từ tất cả flashcard và exam trong một set. Chỉ gọi khi user muốn xem overview toàn bộ set.

```
POST /sets/{setId}/analysis
```

**Prerequisite:** Phải có ít nhất 1 analysis đã tồn tại cho bất kỳ flashcard hoặc exam nào trong set. Nếu không, trả về `400`.

**Response `201 Created`:**
```json
{
  "status": "success",
  "message": "Set analysis created",
  "data": {
    "id": 99,
    "sourceType": "SET",
    "sourceId": 3,
    "sessionRefId": null,
    "topicAccuracies": [
      { "topic": "Present Perfect", "accuracy": 0.85 },
      { "topic": "Past Simple",     "accuracy": 0.52 }
    ],
    "strengths":    "...",
    "weaknesses":   "...",
    "improvements": "...",
    "createdAt":    "2026-05-01T10:00:00Z",
    "contributingSources": [
      {
        "sourceType": "FLASHCARD",
        "sourceId": 3,
        "analysisId": 10,
        "analyzedAt": "2026-05-01T09:00:00Z"
      },
      {
        "sourceType": "FLASHCARD",
        "sourceId": 7,
        "analysisId": 5,
        "analyzedAt": "2026-02-10T14:00:00Z"
      },
      {
        "sourceType": "EXAM",
        "sourceId": 2,
        "analysisId": 22,
        "analyzedAt": "2026-04-29T18:00:00Z"
      }
    ]
  }
}
```

**`contributingSources` usage:**

Dùng `analyzedAt` để cảnh báo user về stale data. Ví dụ: nếu `analyzedAt` của một source cách `createdAt` của set analysis > 30 ngày, hiển thị warning: "Some data may be outdated — consider re-studying [Flashcard Name]."

**Errors:**

| Status | Khi nào                                            |
|--------|----------------------------------------------------|
| `400`  | Chưa có analysis nào cho bất kỳ item nào trong set |

---

### 1.4 Xem Lịch Sử Analysis

Trả về danh sách analyses đã tạo, mới nhất trước. Dùng để hiển thị progress timeline hoặc load lại analysis cũ.

```
GET /sets/{setId}/flashcards/{flashcardId}/analyses
GET /sets/{setId}/exams/{examId}/analyses
GET /sets/{setId}/analyses
```

**Response `200 OK`:**
```json
{
  "status": "success",
  "message": "OK",
  "data": [
    { /* KnowledgeAnalysisResponseDto — mới nhất */ },
    { /* ... */ }
  ]
}
```

**Frontend usage:**
- Khi user bấm "View Analysis" mà chưa trigger analysis → gọi GET trước; nếu list rỗng thì mới hướng dẫn user study rồi trigger.
- Dùng list để render progress chart (accuracy per topic theo thời gian).

---

### 1.5 Manual Topic Assignment (Escape Hatch)

Dùng khi flashcard/exam được tạo thủ công và user muốn đảm bảo topics đã được gán trước khi request analysis.

```
POST /sets/{setId}/flashcards/{flashcardId}/topics/assign
POST /sets/{setId}/exams/{examId}/topics/assign
```

**Response `200 OK`:**
```json
{
  "status": "success",
  "message": "Topics assigned",
  "data": { "assigned": 12 }
}
```

`assigned` là số card/question được gán topic lần này (bỏ qua những card đã có topic).

**Khi nào frontend cần gọi:**
- Thông thường **không cần** — topic được gán tự động (async cho AI-generated, lazy cho manual khi trigger analysis).
- Gọi khi user thấy lỗi `400 "no topics assigned"` từ analysis endpoint và muốn retry.

---

## Part 3: Topic Accuracy — Cách Đọc Giá Trị

| accuracy    | Ý nghĩa           |
|-------------|-------------------|
| >= 0.75     | Nắm tốt (Strong)  |
| 0.50 – 0.74 | Trung bình        |
| < 0.50      | Cần ôn lại (Weak) |

---

## Part 4: End-to-End Flow

### Flow 1: Sau khi user kết thúc flashcard session

```
[Complete session]
       |
       v
POST /sessions/{sessionId}/analysis
       |
  ┌────┴────┐
201 Created  409 Conflict
       |           |
  Show result  Fetch history (GET /analyses)
                   |
              Show latest analysis
```

### Flow 2: Sau khi user submit exam

```
[Submit attempt]
       |
       v
POST /attempts/{attemptId}/analysis
       |
  ┌────┴────┐
201 Created  409 Conflict
       |           |
  Show result  Show existing analysis
```

### Flow 3: Set Overview

```
[User opens Set overview]
       |
       v
GET /sets/{setId}/analyses
       |
  ┌────┴────┐
 Empty    Has data
   |           |
   |    Show latest set analysis
   |    + contributingSources staleness warning
   |
POST /sets/{setId}/analysis
   |
  ┌─────────────┴──────────────┐
201 Created                 400 Bad Request
   |                            |
Show set analysis       "Study flashcards or
                         take exams first"
```

### Flow 4: Progress Tracking

```
GET /sets/{setId}/flashcards/{flashcardId}/analyses
  → List ordered newest first
  → Plot accuracy per topic across time
  → Show improvement trend
```
