# 05 — API 接口规范

## 通用约定

- **Base URL**：`/api`
- **Content-Type**：`application/json`（文件上传使用 `multipart/form-data`）
- **响应格式**：
  ```json
  // 成功
  { "data": ... }

  // 失败
  { "error": "错误描述" }
  ```
- **HTTP 状态码**：
  - 200：成功
  - 201：创建成功
  - 400：请求参数错误
  - 404：资源不存在
  - 500：服务器错误

---

## 1. 会议 API

### GET `/api/meetings`
获取所有会议列表。

**Query 参数**：
| 参数 | 类型 | 说明 |
|------|------|------|
| status | string | 可选，按状态过滤 |
| date | string | 可选，按日期过滤 (YYYY-MM-DD) |

### POST `/api/meetings`
创建新会议。

**请求体**：
```json
{
  "title": "Q2 产品评审",
  "date": "2026-05-18",
  "startTime": "14:00",
  "endTime": "15:30",
  "duration": 90,
  "host": "张三",
  "attendees": "李四,王五,赵六",
  "link": "https://meeting.tencent.com/xxx",
  "platform": "tencent",
  "agenda": "1. 需求评审\n2. 排期确认"
}
```

### PUT `/api/meetings/[id]`
更新会议信息。请求体同 POST（部分字段即可）。

### DELETE `/api/meetings/[id]`
删除会议及其关联数据（级联删除）。

### GET `/api/meetings/[id]`
获取单个会议详情。

### POST `/api/meetings/parse-link`
解析会议链接。

**请求体**：`{ "link": "https://meeting.tencent.com/dm/xxx" }`
**响应**：`{ "platform": "tencent", "title": "解析出的会议标题" }`

---

## 2. 文件 API

### POST `/api/documents`
上传文件（`multipart/form-data`）。

**请求体**：
| 字段 | 类型 | 说明 |
|------|------|------|
| meetingId | string | 所属会议ID |
| file | File | 文件 |

**支持格式**：.doc, .docx, .pdf, .ppt, .pptx, .png, .jpg, .gif

### GET `/api/documents?meetingId=xxx`
获取指定会议的文件列表。

### GET `/api/documents/[id]/download`
下载文件。

### DELETE `/api/documents/[id]`
删除文件。

---

## 3. 转写 API

### GET `/api/transcriptions?meetingId=xxx`
获取指定会议的转写记录列表。

### POST `/api/transcriptions`
添加转写记录。

**请求体**：
```json
{
  "meetingId": "xxx",
  "content": "转写文本内容"
}
```

### PUT `/api/transcriptions/[id]`
更新转写记录（如标记重点）。

**请求体**：
```json
{
  "isHighlighted": true
}
```

---

## 4. 待办 API

### GET `/api/todos`
获取所有待办（支持跨会议）。

**Query 参数**：
| 参数 | 类型 | 说明 |
|------|------|------|
| meetingId | string | 按会议过滤 |
| status | string | 按状态过滤 |

### POST `/api/todos`
创建待办。

**请求体**：
```json
{
  "meetingId": "xxx",
  "content": "完成产品方案修改",
  "assignee": "张三",
  "dueDate": "2026-05-20"
}
```

### PUT `/api/todos/[id]`
更新待办（状态、内容等）。

### DELETE `/api/todos/[id]`
删除待办。

### GET `/api/todos/export`
导出所有待办为 Excel 文件（返回 `.xlsx` 二进制流）。

---

## 5. 纪要 API

### GET `/api/minutes?meetingId=xxx`
获取指定会议纪要。

### POST `/api/minutes`
生成/创建纪要。

**请求体**：
```json
{
  "meetingId": "xxx"
}
```

### PUT `/api/minutes/[id]`
编辑纪要内容。

**请求体**：
```json
{
  "summary": "...",
  "highlights": "...",
  "content": "..."
}
```
