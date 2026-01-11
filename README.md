# Mezmo - Railway Backend API

A complete Node.js/Express backend API deployed on Railway with PostgreSQL database.

## Features

- ✅ User authentication (Register/Login) with JWT
- ✅ Protected routes with token authentication
- ✅ PostgreSQL database with Railway
- ✅ RESTful API design
- ✅ CORS enabled
- ✅ Environment variable configuration
- ✅ Production-ready error handling

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL (Railway)
- **Authentication**: JWT + bcrypt
- **Deployment**: Railway

## Project Structure

```
mezmo/
├── config/
│   └── database.js         # PostgreSQL connection config
├── database/
│   └── schema.sql          # Database schema
├── middleware/
│   └── auth.js             # JWT authentication middleware
├── routes/
│   ├── auth.js             # Auth routes (register/login)
│   ├── users.js            # User profile routes
│   └── data.js             # Data CRUD routes
├── .env                    # Environment variables
├── .gitignore
├── server.js               # Main application entry
├── package.json
└── railway.json            # Railway deployment config

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users (Protected)
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile

### Data (Protected)
- `GET /api/data` - Get all data items for user
- `GET /api/data/:id` - Get single data item
- `POST /api/data` - Create new data item
- `PUT /api/data/:id` - Update data item
- `DELETE /api/data/:id` - Delete data item

### Health Check
- `GET /health` - Server health status

## Local Development

### Prerequisites

- Node.js 18+ installed
- PostgreSQL installed locally (or use Railway's database)

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   - Copy `.env` and update with your values
   - For local PostgreSQL: `DATABASE_URL=postgresql://user:password@localhost:5432/mezmo`
   - Generate JWT secret: `openssl rand -base64 32`

3. **Initialize database**
   ```bash
   # Connect to your PostgreSQL and run:
   psql -U your_user -d your_database -f database/schema.sql
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   Server runs on `http://localhost:3000`

## Deploy to Railway

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub

### Step 2: Deploy from GitHub

1. Click "New Project" in Railway dashboard
2. Select "Deploy from GitHub repo"
3. Choose your `mezmo` repository
4. Railway will auto-detect it's a Node.js project

### Step 3: Add PostgreSQL Database
1. In your Railway project, click "+ New"
2. Select "Database" → "PostgreSQL"
3. Railway automatically creates `DATABASE_URL` environment variable

### Step 4: Set Environment Variables
1. Go to your service → "Variables" tab
2. Add these variables:
   ```
   JWT_SECRET=your-generated-secret-key
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-domain.com
   ```

### Step 5: Initialize Database Schema
1. In Railway, go to PostgreSQL service
2. Click "Data" tab
3. Click "Query" and paste contents of `database/schema.sql`
4. Execute the query

### Step 6: Deploy
- Railway automatically deploys on git push
- Get your public URL from the "Settings" tab
- Test with: `https://your-app.railway.app/health`

## Usage Examples

### Register User
```bash
curl -X POST https://your-app.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword",
    "name": "John Doe"
  }'
```

### Login
```bash
curl -X POST https://your-app.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword"
  }'
```

### Get User Profile (Protected)
```bash
curl https://your-app.railway.app/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Data Item (Protected)
```bash
curl -X POST https://your-app.railway.app/api/data \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "My First Item",
    "content": "This is the content"
  }'
```

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | Auto-set by Railway |
| `JWT_SECRET` | Secret key for JWT tokens | Yes | Random 32-char string |
| `PORT` | Server port | No | 3000 (Railway sets this) |
| `NODE_ENV` | Environment mode | No | production |
| `FRONTEND_URL` | Frontend domain for CORS | No | Your frontend URL |

## Database Schema

### Users Table
- `id` - Serial primary key
- `email` - Unique email address
- `password` - Bcrypt hashed password
- `name` - User's name (optional)
- `created_at` - Registration timestamp
- `updated_at` - Last update timestamp

### Data Table
- `id` - Serial primary key
- `user_id` - Foreign key to users
- `title` - Data item title
- `content` - Data item content (text)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## Security Features

- Password hashing with bcrypt (10 rounds)
- JWT token authentication
- Protected routes with middleware
- SQL injection prevention with parameterized queries
- CORS configuration
- Environment variable security

## License

MIT
