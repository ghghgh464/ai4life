# AI4Life API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication
Hiện tại API không yêu cầu authentication phức tạp. Chỉ cần user registration đơn giản.

## API Endpoints

### Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "OK",
  "message": "AI4Life Backend is running"
}
```

---

### Auth Routes (`/api/auth`)

#### Register User
```http
POST /api/auth/register
```
**Body:**
```json
{
  "name": "Nguyễn Văn A",
  "email": "user@example.com",
  "phone": "0123456789"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Nguyễn Văn A",
    "email": "user@example.com",
    "phone": "0123456789",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Get User
```http
GET /api/auth/user/:id
```

#### Update User
```http
PUT /api/auth/user/:id
```

#### Get User History
```http
GET /api/auth/user/:id/history
```

---

### Survey Routes (`/api/survey`)

#### Submit Survey
```http
POST /api/survey/submit
```
**Body:**
```json
{
  "name": "Nguyễn Văn A",
  "age": 18,
  "currentGrade": "12",
  "interests": ["Công nghệ thông tin", "Lập trình"],
  "skills": ["Lập trình", "Tư duy logic"],
  "academicScores": {
    "math": 8,
    "physics": 7,
    "chemistry": 6,
    "biology": 5,
    "literature": 7,
    "english": 8,
    "history": 6,
    "geography": 5
  },
  "careerGoals": "Trở thành lập trình viên",
  "learningStyle": "visual",
  "workEnvironmentPreference": "office"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "surveyId": 1,
    "recommendedMajors": [
      {
        "majorId": 1,
        "majorName": "Công nghệ thông tin",
        "majorCode": "IT",
        "matchScore": 95,
        "reasons": ["Có sở thích về lập trình", "Điểm toán cao"]
      }
    ],
    "analysisSummary": "Phân tích tổng quan...",
    "strengths": ["Tư duy logic tốt", "Yêu thích công nghệ"],
    "recommendations": ["Học thêm về AI", "Tham gia dự án thực tế"],
    "confidenceScore": 0.95,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Get Survey
```http
GET /api/survey/:id
```

---

### AI Routes (`/api/ai`)

#### Chat with AI
```http
POST /api/ai/chat
```
**Body:**
```json
{
  "message": "Ngành IT học những gì?",
  "sessionId": "optional-session-id"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "response": "Ngành Công nghệ thông tin tại FPT Polytechnic...",
    "sessionId": "uuid-session-id",
    "messageId": "uuid-message-id"
  }
}
```

#### Get Chat History
```http
GET /api/ai/chat/:sessionId
```

#### Delete Chat Session
```http
DELETE /api/ai/chat/:sessionId
```

#### AI Service Status
```http
GET /api/ai/status
```

---

### Results Routes (`/api/results`)

#### Get Consultation Result
```http
GET /api/results/:id
```

#### Generate QR Code
```http
GET /api/results/:id/qr
```
**Response:**
```json
{
  "success": true,
  "data": {
    "qrCode": "data:image/png;base64,...",
    "url": "http://localhost:3000/results/1",
    "resultId": "1"
  }
}
```

#### Export PDF
```http
GET /api/results/:id/pdf
```
**Response:** Binary PDF data

#### Get All Results (Admin)
```http
GET /api/results?page=1&limit=10
```

---

## Error Responses

Tất cả API endpoints trả về format lỗi thống nhất:

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description (in development mode)"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting
- **Limit:** 100 requests per 15 minutes per IP
- **Headers:** Rate limit info được trả về trong response headers

---

## Database Schema

### Tables
1. **users** - Thông tin người dùng
2. **majors** - Danh sách ngành học FPT Polytechnic
3. **surveys** - Dữ liệu khảo sát
4. **consultation_results** - Kết quả tư vấn AI
5. **chat_sessions** - Lịch sử chat

### Sample Data
Database được tự động seed với 6 ngành học chính của FPT Polytechnic:
- Công nghệ thông tin (IT)
- Thiết kế đồ họa (GD)  
- Marketing (MKT)
- Kế toán (ACC)
- Quản trị kinh doanh (BA)
- Điện tử viễn thông (ET)
