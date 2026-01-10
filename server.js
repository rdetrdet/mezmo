require('dotenv').config();
const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

app.use(express.json());
app.use(express.static('public'));

// API endpoint to search logs
app.get('/api/logs', async (req, res) => {
  try {
    const { search, severity, hostname, appName, limit = 100 } = req.query;
    
    let query = supabase
      .from('syslog_messages')
      .select('*')
      .order('received_at', { ascending: false })
      .limit(parseInt(limit));
    
    // Apply filters
    if (search) {
      query = query.or(`message.ilike.%${search}%,rawMessage.ilike.%${search}%`);
    }
    if (severity) {
      query = query.eq('severity', parseInt(severity));
    }
    if (hostname && hostname !== 'all') {
      query = query.eq('hostname', hostname);
    }
    if (appName && appName !== 'all') {
      query = query.eq('appName', appName);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get unique hostnames
app.get('/api/hostnames', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('syslog_messages')
      .select('hostname')
      .order('hostname');
    
    if (error) throw error;
    const unique = [...new Set(data.map(d => d.hostname))];
    res.json(unique);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get unique app names
app.get('/api/appnames', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('syslog_messages')
      .select('appName')
      .order('appName');
    
    if (error) throw error;
    const unique = [...new Set(data.map(d => d.appName))];
    res.json(unique);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stats endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('syslog_messages')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    res.json({ totalLogs: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🌐 Web interface running at http://localhost:${PORT}`);
});
