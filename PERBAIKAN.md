# Perbaikan Register & Login

## Masalah yang Diperbaiki

### 1. **API Endpoint Error**
- **Masalah**: Frontend memanggil `/api/auth/register` yang mengarah ke `http://localhost:3000/api` (tidak ada)
- **Solusi**: Menambahkan konfigurasi API di `src/config/api.ts` yang mengarah ke `http://localhost:5000`

### 2. **Field Mismatch**
- **Masalah**: Backend mengharapkan field `username` tetapi frontend mengirim `name`
- **Solusi**: Update `AuthContext.tsx` untuk mengirim `username: name`

### 3. **Response Format Berbeda**
- **Masalah**: Backend mengirim `{ status, data: { user, token }, message }` tetapi frontend mengharapkan `{ user, token }`
- **Solusi**: Update `AuthContext.tsx` untuk parse response yang benar dari backend

### 4. **CORS Issues**
- **Masalah**: Backend tidak mengizinkan request dari `http://localhost:8081`
- **Solusi**: Update CORS config di `backend/server.js` untuk allow multiple origins

## File yang Dibuat/Diubah

### Frontend
1. ✅ `src/config/api.ts` - Konfigurasi API endpoints
2. ✅ `src/contexts/AuthContext.tsx` - Fix register & login logic
3. ✅ `.env` - Environment variables untuk API URL
4. ✅ `vite.config.ts` - Tambah proxy untuk /api requests

### Backend
1. ✅ `server.js` - Update CORS untuk accept multiple origins
2. ✅ `.env` - Tambah environment variables

## Cara Menggunakan

### 1. Jalankan Backend
```bash
cd backend
npm run dev
```
Backend akan running di `http://localhost:5000`

### 2. Jalankan Frontend
```bash
cd frontend
npm run dev
```
Frontend akan running di `http://localhost:8081` (atau 8080)

### 3. Test Register
1. Buka browser ke `http://localhost:8081/register`
2. Isi form dengan:
   - Full Name: Nama Anda
   - Email: email@example.com
   - Password: minimal 6 karakter
   - Confirm Password: sama dengan password
3. Klik Register
4. Jika sukses, akan redirect ke homepage

### 4. Test Login
1. Buka browser ke `http://localhost:8081/login`
2. Gunakan email dan password yang sudah didaftarkan
3. Klik Login
4. Jika sukses, akan redirect ke homepage

## Catatan Penting

- **MongoDB**: Pastikan MongoDB running di `mongodb://localhost:27017`
- **Ports**: 
  - Backend: `5000`
  - Frontend: `8080` atau `8081`
- **Token**: Disimpan di `localStorage` dengan key `scholarit_token`
- **User Data**: Disimpan di `localStorage` dengan key `scholarit_user`

## Troubleshooting

### Register Gagal
1. Cek console browser (F12) untuk error message
2. Cek terminal backend untuk error
3. Pastikan MongoDB running
4. Pastikan email belum terdaftar

### CORS Error
1. Pastikan backend sudah allow origin dari frontend port
2. Restart backend server setelah update CORS config

### Connection Refused
1. Pastikan backend running di port 5000
2. Cek `.env` di frontend, pastikan `VITE_API_URL=http://localhost:5000`
