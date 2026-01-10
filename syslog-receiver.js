require('dotenv').config();
const dgram = require('dgram');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

// Syslog server configuration
const SYSLOG_PORT = process.env.SYSLOG_PORT || 514;
const server = dgram.createSocket('udp4');

// Parse RFC 5424 syslog message
function parseSyslogMessage(buffer) {
  const message = buffer.toString('utf8');
  
  // RFC 5424 format: <PRI>VERSION TIMESTAMP HOSTNAME APP-NAME PROCID MSGID STRUCTURED-DATA MSG
  // Example: <34>1 2003-10-11T22:14:15.003Z mymachine.example.com su - ID47 - BOM'su root' failed
  
  const regex = /^<(\d+)>(\d+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+|\-)\s+(.*)$/;
  const match = message.match(regex);
  
  if (match) {
    const priority = parseInt(match[1]);
    const facility = Math.floor(priority / 8);
    const severity = priority % 8;
    
    return {
      priority,
      facility,
      severity,
      version: match[2],
      timestamp: match[3],
      hostname: match[4],
      appName: match[5],
      procId: match[6],
      msgId: match[7],
      structuredData: match[8],
      message: match[9],
      rawMessage: message
    };
  }
  
  // Fallback for legacy BSD syslog (RFC 3164)
  // Format: <PRI>MMM DD HH:MM:SS HOSTNAME TAG: MESSAGE
  const legacyRegex = /^<(\d+)>(\w+\s+\d+\s+\d+:\d+:\d+)\s+(\S+)\s+([^:]+):\s*(.*)$/;
  const legacyMatch = message.match(legacyRegex);
  
  if (legacyMatch) {
    const priority = parseInt(legacyMatch[1]);
    const facility = Math.floor(priority / 8);
    const severity = priority % 8;
    
    return {
      priority,
      facility,
      severity,
      version: '0', // Legacy format
      timestamp: legacyMatch[2],
      hostname: legacyMatch[3],
      appName: legacyMatch[4],
      procId: '-',
      msgId: '-',
      structuredData: '-',
      message: legacyMatch[5],
      rawMessage: message
    };
  }
  
  // If no match, return raw message
  return {
    priority: 0,
    facility: 0,
    severity: 0,
    version: 'unknown',
    timestamp: new Date().toISOString(),
    hostname: 'unknown',
    appName: 'unknown',
    procId: '-',
    msgId: '-',
    structuredData: '-',
    message: message,
    rawMessage: message
  };
}

// Store log in Supabase
async function storeLog(logData) {
  try {
    const { data, error } = await supabase
      .from('syslog_messages')
      .insert([logData]);
    
    if (error) throw error;
    console.log('✓ Log stored successfully');
    return data;
  } catch (error) {
    console.error('✗ Error storing log:', error.message);
  }
}

// Handle incoming syslog messages
server.on('message', async (msg, rinfo) => {
  console.log(`\n📨 Received from ${rinfo.address}:${rinfo.port}`);
  
  const parsed = parseSyslogMessage(msg);
  
  console.log('Parsed:', {
    hostname: parsed.hostname,
    appName: parsed.appName,
    severity: parsed.severity,
    message: parsed.message.substring(0, 100)
  });
  
  // Store in database with source IP
  await storeLog({
    ...parsed,
    source_ip: rinfo.address,
    received_at: new Date().toISOString()
  });
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
  server.close();
});

server.on('listening', () => {
  const address = server.address();
  console.log(`\n🚀 Syslog receiver started!`);
  console.log(`📡 Listening on UDP port ${address.port}`);
  console.log(`\nConfigure IceWarp to send logs to:`);
  console.log(`   IP: ${getLocalIP()}`);
  console.log(`   Port: ${address.port}`);
  console.log(`   Protocol: UDP\n`);
});

// Get local IP address
function getLocalIP() {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Start server
server.bind(SYSLOG_PORT);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down syslog receiver...');
  server.close(() => {
    console.log('✓ Server closed');
    process.exit(0);
  });
});
