# Quick Railway Deployment Guide

## 🚀 Deploy in 5 Minutes

### Step 1: Push to GitHub ✅
Your code is already pushed to: https://github.com/rdetrdet/mezmo

### Step 2: Deploy to Railway

1. **Go to Railway**: https://railway.app
2. **Sign in with GitHub**
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose `rdetrdet/mezmo`**
6. Railway will automatically:
   - Detect it's a Node.js project
   - Install dependencies
   - Start the server

### Step 3: Add PostgreSQL Database

1. In your Railway project dashboard
2. Click **"+ New"** button
3. Select **"Database"** → **"PostgreSQL"**
4. Railway automatically:
   - Creates the database
   - Sets `DATABASE_URL` environment variable
   - Links it to your service

### Step 4: Initialize Database

1. Click on the **PostgreSQL service**
2. Go to **"Data"** tab
3. Click **"Query"** button
4. Copy the entire content from `database/schema.sql`
5. Paste and **"Execute"**

This creates:
- Users table
- Data table
- Indexes
- Triggers

### Step 5: Configure Environment Variables

1. Go to your **main service** (mezmo)
2. Click **"Variables"** tab
3. Add these variables:

```
JWT_SECRET=paste-random-32-char-string-here
NODE_ENV=production
```

To generate JWT_SECRET on Mac:
```bash
openssl rand -base64 32
```

### Step 6: Add Frontend URL (Optional)

If you have a frontend:
```
FRONTEND_URL=https://your-frontend-domain.com
```

### Step 7: Get Your API URL

1. Go to your service **"Settings"**
2. Click **"Generate Domain"**
3. Copy your Railway domain: `https://your-app.railway.app`

### Step 8: Test Your API

```bash
# Test health endpoint
curl https://your-app.railway.app/health

# Should return:
# {"status":"healthy","timestamp":"...","service":"mezmo-api"}
```

### Step 9: Test Registration

```bash
curl -X POST https://your-app.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123",
    "name": "Test User"
  }'
```

## 🎉 Done!

Your backend is now live on Railway!

## Next Steps

1. **Update your frontend** to use the Railway API URL
2. **Set up custom domain** (optional) in Railway settings
3. **Monitor logs** in Railway dashboard
4. **Set up GitHub auto-deploy** (already configured!)

## Auto-Deploy

Every time you push to `main` branch:
```bash
git add .
git commit -m "your changes"
git push
```

Railway automatically:
- Detects the push
- Rebuilds your app
- Deploys new version
- Zero downtime!

## Troubleshooting

**Database connection errors?**
- Make sure PostgreSQL service is running
- Check `DATABASE_URL` is set automatically
- Verify schema.sql was executed

**JWT errors?**
- Ensure `JWT_SECRET` is set in variables
- Use a strong random string (32+ characters)

**CORS errors?**
- Add your frontend URL to `FRONTEND_URL` variable
- Or use `*` for development (not recommended for production)

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: https://github.com/rdetrdet/mezmo/issues
