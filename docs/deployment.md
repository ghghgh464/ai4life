# AI4Life - Hướng dẫn Deployment

## Yêu cầu hệ thống

### Development
- **Node.js:** >= 18.0.0
- **NPM:** >= 8.0.0
- **RAM:** >= 4GB
- **Disk:** >= 2GB free space

### Production
- **Server:** Linux/Ubuntu 20.04+ hoặc Windows Server
- **Node.js:** >= 18.0.0 LTS
- **RAM:** >= 8GB (khuyến nghị)
- **Disk:** >= 10GB free space
- **Database:** SQLite (included) hoặc PostgreSQL

---

## Local Development

### 1. Clone và Setup
```bash
git clone <repository-url>
cd ai4life

# Cài đặt dependencies
npm run install:all

# Thiết lập environment variables
npm run setup
```

### 2. Cấu hình API Keys
Trong quá trình setup, bạn sẽ được yêu cầu nhập:
- **OpenAI API Key** (bắt buộc để có AI tốt nhất)
- **Gemini API Key** (tùy chọn, backup cho OpenAI)

**Lấy OpenAI API Key:**
1. Truy cập https://platform.openai.com/api-keys
2. Tạo account và verify
3. Tạo new API key
4. Copy và paste vào setup script

### 3. Chạy Development Server
```bash
# Chạy cả frontend và backend
npm run dev

# Hoặc chạy riêng lẻ
npm run dev:frontend  # http://localhost:3000
npm run dev:backend   # http://localhost:3001
```

### 4. Kiểm tra
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/health
- Database: `database/ai4life.db` được tạo tự động

---

## Production Deployment

### Option 1: VPS/Server truyền thống

#### 1. Chuẩn bị Server
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Cài đặt Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Cài đặt PM2 (Process Manager)
sudo npm install -g pm2

# Cài đặt Nginx (Web Server)
sudo apt install nginx -y
```

#### 2. Deploy Application
```bash
# Clone code
git clone <repository-url> /var/www/ai4life
cd /var/www/ai4life

# Install dependencies
npm run install:all

# Setup environment (sử dụng production API keys)
npm run setup

# Build production
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 3. Cấu hình Nginx
```nginx
# /etc/nginx/sites-available/ai4life
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/ai4life/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/ai4life /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 4. SSL với Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

### Option 2: Docker Deployment

#### 1. Tạo Dockerfile
```dockerfile
# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY backend/package*.json ./
RUN npm install --production

COPY backend/ ./
RUN npm run build

EXPOSE 3001
CMD ["npm", "start"]
```

#### 2. Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: 
      context: .
      dockerfile: backend/Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    volumes:
      - ./database:/app/database

  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
```

#### 3. Deploy với Docker
```bash
# Build và start
docker-compose up -d

# Check logs
docker-compose logs -f

# Update
docker-compose pull
docker-compose up -d --force-recreate
```

### Option 3: Cloud Platforms

#### Vercel (Frontend) + Railway (Backend)

**Frontend trên Vercel:**
```bash
# Build settings
Build Command: npm run build
Output Directory: build
Install Command: npm install

# Environment Variables
REACT_APP_API_URL=https://your-backend.railway.app/api
```

**Backend trên Railway:**
```bash
# Deploy settings
Start Command: npm start
Build Command: npm run build

# Environment Variables  
NODE_ENV=production
PORT=3001
OPENAI_API_KEY=your_key_here
DATABASE_URL=./database/ai4life.db
```

#### Heroku Deployment
```bash
# Install Heroku CLI
npm install -g heroku

# Login và create app
heroku login
heroku create ai4life-backend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set OPENAI_API_KEY=your_key_here

# Deploy
git push heroku main
```

---

## Environment Variables

### Backend (.env)
```env
# Server
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com

# Database
DATABASE_URL=./database/ai4life.db

# AI APIs
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...

# Security
JWT_SECRET=your-super-secret-jwt-key
```

### Frontend (.env)
```env
REACT_APP_API_URL=https://your-backend-domain.com/api
REACT_APP_APP_NAME=AI4Life
REACT_APP_VERSION=1.0.0
```

---

## Monitoring và Logging

### PM2 Monitoring
```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs

# Restart app
pm2 restart ai4life

# Auto restart on file changes
pm2 restart ai4life --watch
```

### Log Files
- **Backend logs:** `backend/logs/`
- **Nginx logs:** `/var/log/nginx/`
- **PM2 logs:** `~/.pm2/logs/`

---

## Backup và Recovery

### Database Backup
```bash
# Backup SQLite database
cp database/ai4life.db database/ai4life_backup_$(date +%Y%m%d).db

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp database/ai4life.db backups/ai4life_$DATE.db
find backups/ -name "*.db" -mtime +7 -delete
```

### Full Application Backup
```bash
# Create backup
tar -czf ai4life_backup_$(date +%Y%m%d).tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=build \
  --exclude=dist \
  /var/www/ai4life
```

---

## Troubleshooting

### Common Issues

1. **Port already in use**
```bash
# Kill process on port
sudo lsof -ti:3001 | xargs kill -9
```

2. **Database locked**
```bash
# Restart backend service
pm2 restart ai4life-backend
```

3. **Out of memory**
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max_old_space_size=4096" npm start
```

4. **SSL Certificate issues**
```bash
# Renew Let's Encrypt certificate
sudo certbot renew
sudo systemctl restart nginx
```

### Performance Optimization

1. **Enable Gzip compression**
2. **Use CDN for static assets**
3. **Implement Redis caching**
4. **Database indexing**
5. **Load balancing with multiple instances**

---

## Security Checklist

- ✅ HTTPS enabled
- ✅ Environment variables secured
- ✅ API rate limiting active
- ✅ CORS properly configured
- ✅ Database access restricted
- ✅ Regular security updates
- ✅ Firewall configured
- ✅ Backup strategy in place
