'use strict';

const MongoStore = require('connect-mongo');

const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'change-this-secret-in-production',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/my_store',
    ttl: 14 * 24 * 60 * 60,
    touchAfter: 24 * 3600,
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 14 * 24 * 60 * 60 * 1000,
  },
  name: 'store.sid',
};

module.exports = { sessionConfig };
