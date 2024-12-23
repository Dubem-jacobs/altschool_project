require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const app = express();

const expressLayout = require('express-ejs-layouts'); // EJS templating engine layouts

// Middleware for overriding HTTP methods (e.g., PUT/DELETE via forms)
const methodOverride = require('method-override');

// Middleware to parse cookies
const cookieParser = require('cookie-parser');

// Session management and MongoDB session store
const session = require('express-session');
const mongoStore = require('connect-mongo');

// Middleware for flash messages
const flash = require('connect-flash');

// Database connection function
const connectDb = require('./server/config/db');

const PORT = process.env.PORT || 5000;

// Establish connection to MongoDB
connectDb();

// Middleware to parse incoming request data
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data
app.use(express.json()); // Parse JSON data

// Parse cookies for session and authentication handling
app.use(cookieParser());

// Override HTTP methods for form submissions
app.use(methodOverride('_method'));

// Session configuration with MongoDB store
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Secret key for signing session IDs
    resave: false, // Avoid resaving session if it hasn't changed
    saveUninitialized: true, // Save uninitialized sessions
    store: mongoStore.create({
      mongoUrl: process.env.MONGODB_URI, // MongoDB connection string for storing sessions
    }),
    cookie: { maxAge: 3600000 }, // Session cookie expiration time (1 hour)
  })
);

// Middleware for flash messages (stored in session)
app.use(flash());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Configure EJS as the templating engine
app.use(expressLayout); // Enable EJS layouts
app.set('layout', './layouts/main'); // Set default layout
app.set('view engine', 'ejs'); // Set EJS as the view engine

// Define routes
app.use('/', require('./server/routes/main')); // Public routes
app.use('/', require('./server/routes/admin')); // Admin routes

// Export the app for testing purposes
module.exports = app;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
