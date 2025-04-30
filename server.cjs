require('dotenv').config();
const express = require('express');
const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

const app = express();

// Configure CORS to allow requests from your StackBlitz frontend origin
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://hccksbcfatkncqilccfq.stackblitz.io',
      'https://hccksbcfatkncqilccfq.stackblitz.io:5173',
      'http://localhost:5173',
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

// Validate environment variables
const requiredEnvVars = [
  'PORT',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const PORT = process.env.PORT;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.NODE_ENV === 'production'
  ? 'https://job.preciseleakdetection.com/auth/callback'
  : 'http://localhost:3000/auth/callback';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const authenticateRequest = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header');
  }
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error) {
    throw new Error('Invalid token');
  }
  return user.id;
};

app.get('/api/auth/google', async (req, res) => {
  try {
    const userId = await authenticateRequest(req);
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      GOOGLE_REDIRECT_URI
    )}&response_type=code&scope=https://www.googleapis.com/auth/calendar.events&access_type=offline&prompt=consent&state=${encodeURIComponent(userId)}`;
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(401).json({ error: error.message });
  }
});

app.get('/auth/callback', async (req, res) => {
  const { code, state } = req.query;
  if (!code || !state) {
    return res.status(400).send('Missing authorization code or state');
  }

  try {
    const userId = decodeURIComponent(state);
    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);

    const { data, error } = await supabase
  .from('user_tokens')
  .upsert({
    user_id: userId,
    provider: 'google',
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
  })
  .select();

if (error) {
  console.error('❌ Error saving tokens:', error.message, error.details);
  return res.status(500).send('Failed to save tokens');
} else {
  console.log('✅ Token row inserted:', data);
}

    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error handling OAuth callback:', error);
    res.status(500).send('Authentication failed');
  }
});

app.post('/api/sync-jobs', async (req, res) => {
  try {
    const userId = await authenticateRequest(req);
    const { jobs } = req.body;

    const { data: tokenData, error: tokenError } = await supabase
      .from('user_tokens')
      .select('access_token, refresh_token')
      .eq('user_id', userId)
      .eq('provider', 'google');

    if (tokenError) {
      console.error('Error fetching tokens:', tokenError);
      return res.status(500).json({ error: 'Failed to fetch Google credentials' });
    }

    if (!tokenData || tokenData.length === 0) {
      return res.status(401).json({ error: 'No Google credentials found. Please connect your Google Calendar.' });
    }

    if (tokenData.length > 1) {
      console.error('Multiple token entries found for user:', userId);
      return res.status(500).json({ error: 'Multiple Google credentials found. Please contact support.' });
    }

    const tokens = tokenData[0];

    const auth = new google.auth.OAuth2({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      redirectUri: GOOGLE_REDIRECT_URI,
    });

    auth.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    });

    const calendar = google.calendar({ version: 'v3', auth });

    for (const job of jobs) {
      const event = {
        summary: `Job: ${job.job_code} - ${job.client ? job.client.name : 'N/A'}`,
        location: `${job.street_address}, ${job.city}, ${job.state} ${job.zip}`,
        description: `Status: ${job.status}\nAddress: ${job.street_address}, ${job.city}, ${job.state} ${job.zip}`,
        start: {
          dateTime: new Date(job.scheduled_at).toISOString(),
          timeZone: 'America/Denver',
        },
        end: {
          dateTime: new Date(new Date(job.scheduled_at).getTime() + 60 * 60 * 1000).toISOString(),
          timeZone: 'America/Denver',
        },
        extendedProperties: {
          private: {
            jobId: job.id,
          },
        },
      };

      await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      });
    }

    res.json({ message: 'Jobs synced successfully' });
  } catch (error) {
    console.error('Error syncing jobs:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/update-job-event', async (req, res) => {
  try {
    const userId = await authenticateRequest(req);
    const { jobId, status, address } = req.body;

    const { data: tokenData, error: tokenError } = await supabase
      .from('user_tokens')
      .select('access_token, refresh_token')
      .eq('user_id', userId)
      .eq('provider', 'google');

    if (tokenError) {
      console.error('Error fetching tokens:', tokenError);
      return res.status(500).json({ error: 'Failed to fetch Google credentials' });
    }

    if (!tokenData || tokenData.length === 0) {
      return res.status(401).json({ error: 'No Google credentials found. Please connect your Google Calendar.' });
    }

    if (tokenData.length > 1) {
      console.error('Multiple token entries found for user:', userId);
      return res.status(500).json({ error: 'Multiple Google credentials found. Please contact support.' });
    }

    const tokens = tokenData[0];

    const auth = new google.auth.OAuth2({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      redirectUri: GOOGLE_REDIRECT_URI,
    });

    auth.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    });

    const calendar = google.calendar({ version: 'v3', auth });
    const { data: events } = await calendar.events.list({
      calendarId: 'primary',
      privateExtendedProperty: `jobId=${jobId}`,
    });

    if (events.items && events.items.length > 0) {
      const eventId = events.items[0].id;
      await calendar.events.patch({
        calendarId: 'primary',
        eventId,
        resource: {
          description: `Status: ${status}\nAddress: ${address}`,
        },
      });
      res.json({ message: 'Event updated successfully' });
    } else {
      res.status(404).json({ error: 'Event not found' });
    }
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add a root route for debugging
app.get('/', (req, res) => {
  res.send('Welcome to the Job Scheduling API! Use /api/auth/google to authenticate with Google Calendar.');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});