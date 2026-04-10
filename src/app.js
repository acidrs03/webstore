'use strict';

require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');

const { sessionConfig } = require('./config/session');
const { csrfProtection } = require('./middleware/csrf');
const { maintenanceMode } = require('./middleware/maintenance');
const logger = require('./utils/logger');
const settingService = require('./services/settingService');

const app = express();

// ── Trust the Nginx reverse proxy (required for correct IP, secure cookies) ───
// Tells Express to read X-Forwarded-For / X-Forwarded-Proto headers from Nginx.
app.set('trust proxy', 1);

// ── App-level health check ────────────────────────────────────────────────────
// Used by Docker HEALTHCHECK and docker-compose service_healthy condition.
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// ── Stripe webhook MUST receive raw body — mount before any body parsers ──────
// The router inside handles POST /stripe, so the full path becomes /webhooks/stripe
const webhookController = require('./controllers/webhookController');
app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), webhookController.stripeWebhook);

// ── Security headers via Helmet ───────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          'https://cdn.jsdelivr.net',  // Bootstrap JS
          'https://js.stripe.com',      // Stripe.js
          "'unsafe-inline'",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://cdn.jsdelivr.net',       // Bootstrap CSS + Bootstrap Icons
          'https://fonts.googleapis.com',   // Google Fonts CSS
        ],
        fontSrc: [
          "'self'",
          'data:',
          'https://fonts.gstatic.com',      // Google Fonts files
          'https://cdn.jsdelivr.net',       // Bootstrap Icons font files
        ],
        imgSrc: ["'self'", 'data:', 'https:'],
        frameSrc: ["'self'", 'https://js.stripe.com', 'https://hooks.stripe.com'],
        connectSrc: ["'self'", 'https://api.stripe.com'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// ── HTTP request logging ──────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(
    morgan('combined', {
      stream: { write: (msg) => logger.http(msg.trim()) },
    })
  );
}

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Static files ──────────────────────────────────────────────────────────────
// Public assets live in src/public/
app.use(express.static(path.join(__dirname, 'public')));
// User-uploaded files live in uploads/ at the project root
app.use(
  '/uploads',
  express.static(path.join(__dirname, '..', 'uploads'), {
    maxAge: '30d',
  })
);

// ── View engine ───────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ── Session + flash ───────────────────────────────────────────────────────────
app.use(session(sessionConfig));
app.use(flash());

// ── CSRF token generation (global) ────────────────────────────────────────────
// Generates req.session.csrfToken and exposes res.locals.csrfToken to all views.
// Verification (verifyCsrf) is applied individually on POST routes.
app.use(csrfProtection);

// ── Global template locals ────────────────────────────────────────────────────
app.use(async (req, res, next) => {
  // Flash messages
  res.locals.success = req.flash('success');
  res.locals.error   = req.flash('error');
  res.locals.info    = req.flash('info');

  // Admin user (set by auth middleware on protected routes)
  res.locals.adminUser = req.session.adminUser || null;

  // Current path for active nav highlighting
  res.locals.currentPath = req.path;

  // Cart item count for storefront header
  const cart = req.session.cart || { items: [] };
  res.locals.cartCount = cart.items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  // Site name from env or fallback
  res.locals.siteName = process.env.SITE_NAME || 'My Store';

  // Base URL for canonical links, OG tags, and sitemap (no trailing slash)
  res.locals.baseUrl = (process.env.BASE_URL || '').replace(/\/$/, '');

  // Stripe publishable key for frontend
  res.locals.stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY || '';

  // Announcement bar and theme — single DB query covers both
  try {
    const allSettings = await settingService.getSettingsMap();
    const themeKeys = [
      'themePrimary','themePrimaryLight','themePrimaryDark',
      'themeAccent','themeAccentLight',
      'themeBg','themeBgWarm',
      'themeText','themeTextMuted',
      'themeBorder',
      'themeHeroBgFrom','themeHeroBgMid','themeHeroBgTo',
      'themeFooterBg',
    ];
    const themeVars = {};
    for (const k of themeKeys) {
      if (allSettings[k]) themeVars[k] = allSettings[k];
    }
    res.locals.themeVars = themeVars;
    res.locals.announcementText   = allSettings.announcementText || '';
    res.locals.announcementActive = allSettings.announcementActive === 'true';
  } catch (_) {
    res.locals.announcementText   = '';
    res.locals.announcementActive = false;
    res.locals.themeVars = {};
  }

  next();
});

// ── Maintenance mode ──────────────────────────────────────────────────────────
app.use(maintenanceMode);

// ── Routes ────────────────────────────────────────────────────────────────────
// All routes are organized under src/routes/index.js
// - /webhooks → webhookController (uses raw body, already mounted above)
// - /admin     → admin area
// - /          → public storefront
app.use('/', require('./routes/index'));

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res, _next) => {
  res.status(404).render('errors/404', {
    title: 'Page Not Found',
    url: req.originalUrl,
  });
});

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  const status = err.status || err.statusCode || 500;

  logger.error(`${status} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  if (req.app.get('env') === 'development') {
    logger.error(err.stack);
  }

  // Return JSON for API-like requests
  if (req.accepts('json') && !req.accepts('html')) {
    return res.status(status).json({ error: err.message || 'Internal Server Error' });
  }

  res.status(status).render('errors/500', {
    title: 'Something went wrong',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred.',
    stack: process.env.NODE_ENV === 'development' ? err.stack : null,
  });
});

module.exports = app;
