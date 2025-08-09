const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

async function setupEnvironment() {
  console.log('🚀 AI4Life - Thiết lập môi trường phát triển\n');

  // Backend .env setup
  const backendEnvPath = path.join(__dirname, '../backend/.env');
  const backendEnvExamplePath = path.join(__dirname, '../backend/env.example');

  if (!fs.existsSync(backendEnvPath)) {
    console.log('📝 Thiết lập Backend Environment Variables...\n');

    // Read example file
    const envExample = fs.readFileSync(backendEnvExamplePath, 'utf8');
    let envContent = envExample;

    // Get OpenAI API Key
    const openaiKey = await question('Nhập OpenAI API Key (để trống nếu muốn dùng fallback): ');
    if (openaiKey.trim()) {
      envContent = envContent.replace('your_openai_api_key_here', openaiKey.trim());
    }

    // Get Gemini API Key (optional)
    const geminiKey = await question('Nhập Gemini API Key (tùy chọn, để trống để bỏ qua): ');
    if (geminiKey.trim()) {
      envContent = envContent.replace('your_gemini_api_key_here', geminiKey.trim());
    }

    // Generate JWT Secret
    const jwtSecret = require('crypto').randomBytes(64).toString('hex');
    envContent = envContent.replace('your_jwt_secret_key_here', jwtSecret);

    // Write .env file
    fs.writeFileSync(backendEnvPath, envContent);
    console.log('✅ Backend .env file created successfully!\n');
  } else {
    console.log('✅ Backend .env file already exists\n');
  }

  // Frontend .env setup
  const frontendEnvPath = path.join(__dirname, '../frontend/.env');
  
  if (!fs.existsSync(frontendEnvPath)) {
    const frontendEnvContent = `REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_APP_NAME=AI4Life
REACT_APP_VERSION=1.0.0
`;
    fs.writeFileSync(frontendEnvPath, frontendEnvContent);
    console.log('✅ Frontend .env file created successfully!\n');
  } else {
    console.log('✅ Frontend .env file already exists\n');
  }

  // Create database directory if not exists
  const dbDir = path.join(__dirname, '../database');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  console.log('🎉 Thiết lập hoàn tất! Bây giờ bạn có thể chạy:');
  console.log('');
  console.log('   npm run dev     # Chạy cả frontend và backend');
  console.log('   npm run dev:frontend  # Chỉ chạy frontend');
  console.log('   npm run dev:backend   # Chỉ chạy backend');
  console.log('');
  console.log('📖 Xem README.md để biết thêm chi tiết');

  rl.close();
}

setupEnvironment().catch(console.error);
