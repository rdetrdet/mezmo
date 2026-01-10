# Mezmo Replacement - IceWarp Syslog Monitor

A complete replacement for Mezmo subscription that receives syslog data from IceWarp mail server, stores it in Supabase with automatic 30-day retention, and provides a live search interface.

## Features

✅ **Syslog Receiver** - Accepts RFC 5424 and legacy BSD syslog formats
✅ **Supabase Storage** - All logs stored in cloud database
✅ **30-Day Auto-Cleanup** - Automatic deletion of logs older than 30 days
✅ **Live Search** - Real-time filtering and search capabilities
✅ **Email Health Monitoring** - Track deliverability and server health
✅ **Auto-Refresh** - Dashboard updates every 5 seconds

## Architecture

```
IceWarp Mail Server  →  UDP Syslog (Port 514)  →  syslog-receiver.js
                                                          ↓
                                                    Supabase Database
                                                          ↓
                                                    Web Dashboard
                                                  (server.js + frontend)
```

## Setup Instructions

### 1. Database Setup

1. Go to your Supabase project: https://arrvrciylzzcwhbkxwyc.supabase.co
2. Open SQL Editor
3. Run the contents of `database-setup.sql`
4. This creates:
   - `syslog_messages` table
   - Indexes for fast searching
   - Auto-cleanup function for 30-day retention

### 2. Environment Configuration

Update your `.env` file with your Supabase credentials:

```env
SUPABASE_URL=https://arrvrciylzzcwhbkxwyc.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SYSLOG_PORT=514
PORT=3000
```

**Important:** Get your `SUPABASE_SERVICE_ROLE_KEY` from:
Supabase Dashboard → Settings → API → service_role (secret)

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Services

You need to run TWO processes:

**Terminal 1 - Syslog Receiver:**
```bash
sudo node syslog-receiver.js
```
(Requires sudo because port 514 is privileged)

**Terminal 2 - Web Dashboard:**
```bash
npm start
```

### 5. Configure IceWarp

1. Open IceWarp Administration Console
2. Navigate to: **System → Logging → General**
3. Enable "Send logs to external syslog server"
4. Enter:
   - **IP Address:** (your server's IP - shown when syslog-receiver starts)
   - **Port:** 514
   - **Protocol:** UDP

## Usage

### Access Dashboard

Open browser to: **http://localhost:3000**

### Search Features

- **Text Search:** Search across all log messages
- **Severity Filter:** Filter by log level (Emergency, Alert, Critical, Error, Warning, Notice, Info, Debug)
- **Hostname Filter:** Filter by specific mail server
- **Application Filter:** Filter by service (SMTP, IMAP, etc.)
- **Auto-refresh:** Dashboard updates every 5 seconds

### Monitoring Email Health

The dashboard helps you monitor:
- **Email Deliverability:** Track successful/failed deliveries
- **Server Errors:** Catch critical issues immediately
- **Authentication:** Monitor login attempts
- **Performance:** Watch for slow responses

## Data Retention

Logs are automatically deleted after 30 days using a database trigger. No manual cleanup needed!

## Syslog Format Reference

The system handles both RFC 5424 (modern) and RFC 3164 (legacy) formats:

**RFC 5424 Format:**
```
<34>1 2025-01-10T12:00:00.000Z mail.example.com smtp 1234 MSGID - Message text
```

**Legacy BSD Format:**
```
<34>Jan 10 12:00:00 mail.example.com smtp: Message text
```

### Severity Levels

| Level | Name      | Description           |
|-------|-----------|-----------------------|
| 0     | Emergency | System unusable       |
| 1     | Alert     | Immediate action      |
| 2     | Critical  | Critical conditions   |
| 3     | Error     | Error conditions      |
| 4     | Warning   | Warning conditions    |
| 5     | Notice    | Normal but significant|
| 6     | Info      | Informational         |
| 7     | Debug     | Debug messages        |

## Files Structure

```
mezmo/
├── .env                    # Environment configuration
├── package.json            # Node.js dependencies
├── syslog-receiver.js      # UDP syslog server
├── server.js               # Web dashboard API
├── database-setup.sql      # Supabase table setup
├── public/
│   └── index.html         # Web interface
└── README.md              # This file
```

## Production Deployment

### Run as System Services

**Create systemd service for syslog receiver:**
```bash
sudo nano /etc/systemd/system/mezmo-syslog.service
```

```ini
[Unit]
Description=Mezmo Syslog Receiver
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/Users/pio/Documents/ETWebsite/usersonmail/mezmo
ExecStart=/usr/bin/node syslog-receiver.js
Restart=always

[Install]
WantedBy=multi-user.target
```

**Create systemd service for web dashboard:**
```bash
sudo nano /etc/systemd/system/mezmo-web.service
```

```ini
[Unit]
Description=Mezmo Web Dashboard
After=network.target

[Service]
Type=simple
User=pio
WorkingDirectory=/Users/pio/Documents/ETWebsite/usersonmail/mezmo
ExecStart=/usr/bin/node server.js
Restart=always

[Install]
WantedBy=multi-user.target
```

**Enable and start services:**
```bash
sudo systemctl enable mezmo-syslog
sudo systemctl enable mezmo-web
sudo systemctl start mezmo-syslog
sudo systemctl start mezmo-web
```

## Troubleshooting

### Port 514 Permission Denied
```bash
# Option 1: Run with sudo
sudo node syslog-receiver.js

# Option 2: Use port > 1024 (e.g., 5140)
# Update .env: SYSLOG_PORT=5140
# Configure IceWarp to use port 5140
```

### No Logs Appearing
1. Check syslog receiver is running: `ps aux | grep syslog-receiver`
2. Verify IceWarp configuration
3. Check firewall allows UDP port 514
4. Test with: `logger -n localhost -P 514 "Test message"`

### Database Connection Issues
1. Verify `.env` credentials
2. Check Supabase project is active
3. Run database setup SQL if not done

## Future Enhancements

Ideas for additional features:
- Email alerts for critical errors
- Historical analytics and graphs
- Export logs to CSV
- Advanced regex search
- Log pattern detection
- Integration with monitoring tools

## License

MIT

## Support

For issues or questions, check:
- IceWarp documentation: https://docs.icewarp.com
- Supabase documentation: https://supabase.com/docs
