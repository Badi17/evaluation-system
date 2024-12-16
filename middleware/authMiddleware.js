module.exports = (req, res, next) => {
  console.log('Session in authMiddleware:', req.session);  // Log session data
  
  // Check if either studentId or instructorId exists in session
  if (req.session?.studentId || req.session?.instructorId) {
    next();  // Proceed if studentId or instructorId exists in session
  } else {
    res.status(401).json({ success: false, message: 'Not authenticated, please log in' });
  }
};


  const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated() && req.user) {
      return next();
    } else {
      res.redirect('/login'); // Redirect to login if not authenticated
    }
  };
  