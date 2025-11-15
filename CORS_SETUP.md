# Hướng dẫn cấu hình CORS cho Backend NestJS

## ⚠️ Vấn đề hiện tại

Frontend đang chạy ở: `http://localhost:5173`  
Backend đang chạy ở: `http://localhost:3201`

Lỗi CORS: Backend chưa cho phép frontend truy cập API.

---

## 🔧 Giải pháp: Cấu hình CORS trong NestJS

### Bước 1: Mở file `src/main.ts` trong project backend

### Bước 2: Thêm cấu hình CORS

**Option 1: Đơn giản nhất (Khuyên dùng)**

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // ✅ Enable CORS - Thêm code này
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Global prefix (nếu có)
  app.setGlobalPrefix('api');

  await app.listen(3201);
  console.log('🚀 Server is running on http://localhost:3201');
}
bootstrap();
```

**Option 2: Cho phép tất cả origins (Development only)**

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // ⚠️ CHỈ dùng trong development
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  await app.listen(3201);
}
bootstrap();
```

**Option 3: Theo môi trường (Production-ready)**

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? ['https://your-admin-domain.com']
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4200'];

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  });

  await app.listen(3201);
}
bootstrap();
```

### Bước 3: Restart Backend

```bash
# Dừng backend hiện tại (Ctrl + C)
# Sau đó chạy lại:
npm run start:dev
```

### Bước 4: Kiểm tra Backend

1. Mở browser: http://localhost:3201/api/dashboard/stats
2. Phải thấy JSON response (không lỗi)
3. Check Console không còn CORS error

### Bước 5: Kết nối Frontend

Sau khi backend đã cấu hình CORS thành công:

1. **Mở file `.env` trong admin-dashboard**
2. **Đổi `VITE_USE_MOCK_DATA=false`**
3. **Restart frontend**: `npm start`

---

## ✅ Checklist

- [ ] Backend đang chạy ở port 3201
- [ ] Đã thêm `app.enableCors()` vào `main.ts`
- [ ] Đã restart backend
- [ ] Test API trực tiếp trong browser không lỗi
- [ ] Đổi `VITE_USE_MOCK_DATA=false` trong `.env`
- [ ] Restart frontend

---

## 🐛 Troubleshooting

### Vẫn còn CORS error?

1. **Kiểm tra backend logs** khi frontend gọi API
2. **Xóa cache browser**: Ctrl + Shift + Delete
3. **Hard refresh**: Ctrl + F5
4. **Kiểm tra port**: Backend phải chạy đúng port 3201
5. **Kiểm tra global prefix**: Nếu có `app.setGlobalPrefix('api')` thì URL phải có `/api`

### Backend không khởi động được?

```bash
# Kiểm tra dependencies
npm install

# Xóa node_modules và cài lại
rm -rf node_modules
npm install

# Chạy lại
npm run start:dev
```

### Alternative: Proxy qua Vite (Nếu CORS vẫn không work)

File `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3201',
        changeOrigin: true,
      }
    }
  }
})
```

Sau đó đổi API URL trong services: từ `http://localhost:3201/api` thành `/api`

---

## 📞 Need Help?

Nếu vẫn gặp vấn đề, cung cấp:
1. Backend logs khi gọi API
2. Network tab trong Chrome DevTools
3. File `main.ts` hiện tại

