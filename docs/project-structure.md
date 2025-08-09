# Cấu trúc dự án AI4Life

## Tổng quan
```
ai4life/
├── frontend/                 # React Frontend Application
│   ├── public/              # Static files
│   ├── src/                 # Source code
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API services
│   │   ├── utils/           # Utility functions
│   │   ├── types/           # TypeScript type definitions
│   │   └── styles/          # CSS và Tailwind styles
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/                  # Node.js Backend API
│   ├── src/                 # Source code
│   │   ├── controllers/     # Route controllers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic services
│   │   ├── middleware/      # Express middleware
│   │   ├── utils/           # Utility functions
│   │   └── server.ts        # Main server file
│   ├── package.json
│   ├── tsconfig.json
│   └── env.example          # Environment variables template
│
├── database/                # Database files
│   ├── migrations/          # Database migration files
│   └── ai4life.db          # SQLite database file
│
├── docs/                    # Documentation
│   ├── api.md              # API documentation
│   ├── deployment.md       # Deployment guide
│   └── project-structure.md # This file
│
└── README.md               # Main project documentation
```

## Mô tả các thư mục chính

### Frontend (`/frontend`)
- **React.js application** với TypeScript
- **Tailwind CSS** cho styling
- **Components**: Các component tái sử dụng
- **Pages**: Các trang chính của ứng dụng
- **Services**: Gọi API và xử lý dữ liệu
- **Types**: Định nghĩa TypeScript interfaces

### Backend (`/backend`)
- **Express.js API** với TypeScript
- **Controllers**: Xử lý HTTP requests
- **Models**: Định nghĩa database schema
- **Services**: Logic nghiệp vụ và tích hợp AI
- **Middleware**: Authentication, validation, logging

### Database (`/database`)
- **SQLite database** cho development
- **Migrations**: Version control cho database schema
- **Seed data**: Dữ liệu mẫu về các ngành học FPT

## Luồng dữ liệu
1. **User Input** → Frontend form
2. **API Call** → Backend endpoint
3. **AI Processing** → OpenAI/Gemini API
4. **Data Storage** → SQLite database
5. **Response** → Frontend display results
