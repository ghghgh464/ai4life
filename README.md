# AI4Life - Ứng dụng tư vấn chọn ngành học 🎓

<div align="center">
  <img src="https://img.shields.io/badge/AI-Powered-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Node.js-18.0+-339933?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript" />
</div>

## 🎯 Mô tả

**AI4Life** là ứng dụng AI thông minh giúp học sinh tư vấn chọn ngành học phù hợp tại **FPT Polytechnic**. Ứng dụng phân tích sở thích, năng lực, điểm số và định hướng nghề nghiệp để đưa ra gợi ý ngành học chính xác nhất.

### ✨ Tính năng nổi bật
- 🤖 **AI Analysis**: Sử dụng GPT-4 để phân tích và tư vấn chính xác
- 📊 **Infographic**: Báo cáo kết quả đẹp mắt với biểu đồ trực quan  
- 💬 **AI Chatbot**: Tư vấn 24/7 về ngành học và nghề nghiệp
- 📱 **QR Code**: Chia sẻ kết quả dễ dàng
- 📄 **PDF Export**: Xuất báo cáo chi tiết
- 🎨 **Modern UI**: Giao diện hiện đại, thân thiện

## 🚀 Quick Start

### 1. Cài đặt nhanh
```bash
# Clone repository
git clone https://github.com/your-repo/ai4life.git
cd ai4life

# Setup tự động (khuyến nghị)
npm run setup
```

### 2. Chạy ứng dụng
```bash
# Development mode (cả frontend + backend)
npm run dev

# Riêng lẻ
npm run dev:frontend  # http://localhost:3000
npm run dev:backend   # http://localhost:3001
```

### 3. Truy cập ứng dụng
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🏗️ Kiến trúc hệ thống

```
ai4life/
├── 🎨 frontend/              # React.js Application
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── types/           # TypeScript definitions
│   └── public/              # Static assets
│
├── ⚙️ backend/               # Node.js API Server
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── middleware/      # Express middleware
│   └── dist/                # Compiled JavaScript
│
├── 🗃️ database/             # SQLite Database
│   ├── ai4life.db          # Main database
│   ├── schema.sql          # Database schema
│   └── migrations/         # Migration files
│
├── 📚 docs/                 # Documentation
│   ├── api.md              # API documentation
│   └── deployment.md       # Deployment guide
│
└── 🛠️ scripts/             # Utility scripts
    └── setup-env.js        # Environment setup
```

## 🔧 Công nghệ sử dụng

### Frontend
- **React 18.2** + **TypeScript** - Modern UI framework
- **Tailwind CSS** - Utility-first CSS framework  
- **Chart.js** - Data visualization
- **Axios** - HTTP client
- **React Router** - Client-side routing

### Backend  
- **Node.js** + **Express.js** + **TypeScript** - Server framework
- **SQLite** - Lightweight database
- **OpenAI GPT-4** - AI analysis engine
- **JWT** - Authentication
- **Helmet** - Security middleware

### DevOps
- **Concurrently** - Run multiple commands
- **PM2** - Process manager
- **ESLint** + **Prettier** - Code quality

## 📋 API Endpoints

### 🔐 Authentication
```http
POST /api/auth/register     # Đăng ký người dùng
GET  /api/auth/user/:id     # Thông tin người dùng
```

### 📝 Survey & Analysis  
```http
POST /api/survey/submit     # Gửi khảo sát và nhận phân tích AI
GET  /api/survey/:id        # Lấy thông tin khảo sát
```

### 🤖 AI Services
```http
POST /api/ai/chat          # Chat với AI
GET  /api/ai/chat/:sessionId  # Lịch sử chat
GET  /api/ai/status        # Trạng thái AI service
```

### 📊 Results
```http
GET  /api/results/:id      # Kết quả tư vấn
GET  /api/results/:id/qr   # Tạo mã QR
GET  /api/results/:id/pdf  # Xuất PDF
```

> 📖 **Chi tiết API**: Xem [docs/api.md](docs/api.md)

## ⚙️ Cấu hình

### Environment Variables

**Backend** (`.env`):
```env
# Server
PORT=3001
NODE_ENV=development

# AI APIs  
OPENAI_API_KEY=sk-your-openai-key
GEMINI_API_KEY=your-gemini-key

# Security
JWT_SECRET=your-jwt-secret
CORS_ORIGIN=http://localhost:3000
```

**Frontend** (`.env`):
```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_APP_NAME=AI4Life
```

## 🎯 Sử dụng

### 1. Khảo sát học sinh
- Nhập thông tin cá nhân (tên, tuổi, lớp)
- Chọn sở thích và kỹ năng
- Nhập điểm số các môn học
- Mô tả mục tiêu nghề nghiệp

### 2. Phân tích AI
- AI phân tích dữ liệu đầu vào
- Đối chiếu với 6 ngành học FPT Polytechnic
- Tính toán độ phù hợp (%)
- Đưa ra top 3 gợi ý tốt nhất

### 3. Xem kết quả
- Báo cáo chi tiết với infographic
- Điểm mạnh và khuyến nghị
- Biểu đồ trực quan
- Chia sẻ qua QR code hoặc PDF

### 4. Chat với AI
- Hỏi thêm về ngành học
- Tư vấn định hướng nghề nghiệp
- Thông tin tuyển sinh FPT

## 🏆 Demo

### Screenshots
| Trang chủ | Khảo sát | Kết quả |
|-----------|----------|---------|
| ![Home](docs/images/home.png) | ![Survey](docs/images/survey.png) | ![Results](docs/images/results.png) |

### Live Demo
- **Demo URL**: https://ai4life-demo.vercel.app
- **Test Account**: demo@ai4life.com / demo123

## 🚀 Deployment

### Development
```bash
npm run setup      # Thiết lập môi trường
npm run dev        # Chạy development server
```

### Production
```bash
npm run build      # Build production
npm start          # Start production server
```

### Docker
```bash
docker-compose up -d
```

> 📖 **Chi tiết Deployment**: Xem [docs/deployment.md](docs/deployment.md)

## 🧪 Testing

```bash
# Frontend tests
cd frontend && npm test

# Backend tests  
cd backend && npm test

# E2E tests
npm run test:e2e
```

## 🤝 Đóng góp

Dự án được phát triển cho **Cuộc thi AI4Life 2024** - FPT Polytechnic

### Team
- **Frontend Developer**: [Your Name]
- **Backend Developer**: [Your Name] 
- **AI Engineer**: [Your Name]
- **UI/UX Designer**: [Your Name]

### Contributing
1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🙏 Acknowledgments

- **FPT Polytechnic** - Cung cấp dữ liệu ngành học
- **OpenAI** - GPT-4 API cho AI analysis
- **React Community** - Amazing frontend framework
- **Node.js Community** - Powerful backend runtime

---

<div align="center">
  <p>Made with ❤️ for FPT Polytechnic students</p>
  <p>
    <a href="docs/api.md">📖 API Docs</a> •
    <a href="docs/deployment.md">🚀 Deployment</a> •
    <a href="mailto:support@ai4life.com">📧 Support</a>
  </p>
</div>
