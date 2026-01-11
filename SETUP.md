# Quick Setup Guide - Mezmo Replacement

## What You Have Now

A complete IceWarp log monitoring system that replaces your Mezmo subscription:

✅ **Syslog Receiver** - Captures all IceWarp logs via UDP port 514
✅ **Cloud Storage** - All logs stored in Supabase database
✅ **30-Day Retention** - Automatic cleanup of old logs
✅ **Live Search Dashboard** - Real-time filtering and monitoring
✅ **GitHub Repository** - https://github.com/rdetrdet/mezmo

## Next Steps (Do This Now!)

### 1️⃣ Set Up Database (5 minutes)

1. Open Supabase: https://arrvrciylzzcwhbkxwyc.supabase.co
2. Click **SQL Editor** in left sidebar
3. Click **New Query**
4. Copy ALL contents from `database-setup.sql`
5. Paste and click **Run**
6. You should see: "Success. No rows returned"

### 2️⃣ Get Service Role Key (2 minutes)

1. In Supabase, go to **Settings** → **API**
2. Find **service_role** key (it's marked as secret)
3. Click **Reveal** and copy it
4. Update your `.env` file:
