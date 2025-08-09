-- AI4Life Database Schema

-- Bảng người dùng
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bảng ngành học FPT Polytechnic
CREATE TABLE IF NOT EXISTS majors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    career_prospects TEXT,
    required_skills TEXT,
    subjects TEXT, -- JSON array của các môn học
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bảng khảo sát người dùng
CREATE TABLE IF NOT EXISTS surveys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name VARCHAR(255) NOT NULL,
    age INTEGER,
    current_grade VARCHAR(20),
    interests TEXT, -- JSON array
    skills TEXT, -- JSON array
    academic_scores TEXT, -- JSON object với điểm các môn
    career_goals TEXT,
    learning_style VARCHAR(50),
    work_environment_preference VARCHAR(50),
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Bảng kết quả tư vấn
CREATE TABLE IF NOT EXISTS consultation_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    survey_id INTEGER NOT NULL,
    recommended_majors TEXT, -- JSON array của major IDs và scores
    analysis_summary TEXT,
    strengths TEXT,
    recommendations TEXT,
    ai_response TEXT, -- Full AI response
    confidence_score FLOAT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (survey_id) REFERENCES surveys(id)
);

-- Bảng chat history
CREATE TABLE IF NOT EXISTS chat_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    session_id VARCHAR(255) NOT NULL,
    messages TEXT, -- JSON array of messages
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert dữ liệu mẫu các ngành học FPT Polytechnic
INSERT OR IGNORE INTO majors (name, code, description, career_prospects, required_skills, subjects) VALUES
('Công nghệ thông tin', 'IT', 'Đào tạo chuyên gia về phát triển phần mềm, hệ thống thông tin', 'Lập trình viên, System Admin, DevOps, Data Analyst', 'Tư duy logic, giải quyết vấn đề, học hỏi liên tục', '["Lập trình", "Cơ sở dữ liệu", "Mạng máy tính", "Toán học"]'),

('Thiết kế đồ họa', 'GD', 'Đào tạo về thiết kế đồ họa, UI/UX, multimedia', 'Graphic Designer, UI/UX Designer, Art Director', 'Sáng tạo, thẩm mỹ, sử dụng phần mềm thiết kế', '["Photoshop", "Illustrator", "Typography", "Color Theory"]'),

('Marketing', 'MKT', 'Đào tạo về marketing digital, truyền thông, bán hàng', 'Marketing Manager, Digital Marketer, Content Creator', 'Giao tiếp, sáng tạo, phân tích thị trường', '["Marketing căn bản", "Digital Marketing", "Social Media", "Analytics"]'),

('Kế toán', 'ACC', 'Đào tạo về kế toán, tài chính, kiểm toán', 'Kế toán viên, Kiểm toán viên, Chuyên viên tài chính', 'Tính toán chính xác, tỉ mỉ, trung thực', '["Kế toán căn bản", "Thuế", "Kiểm toán", "Tài chính doanh nghiệp"]'),

('Quản trị kinh doanh', 'BA', 'Đào tạo về quản lý, điều hành doanh nghiệp', 'Manager, Business Analyst, Entrepreneur', 'Lãnh đạo, ra quyết định, giao tiếp', '["Quản trị học", "Kinh tế học", "Tài chính", "Marketing"]'),

('Điện tử viễn thông', 'ET', 'Đào tạo về điện tử, viễn thông, IoT', 'Kỹ sư điện tử, Kỹ sư viễn thông, IoT Developer', 'Toán học, vật lý, tư duy kỹ thuật', '["Điện tử cơ bản", "Viễn thông", "Vi xử lý", "IoT"]');
