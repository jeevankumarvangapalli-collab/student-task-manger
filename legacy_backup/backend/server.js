/**
 * ScholarFlow: Backend Express Server
 * Central server providing REST API, Google Gemini DevBot integration, and Supabase synchronization.
 */

require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`[${req.method}] ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// API Routes
app.use('/api', apiRoutes);

// Serve static frontend files if frontend directory exists
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Fallback route for SPA navigation
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  const indexPath = path.join(frontendPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head><title>ScholarFlow Backend</title></head>
        <body style="font-family:sans-serif; text-align:center; padding:3rem; background:#0f172a; color:#f8fafc;">
          <h1>🚀 ScholarFlow Backend API Server is Running!</h1>
          <p>Port: <code>${PORT}</code> | Status: <code>Healthy</code></p>
          <p>Frontend directory can be served from <code>../frontend/index.html</code></p>
          <p><a href="/api/health" style="color:#818cf8;">Check API Health Status</a></p>
        </body>
        </html>
      `);
    }
  });
});

// Start Server
app.listen(PORT, () => {
  const geminiStatus = process.env.GEMINI_API_KEY ? '✅ Configured' : '⚠️ Missing (Demo Mode Active)';
  const supabaseStatus = process.env.SUPABASE_URL ? '✅ Configured' : '⚠️ Not configured (Local Storage)';

  console.log('='.repeat(65));
  console.log(` ScholarFlow Academic Cockpit - Backend Server`);
  console.log('='.repeat(65));
  console.log(` 🌐 Server URL:        http://localhost:${PORT}`);
  console.log(` 🩺 Health Check:      http://localhost:${PORT}/api/health`);
  console.log(` 🤖 DevBot LLM API:    http://localhost:${PORT}/api/chat`);
  console.log(` 🔑 Gemini LLM Key:    ${geminiStatus}`);
  console.log(` ☁️  Supabase Database: ${supabaseStatus}`);
  console.log('='.repeat(65));
});
