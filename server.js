const express = require("express");
const path = require("path");
const session = require("express-session");  // Import express-session
const router = require("./routers/router.js");  // Your custom routes
const authMiddleware = require('./middleware/authMiddleware');  // Import the middleware

const app = express();

app.use(session({
  secret: 'kirby',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 10800000 }  // 3 hours
}));

// Set EJS as the templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// To handle POST request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (CSS, JS, images)
app.use('/css', express.static(path.join(__dirname, 'views', 'css')));
app.use('/js', express.static(path.join(__dirname, 'views', 'js')));
app.use('/images', express.static(path.join(__dirname, 'views', 'images')));

// Use the router for other routes
app.use(router);

// Mount a protected route (example) using the middleware
app.use('/api/protected', authMiddleware, (req, res) => {
  res.json({ success: true, message: "Access granted to protected route!" });
});

// Mount the rest of your routes
const sectionRoutes = require('./routers/router'); // Adjust the path to your router
app.use('/', sectionRoutes); // Mount your main router

// Start the server
app.listen(4000, () => {
  console.log("Server started on http://localhost:4000!");
});
