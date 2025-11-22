# ScholarIT Backend API

Backend API untuk ScholarIT - Platform Publikasi Akademik

## Tech Stack
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Multer (File Upload)
- bcrypt (Password Hashing)

## Installation

```bash
npm install
```

## Environment Variables

Buat file `.env` di root directory dengan isi:

```
MONGODB_URI=mongodb://localhost:27017/scholarit
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
FRONTEND_URL=http://localhost:3000
```

## Running the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get user yang sedang login (Private)

### Publications
- `GET /api/publications` - Get semua publikasi (dengan search & filter)
- `GET /api/publications/:id` - Get publikasi by ID
- `POST /api/publications` - Create publikasi baru (Private)
- `PUT /api/publications/:id` - Update publikasi (Private)
- `DELETE /api/publications/:id` - Delete publikasi (Private)

## Struktur Folder

```
backend/
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   └── publicationController.js
├── middleware/
│   ├── auth.js
│   └── upload.js
├── models/
│   ├── User.js
│   └── Publication.js
├── routes/
│   ├── authRoutes.js
│   └── publicationRoutes.js
├── uploads/
├── .env
├── .gitignore
├── package.json
└── server.js
```

## Response Format

Semua response API menggunakan format JSON konsisten:

Success:
```json
{
  "status": "success",
  "message": "Operation successful",
  "data": { ... }
}
```

Error:
```json
{
  "status": "error",
  "message": "Error message",
  "error": "Error details"
}
```
