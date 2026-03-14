require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express   = require('express');
const cors      = require('cors');
const path      = require('path');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');

const reservationsRoute = require('./routes/reservations');
const slotsRoute        = require('./routes/slots');
const adminRoute        = require('./routes/admin');

const app = express();

// ── Security headers ──
app.use(helmet({
  contentSecurityPolicy: false, // disabled so inline scripts in index.html still work
}));

// ── CORS — only allow requests from the same site ──
app.use(cors({
  origin: [`http://localhost:${process.env.PORT || 8080}`],
  methods: ['GET', 'POST', 'DELETE'],
}));

// ── Body size limit — 10kb max to prevent large payload attacks ──
app.use(express.json({ limit: '10kb' }));

// ── Rate limiting ──
// General API: 100 requests per 15 minutes per IP
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
}));

// Admin login: 10 attempts per 15 minutes per IP (brute force protection)
app.use('/api/admin/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
}));

// Reservation submissions: 5 per hour per IP (spam protection)
app.use('/api/reservations', rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Too many reservation requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
}));

// ── Block direct access to sensitive files ──
app.use((req, res, next) => {
  const blocked = ['/cafe.json', '/.env', '/server'];
  if (blocked.some(p => req.path.startsWith(p))) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
});

// ── Static files ──
app.use(express.static(path.join(__dirname, '..')));

// ── API routes ──
app.use('/api/reservations', reservationsRoute);
app.use('/api/slots',        slotsRoute);
app.use('/api/admin',        adminRoute);

// ── 404 for unknown API routes ──
app.use('/api/*', (req, res) => res.status(404).json({ error: 'Not found' }));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Café Elite server running on http://localhost:${PORT}`));
