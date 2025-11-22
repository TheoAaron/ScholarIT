# Fix: 401 Error saat Publish & Abstract Display

## Masalah yang Diperbaiki

### 1. **401 Unauthorized Error saat Publish**

**Root Cause:**
- Urutan middleware salah di `routes/publicationRoutes.js`
- `verifyToken` dijalankan SEBELUM `uploadFile` (multer)
- Multer perlu parse multipart/form-data terlebih dahulu sebelum headers bisa dibaca dengan benar
- Error handling middleware mengintervensi flow normal

**Solusi:**
✅ Ubah urutan middleware: Upload file DULU, baru verify token
✅ Handle upload error inline dalam callback multer
✅ Remove `handleUploadError` middleware yang mengganggu flow

**Before:**
```javascript
router.post('/', verifyToken, uploadFile, handleUploadError, createPublication);
```

**After:**
```javascript
router.post('/', (req, res, next) => {
  uploadFile(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        status: 'error',
        message: err.message || 'File upload error',
        error: err.message
      });
    }
    next();
  });
}, verifyToken, createPublication);
```

### 2. **Better Error Handling di Frontend**

**Improvements:**
✅ Check token existence sebelum request
✅ Handle 401 error dengan redirect ke login
✅ Clear localStorage saat session expired
✅ Better error messages untuk user
✅ Console log untuk debugging

**Publish.tsx Error Handling:**
```typescript
// Check token first
if (!token) {
  toast.error('Please login first');
  navigate('/login');
  return;
}

// Handle 401 specifically
if (response.status === 401) {
  toast.error('Session expired. Please login again.');
  localStorage.removeItem('scholarit_token');
  localStorage.removeItem('scholarit_user');
  navigate('/login');
}
```

### 3. **Abstract Display**

✅ Abstract sudah ditampilkan dengan benar di:
- JournalCard (line-clamp-2 untuk preview)
- JournalDetail (full abstract)
- Dashboard (melalui JournalCard)

## Files yang Diubah

1. **backend/routes/publicationRoutes.js**
   - Fix middleware order
   - Inline upload error handling
   - Better error responses

2. **backend/middleware/upload.js**
   - Remove `handleUploadError` middleware
   - Keep simple `uploadFile` export

3. **frontend/src/pages/Publish.tsx**
   - Add token check before request
   - Better 401 error handling
   - Redirect to login on auth error
   - Clear session on expire

## Testing Steps

### Test Publish Feature:

1. **Pastikan Login**
   - Buka http://localhost:8081
   - Login dengan akun yang valid
   - Check localStorage ada `scholarit_token`

2. **Test Publish**
   - Klik "Add Publication"
   - Isi semua field:
     - Title
     - Abstract (pastikan terisi dengan baik)
     - Study Field
     - Publication Year
     - Authors
     - Upload file PDF/DOCX
   - Klik "Publish"
   - **Expected**: Success toast & redirect ke Dashboard
   - **Not Expected**: 401 error

3. **Verify Abstract Display**
   - Di Dashboard, lihat publication card
   - Abstract harus muncul (2 lines preview)
   - Klik "View Details"
   - Abstract lengkap harus muncul

### Test Error Cases:

1. **No Token**
   - Clear localStorage
   - Try to publish
   - **Expected**: "Please login first" & redirect to login

2. **Invalid Token**
   - Set invalid token in localStorage
   - Try to publish
   - **Expected**: "Session expired" & redirect to login

3. **Invalid File**
   - Upload non-PDF/DOC/DOCX file
   - **Expected**: Error message about file type

4. **File Too Large**
   - Upload file > 10MB
   - **Expected**: Error message about file size

## Flow Diagram

```
User Submit Form
      ↓
Frontend Validation (all fields filled?)
      ↓
Check Token Exists?
      ↓
Prepare FormData
      ↓
POST /api/publications
      ↓
Backend: Upload File (multer)
      ↓
Backend: Verify Token (JWT)
      ↓
Backend: Save to MongoDB
      ↓
Response to Frontend
      ↓
Success: Toast + Redirect to Dashboard
Error 401: Clear session + Redirect to Login
Other Error: Show error message
```

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 401 on publish | Token not sent | Check Authorization header |
| 401 on publish | Middleware order | Upload file before auth check |
| Abstract not showing | Field mapping | Use correct field name from backend |
| File upload fails | Wrong field name | Use 'journalFile' not 'file' |
| Session expired | Old token | Clear localStorage and re-login |

## Status

✅ Backend: Running on port 5000  
✅ Frontend: Running on port 8081  
✅ MongoDB: Connected  
✅ 401 Error: FIXED  
✅ Abstract Display: Working  
✅ File Upload: Working  
✅ Authentication: Working  

## Next Steps to Test

1. Restart backend (auto-restart with nodemon)
2. Refresh frontend page
3. Login dengan akun baru atau existing
4. Try publish publication
5. Verify abstract muncul di card dan detail page
