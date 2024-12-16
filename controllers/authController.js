const bcrypt = require('bcrypt');
const db = require('../models'); // Import the models

const login = async (req, res) => {
  const { identifier, password } = req.body; // Use a common identifier field

  console.log("Received identifier:", identifier); // Debugging log
  console.log("Received password:", password); // Debugging log

  try {
    // First, try to find a user by username (Admin)
    let user = await db.User.findOne({ where: { username: identifier } });
    console.log("Found User by username:", user);

    // If user not found, check if it's a student
    if (!user) {
      user = await db.Student.findOne({ where: { studentId: identifier } });
      console.log("Found User by studentId:", user);
    }

    // If still not found, check if it's an instructor
    if (!user) {
      user = await db.Instructor.findOne({ where: { instructorId: identifier } });
      console.log("Found User by instructorId:", user);
    }

    // Log the found user
    if (!user) {
      console.log("User not found, invalid credentials");
      return res.status(400).send('Invalid username, student ID, or password');
    }

    // Verify the password
    const validPassword = bcrypt.compareSync(password, user.password);
    console.log("Password valid:", validPassword);

    if (!validPassword) {
      console.log("Invalid password");
      return res.status(400).send('Invalid username, student ID, or password');
    }

    // Redirect based on the type of user
    if (user instanceof db.Student) {
      req.session.studentId = user.studentId;
      console.log("Session set with studentId:", req.session.studentId);
      return res.redirect(`/student`);
    } else if (user instanceof db.Instructor) { // Instructor login
      req.session.instructorId = user.instructorId;
      console.log("Session set with instructorId:", req.session.instructorId);
      return res.redirect(`instructor`);
    } else if (user instanceof db.User) { // Admin login
      return res.redirect('/dashboard');
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send('Internal server error');
  }
};

module.exports = {
  login
};
