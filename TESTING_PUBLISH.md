# Testing Guide - Publish Feature

## Status
✅ Backend: Running di `http://localhost:5000`  
✅ Frontend: Running di `http://localhost:8081`  
✅ MongoDB: Connected

## Perbaikan yang Dilakukan

### 1. **Publish.tsx**
- ✅ Tambah field `publicationYear` (Number, required)
- ✅ Ubah `field` menjadi `studyField`
- ✅ Ubah FormData key `file` menjadi `journalFile` (sesuai backend multer config)
- ✅ Connect ke backend API: `POST /api/publications`
- ✅ Handle response dengan benar
- ✅ Redirect ke `/dashboard` setelah sukses

### 2. **Dashboard.tsx**
- ✅ Fetch publications dari backend: `GET /api/publications`
- ✅ Update interface untuk match backend response
- ✅ Support search dan filter by studyField
- ✅ Update props untuk JournalCard dengan mapping yang benar

### 3. **JournalDetail.tsx**
- ✅ Fetch publication by ID dari backend
- ✅ Update interface untuk match backend response
- ✅ Download button yang bekerja dengan journalFileUrl

### 4. **Index.tsx**
- ✅ Buat proper landing page
- ✅ Auto redirect ke dashboard jika sudah login

### 5. **API Configuration**
- ✅ Buat `src/config/api.ts` untuk centralized API config
- ✅ Support environment variable `VITE_API_URL`

## Cara Testing Publish Feature

### Step 1: Register/Login
1. Buka `http://localhost:8081`
2. Klik "Get Started" atau "Register"
3. Isi form register:
   - Full Name: `John Doe`
   - Email: `john@test.com`
   - Password: `password123`
   - Confirm Password: `password123`
4. Klik "Register"

### Step 2: Publish New Publication
1. Setelah login, akan redirect ke Dashboard
2. Klik tombol "Add Publication" (tombol orange di kanan atas)
3. Isi form publish:
   - **Title**: "Machine Learning in Healthcare"
   - **Abstract**: "This research explores the application of ML algorithms..."
   - **Field of Study**: "Computer Science"
   - **Publication Year**: "2024"
   - **Authors**: Klik "Add Author" untuk menambah author
     - Author 1: "Dr. John Doe"
     - Author 2: "Dr. Jane Smith"
   - **Upload Paper**: Pilih file PDF atau DOCX (max 10MB)
4. Klik "Publish"
5. Akan muncul toast success dan redirect ke Dashboard

### Step 3: View Publications
1. Di Dashboard, akan muncul publikasi yang baru di-publish
2. Gunakan search bar untuk mencari publikasi
3. Gunakan filter untuk filter by study field
4. Klik "View Details" untuk melihat detail

### Step 4: View Publication Detail
1. Di halaman detail, bisa lihat:
   - Title
   - Authors
   - Publication Year
   - Study Field
   - Abstract lengkap
2. Klik "Download Paper" untuk download file yang di-upload

## API Endpoints yang Digunakan

### Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Publications
- `POST /api/publications` - Create publication (Private, with file upload)
- `GET /api/publications` - Get all publications (with search & filter)
- `GET /api/publications/:id` - Get publication by ID
- `PUT /api/publications/:id` - Update publication (Private)
- `DELETE /api/publications/:id` - Delete publication (Private)

## Request Format untuk Publish

```javascript
// FormData format
const formData = new FormData();
formData.append('title', 'Machine Learning in Healthcare');
formData.append('abstract', 'This research explores...');
formData.append('studyField', 'Computer Science');
formData.append('publicationYear', '2024');
formData.append('authors', JSON.stringify(['Dr. John Doe', 'Dr. Jane Smith']));
formData.append('journalFile', fileObject); // File PDF/DOC/DOCX
```

## Response Format

### Success Response
```json
{
  "status": "success",
  "message": "Publication created successfully",
  "data": {
    "publication": {
      "_id": "...",
      "title": "Machine Learning in Healthcare",
      "abstract": "This research explores...",
      "studyField": "Computer Science",
      "publicationYear": 2024,
      "authors": ["Dr. John Doe", "Dr. Jane Smith"],
      "journalFileUrl": "uploads/filename-123456.pdf",
      "uploader": {
        "_id": "...",
        "username": "John Doe",
        "email": "john@test.com"
      },
      "createdAt": "2024-11-22T...",
      "updatedAt": "2024-11-22T..."
    }
  }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Please provide all required fields",
  "error": "Validation error"
}
```

## Troubleshooting

### Publish Gagal - "Please provide all required fields"
- Pastikan semua field terisi (title, abstract, studyField, publicationYear, authors, file)
- Cek console browser untuk detail error

### Publish Gagal - "Journal file is required"
- Pastikan file sudah dipilih
- File harus PDF, DOC, atau DOCX
- Max file size: 10MB

### Publish Gagal - "Access denied. No token provided"
- User belum login
- Token expired, coba logout dan login lagi

### Publish Gagal - "Only PDF, DOC, and DOCX files are allowed"
- File format tidak didukung
- Hanya accept: .pdf, .doc, .docx

### CORS Error
- Pastikan backend allow origin dari `http://localhost:8081`
- Cek backend console untuk error

### MongoDB Connection Error
- Pastikan MongoDB running
- Cek connection string di backend `.env`

## Field Mapping

| Frontend State | FormData Key | Backend Model |
|---------------|--------------|---------------|
| title | title | title |
| abstract | abstract | abstract |
| studyField | studyField | studyField |
| publicationYear | publicationYear | publicationYear |
| authors | authors | authors |
| file | journalFile | journalFileUrl |

## Notes
- Authentication menggunakan JWT Bearer token
- Token disimpan di localStorage dengan key `scholarit_token`
- File upload menggunakan multipart/form-data
- Authors dikirim sebagai JSON string array
- Backend validate file type dan size
- Backend hanya allow uploader untuk edit/delete publikasinya
