//router.js
const express = require("express");
const path = require("path");
const { login } = require("../controllers/authController");
const { saveSection, getSection } = require("../controllers/studentController");
const { User } = require('../models');
const db = require("../models");
const { QueryTypes } = require('sequelize');
const bcrypt = require("bcrypt");
const { Student,Instructor } = require("../models");
const { Subject, Section, Questionnaire, Evaluation, EvaluationResponse, Question} = require("../models");
const authMiddleware = require('../middleware/authMiddleware');
const { Op } = require("sequelize");
const  isLoggedIn = require('../middleware/authMiddleware');

const routes = express.Router();

// Serve index.ejs at the /login route
routes.get("/login", (req, res) => {
  res.render("index"); // No need for file extension if you're using EJS
});

// Route to fetch the specific evaluation
routes.get("/statistics/:evaluationId", async (req, res) => {
  try {
      const { evaluationId } = req.params;  // Get the evaluationId from the URL parameter

      // Fetch the specific evaluation based on evaluationId
      const evaluation = await Evaluation.findByPk(evaluationId);

      if (!evaluation) {
          return res.status(404).send("Evaluation not found.");
      }

      // Fetch responses related to this specific evaluationId
      const responses = await EvaluationResponse.findAll({
          where: { evaluationId: evaluation.id }
      });

      // Fetch questions based on the response question IDs
      const questions = await Questionnaire.findAll({
          where: {
              id: responses.map(response => response.questionId)
          }
      });

      // Calculate response counts (e.g., 1-5 scale responses)
      const responseCounts = [0, 0, 0, 0, 0];  // Counts for 1-5 responses
      responses.forEach(response => {
          responseCounts[response.response - 1]++;
      });

      // Fetch the student details using studentId from evaluation
      const student = await Student.findOne({
          where: { studentId: evaluation.studentId }  // Query using studentId
      });

      // Log the student details for debugging
      console.log("Student found: ", student);

      // Manually fetch instructor details based on the instructorId
      const instructor = await Instructor.findByPk(evaluation.instructorId);

      // Log the instructor details for debugging
      console.log("Instructor found: ", instructor);

      // Prepare dynamic data
      const studentName = student && student.fname ? student.fname : 'Unknown';  // Ensure student name is correctly assigned
      const instructorName = instructor ? instructor.funame : 'Unknown';  // Ensure instructor name is correctly assigned

      // Calculate remarks (average rating)
      const remarks = responses.reduce((sum, response) => sum + response.response, 0) / responses.length;

      // Store evaluation data in session (or pass it directly to the next route)
      req.session.evaluationData = {
          evaluation,
          responses,
          responsesWithQuestions: responses.map(response => {
              const question = questions.find(q => q.id === response.questionId);
              return {
                  question: question ? question.question : 'Unknown Question',
                  response: response.response
              };
          }),
          responseCounts,
          remarks,
          studentName,
          instructorName,
          date: evaluation.evaluationdate.toLocaleDateString(),
          feedback: evaluation.feedback
      };

      // Redirect to the /statistics route to render the view
      res.redirect("/statistics");

  } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred while fetching the evaluation data.");
  }
});

// Route to render the statistics page with fetched data
routes.get("/statistics", (req, res) => {
  try {
      const evaluationData = req.session.evaluationData;  // Get the evaluation data from the session

      if (!evaluationData) {
          return res.status(404).send("No evaluation data found.");
      }

      // Render the statistics page with the data
      res.render("statistics", {
          evaluation: evaluationData.evaluation,
          responsesWithQuestions: evaluationData.responsesWithQuestions,
          responseCounts: evaluationData.responseCounts,
          remarks: evaluationData.remarks,
          feedback: evaluationData.feedback,
          studentName: evaluationData.studentName,
          instructorName: evaluationData.instructorName,
          date: evaluationData.date
      });

  } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred while rendering the statistics page.");
  }
});
// Route to render the statistics page with fetched data
routes.get("/statistics", (req, res) => {
  try {
      const evaluationData = req.session.evaluationData;  // Get the evaluation data from the session

      if (!evaluationData) {
          return res.status(404).send("No evaluation data found.");
      }

      // Render the statistics page with the data
      res.render("statistics", {
          evaluation: evaluationData.evaluation,
          responsesWithQuestions: evaluationData.responsesWithQuestions,
          responseCounts: evaluationData.responseCounts,
          remarks: evaluationData.remarks,
          feedback: evaluationData.feedback,
          studentName: evaluationData.studentName,
          instructorName: evaluationData.instructorName,
          date: evaluationData.date
      });

  } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred while rendering the statistics page.");
  }
});

routes.get('/dashboard', async (req, res) => {
  try {
    // Fetch total counts for students and instructors
    const studentCount = await Student.count();
    const instructorCount = await Instructor.count();

    // Fetch counts of students per year level
    const firstYearCount = await Student.count({ where: { yearLevel: 1 } });
    const secondYearCount = await Student.count({ where: { yearLevel: 2 } });
    const thirdYearCount = await Student.count({ where: { yearLevel: 3 } });
    const fourthYearCount = await Student.count({ where: { yearLevel: 4 } });

    // Render the dashboard view with all the counts
    res.render('dashboard', {
      studentCount,
      instructorCount,
      firstYearCount,
      secondYearCount,
      thirdYearCount,
      fourthYearCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching counts');
  }
});


routes.get("/questionnaire", async (req, res) => {
  try {
    const questions = await Questionnaire.findAll();
    res.render("questionnaire", { questions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).send("Failed to fetch questions");
  }
});

routes.post('/questionnaire', async (req, res) => {
  const { criteria, question } = req.body;

  if (!criteria || !question) {
    return res.status(400).json({ success: false, message: 'Invalid data' });
  }

  try {
    const result = await Questionnaire.create({
      criteria,
      question,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    res.json({ success: true, questionId: result.id });
  } catch (error) {
    console.error('Error saving question:', error);
    res.status(500).json({ success: false, message: 'Failed to save question' });
  }
});

// Edit an existing question
routes.put("/questionnaire/:id", async (req, res) => {
  const { criteria, question } = req.body;
  try {
    await Questionnaire.update(
      { criteria, question },
      { where: { id: req.params.id } }
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating question:', error);
    res.json({ success: false, message: "Failed to update question" });
  }
});

// Delete a question
routes.delete("/questionnaire/:id", async (req, res) => {
  try {
    await Questionnaire.destroy({
      where: { id: req.params.id }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.json({ success: false, message: "Failed to delete question" });
  }
});

// Serve evaluate.ejs at the /evaluate route
routes.get("/evaluate", (req, res) => {
  res.render("evaluate");
});

routes.get("/questionnaire/questions", async (req, res) => {
  try {
    const questions = await Questionnaire.findAll({ raw: true });
    
    // Group questions by criteria
    const groupedQuestions = questions.reduce((acc, question) => {
      const criteriaKey = `Criteria ${question.criteria}`;
      if (!acc[criteriaKey]) acc[criteriaKey] = [];
      acc[criteriaKey].push({
        id: question.id,
        text: question.question
      });
      return acc;
    }, {});

    res.json({ success: true, data: groupedQuestions });
  } catch (error) {
    console.error("Error fetching questionnaire questions:", error);
    res.status(500).json({ success: false, message: "Failed to fetch questions" });
  }
});

// Route to fetch available instructors
routes.get("/api/instructors", authMiddleware, async (req, res) => {
  try {
    const studentId = req.session.studentId;

    if (!studentId) {
      return res.status(401).json({ success: false, message: "Student not authenticated" });
    }

    // Fetch student and their subjects
    const student = await Student.findOne({
      where: { studentId },
      attributes: ["subjects"],
    });

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // Extract subject codes for the student
    const studentSubjects = student.subjects
      .split("\n") // Split by newline
      .map((s) => s.split(":")[0].trim().toUpperCase()); // Extract code and normalize case

    console.log("Student Subjects:", studentSubjects);

    // Fetch all instructors
    const instructors = await Instructor.findAll();

    // Filter instructors whose subjects match any of the student's subjects
    const filteredInstructors = instructors
      .map((instructor) => {
        const instructorSubjects = instructor.subjects
          .split("\n") // Split by newline
          .map((s) => s.split(":")[0].trim().toUpperCase()); // Extract code and normalize case

        console.log(`Instructor ${instructor.funame} Subjects:`, instructorSubjects);

        const matchingSubjects = instructorSubjects.filter((subject) =>
          studentSubjects.includes(subject)
        );

        console.log(`Matching Subjects for ${instructor.funame}:`, matchingSubjects);

        if (matchingSubjects.length > 0) {
          return {
            id: instructor.id,
            funame: instructor.funame,
            subjects: matchingSubjects,
          };
        }

        return null;
      })
      .filter((instructor) => instructor !== null); // Remove null entries

    if (filteredInstructors.length > 0) {
      console.log("Filtered Instructors:", filteredInstructors);
      res.status(200).json({ success: true, instructors: filteredInstructors });
    } else {
      console.log("No Matching Instructors Found.");
      res.status(404).json({ success: false, message: "No matching instructors found" });
    }
  } catch (error) {
    console.error("Error fetching instructors:", error);
    res.status(500).json({ success: false, message: "Failed to fetch instructors" });
  }
});

// Route to fetch details for a specific instructor
routes.get("/instructor/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.session.studentId;

    if (!studentId) {
      return res.status(401).json({ success: false, message: "Student not authenticated" });
    }

    const student = await Student.findOne({ 
      where: { studentId },
      attributes: ["subjects"]
    });

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const studentSubjects = student.subjects
      .split("\n")
      .map((s) => s.split(":")[0].trim().toUpperCase());

    const instructor = await Instructor.findByPk(id);

    if (!instructor) {
      return res.status(404).json({ success: false, message: "Instructor not found" });
    }

    const instructorSubjects = instructor.subjects
      .split("\n")
      .map((s) => s.split(":")[0].trim().toUpperCase());

    const matchingSubjects = instructorSubjects.filter((subject) =>
      studentSubjects.includes(subject)
    );

    res.json({
      success: true,
      instructor: {
        funame: instructor.funame,
        subjects: matchingSubjects, // Return only matching subjects
      },
    });
  } catch (error) {
    console.error("Error fetching instructor details:", error);
    res.status(500).json({ success: false, message: "Failed to fetch instructor details" });
  }
});

routes.get('/api/getStudentId', authMiddleware, async (req, res) => {
  console.log('Session state in getStudentId:', req.session);  // Log session state
  const studentId = req.session.studentId;

  if (studentId) {
    return res.json({ success: true, studentId });
  } else {
    return res.status(401).json({ success: false, message: 'Student not authenticated' });
  }
});

routes.post('/api/evaluate', authMiddleware, async (req, res) => {
  try {
    const { ratings, feedback, instructorId, subjects } = req.body;
    const studentId = req.session.studentId;

    if (!ratings || !feedback || !instructorId || !studentId || !subjects) {
      return res.status(400).json({
        success: false,
        message: 'Missing required data (ratings, feedback, instructorId, subjects, or studentId)',
      });
    }

    // Check if the student has already evaluated the instructor
    const existingEvaluation = await Evaluation.findOne({
      where: { studentId, instructorId, subjects },
    });

    if (existingEvaluation) {
      return res.status(400).json({
        success: false,
        message: 'You have already evaluated this instructor.',
      });
    }

    // Create a new evaluation entry with evaluationId as auto-generated ID
    const newEvaluation = await Evaluation.create({
      studentId,
      instructorId,
      subjects,
      feedback,
      evaluationdate: new Date(),
    });

    // Ensure newEvaluation contains the auto-generated id
    if (!newEvaluation || !newEvaluation.id) {
      throw new Error('Failed to create evaluation. No ID returned.');
    }

    // Set the evaluationId to the auto-generated ID
    const evaluationId = newEvaluation.id;

    // Insert responses into EvaluationResponses table
    const responseEntries = ratings.map(({ questionId, value }) => ({
      evaluationId,  // Use the newly created evaluation's ID
      questionId,
      response: value,
    }));

    // Bulk insert the responses
    await EvaluationResponse.bulkCreate(responseEntries);

    // Return a successful response
    res.status(200).json({
      success: true,
      message: 'Evaluation submitted successfully',
    });
  } catch (error) {
    console.error('Unexpected error submitting evaluation:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

routes.get('/history', async (req, res) => {
  try {
    // Retrieve evaluations for the logged-in student
    const evaluations = await Evaluation.findAll({
      where: { studentId: req.session.studentId },
      order: [['evaluationdate', 'DESC']],
    });

    // Retrieve evaluation responses for the evaluations
    const evaluationIds = evaluations.map(evaluation => evaluation.id);
    const evaluationResponses = await EvaluationResponse.findAll({
      where: {
        evaluationId: evaluationIds,
      },
    });

    // Retrieve all the questions (criteria)
    const questions = await Questionnaire.findAll();

    // Manually fetch the instructor names (funame) for each evaluation
    const evaluationsWithInstructorName = await Promise.all(evaluations.map(async (evaluation) => {
      const instructor = await Instructor.findOne({
        where: { id: evaluation.instructorId },
        attributes: ['funame'],
      });
      return {
        ...evaluation.toJSON(),
        funame: instructor ? instructor.funame : 'No instructor name available',
      };
    }));

    // Send the data to the view
    res.render('history', {
      evaluations: evaluationsWithInstructorName,
      responses: evaluationResponses,
      questions: questions,
    });
  } catch (error) {
    console.error('Error fetching evaluations and responses:', error);
    res.status(500).send('Internal Server Error');
  }
});

routes.post('/api/instructor-login' , async (req, res) => {
  const { instructorId, password } = req.body;

  try {
    const instructor = await Instructor.findOne({ where: { instructorId } });

    if (!instructor || !bcrypt.compareSync(password, instructor.password)) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    // Set instructorId and other instructor data in session
    req.session.instructorId = instructorId;  // Store instructor's ID in session
    req.session.user = instructor;  // Optionally store the full user object in session

    console.log('Instructor session after login:', req.session);  // Log session for debugging

    return res.status(200).json({ success: true, message: 'Logged in successfully' });
  } catch (error) {
    console.error('Instructor login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

routes.post('/api/login', async (req, res) => {
  const { studentId, password } = req.body;

  try {
    const student = await Student.findOne({ where: { studentId } });

    if (!student || !bcrypt.compareSync(password, student.password)) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Set studentId in session
    req.session.studentId = studentId;
    console.log('Session after login:', req.session);  // Log session for debugging

    return res.status(200).json({ success: true, message: 'Logged in successfully' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update section by ID
routes.put("/section/:id", async (req, res) => {
  const sectionId = req.params.id; // Get ID from the request parameters
  const { section_name, section_block, section_yearLevel} = req.body; // Get updated data from request body

  try {
    const section = await db.Section.findByPk(sectionId); // Find the section
    if (!section) {
      return res.status(404).json({ message: 'Section not found.' }); // Handle not found case
    }

    // Update the section
    section.section_name = section_name;
    section.section_block = section_block;
    section.section_yearLevel = section.yearLevel;
    await section.save(); // Save changes to the database

    res.json(section); // Respond with the updated section
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message }); // Include error message in response
  }
});

// Serve students.ejs at the /students route
routes.get("/students", async (req, res) => {
  try {
    const students = await Student.findAll(); // Fetch all students from the database
    res.render("students", { students }); // Pass students to the view
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).send('Internal Server Error'); // Handle error properly
  }
});

// Add a new student
routes.post("/students", async (req, res) => {
  try {
    console.log(req.body); // Log the entire request body

    const { studentId, fname, yearLevel, block, password, subjects } = req.body; // Destructure the incoming data

    console.log("Name:", fname); // Log the name to ensure it's being captured

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new student in the database
    await Student.create({
      studentId,
      fname,
      yearLevel,
      block,
      password: hashedPassword,
      subjects
    });
    // Redirect to /students to see the updated list
    res.redirect("/students");
  } catch (error) {
    console.error("Error adding student:", error);
    return res.status(500).send('Internal Server Error'); // Return to prevent further code execution
  }
});

// Update a student's information
routes.put("/students/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId, fname, yearLevel, block, password, subjects } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    // Optionally hash password if updating
    const updatedStudent = await Student.update(
      {
        studentId,
        fname,
        yearLevel,
        block,
        password: hashedPassword,
        subjects,
      },
      { where: { id } }
    );

    res.redirect("/students");
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).send('Internal Server Error');
  }
});

routes.get('/instructor', authMiddleware, async (req, res) => {
  const instructorId = req.session.instructorId;

  try {
    // Fetch instructor data
    const instructor = await Instructor.findOne({
      where: { instructorId },
      attributes: ['id', 'subjects'], // Fetch the instructor's subjects field
    });

    if (!instructor) {
      return res.status(404).send("Instructor not found");
    }

    // Extract only the subject codes from the 'subjects' field
    const assignedSubjects = instructor.subjects
      .split('\n')
      .map(subject => subject.split(':')[0].trim())
      .filter(Boolean);

    // Fetch all subjects from the database
    const allSubjects = await Subject.findAll({
      where: { subjectName: assignedSubjects },
      attributes: ['subjectName', 'description'],
    });

    // Map descriptions for assigned subjects
    const subjectDescriptionMap = {};
    allSubjects.forEach(subject => {
      subjectDescriptionMap[subject.subjectName] = subject.description;
    });

    // Fetch evaluations for the instructor
    const evaluations = await Evaluation.findAll({
      where: { instructorId: instructor.id },
      attributes: ['id', 'subjects', 'feedback'],
    });

    // Separate the feedback and evaluations for subjects
    const evaluationSummary = await Promise.all(
      assignedSubjects.map(async (subjectName) => {
        const subjectEvaluations = evaluations.filter(evaluation => {
          const evaluationSubjects = evaluation.subjects.split(',').map(name => name.trim());
          return evaluationSubjects.includes(subjectName);
        });

        const evaluationIds = subjectEvaluations.map(evaluation => evaluation.id);

        // Fetch responses for these evaluations
        const responses = await EvaluationResponse.findAll({
          where: { evaluationId: evaluationIds },
          attributes: ['response'],
        });

        const averageRating = responses.length
          ? responses.reduce((sum, response) => sum + response.response, 0) / responses.length
          : 0;

        return {
          subjectName,
          description: subjectDescriptionMap[subjectName] || "No description available",
          averageRating,
          numEvaluated: subjectEvaluations.length,
        };
      })
    );

    // Collect feedback separately for the "Student Says" section
    const feedbacks = evaluations.flatMap(evaluation => evaluation.feedback).filter(Boolean);

    // Filter out subjects with no evaluations or description
    const filteredSummary = evaluationSummary.filter(summary => summary.numEvaluated > 0);

    // Prepare data for bar charts
    const subjectNames = filteredSummary.map(summary => summary.subjectName);
    const averageRatings = filteredSummary.map(summary => summary.averageRating);
    const evaluationsCount = filteredSummary.map(summary => summary.numEvaluated);

    // Render the summary page with evaluation data, charts, and feedback
    res.render('instructor', {
      instructorId,
      evaluationSummary: filteredSummary,
      subjectNames,
      averageRatings,
      evaluationsCount,
      feedbacks, // Send the feedbacks to display separately
    });
  } catch (error) {
    console.error("Error fetching evaluation summary:", error);
    res.status(500).send("Server Error");
  }
});

// Route handler for summary
routes.get('/summary', authMiddleware, async (req, res) => {
  const instructorId = req.session.instructorId;

  try {
    // Fetch instructor data
    const instructor = await Instructor.findOne({
      where: { instructorId },
      attributes: ['id', 'subjects'], // Fetch the instructor's subjects field
    });

    if (!instructor) {
      return res.status(404).send("Instructor not found");
    }

    // Extract only the subject codes from the 'subjects' field
    const assignedSubjects = instructor.subjects
      .split('\n')
      .map(subject => subject.split(':')[0].trim())
      .filter(Boolean);

    // Fetch all subjects from the database
    const allSubjects = await Subject.findAll({
      where: { subjectName: assignedSubjects },
      attributes: ['subjectName', 'description'],
    });

    // Map descriptions for assigned subjects
    const subjectDescriptionMap = {};
    allSubjects.forEach(subject => {
      subjectDescriptionMap[subject.subjectName] = subject.description;
    });

    // Fetch evaluations for the instructor
    const evaluations = await Evaluation.findAll({
      where: { instructorId: instructor.id },
      attributes: ['id', 'subjects', 'feedback'],
    });

    // Separate the feedback and evaluations for subjects
    const evaluationSummary = await Promise.all(
      assignedSubjects.map(async (subjectName) => {
        const subjectEvaluations = evaluations.filter(evaluation => {
          const evaluationSubjects = evaluation.subjects.split(',').map(name => name.trim());
          return evaluationSubjects.includes(subjectName);
        });

        const evaluationIds = subjectEvaluations.map(evaluation => evaluation.id);

        // Fetch responses for these evaluations
        const responses = await EvaluationResponse.findAll({
          where: { evaluationId: evaluationIds },
          attributes: ['response'],
        });

        const averageRating = responses.length
          ? responses.reduce((sum, response) => sum + response.response, 0) / responses.length
          : 0;

        return {
          subjectName,
          description: subjectDescriptionMap[subjectName] || "No description available",
          averageRating,
          numEvaluated: subjectEvaluations.length,
        };
      })
    );

    // Collect feedback separately for the "Student Says" section
    const feedbacks = evaluations.flatMap(evaluation => evaluation.feedback).filter(Boolean);

    // Filter out subjects with no evaluations or description
    const filteredSummary = evaluationSummary.filter(summary => summary.numEvaluated > 0);

    // Prepare data for bar charts
    const subjectNames = filteredSummary.map(summary => summary.subjectName);
    const averageRatings = filteredSummary.map(summary => summary.averageRating);
    const evaluationsCount = filteredSummary.map(summary => summary.numEvaluated);

    // Render the summary page with evaluation data, charts, and feedback
    res.render('summary', {
      instructorId,
      evaluationSummary: filteredSummary,
      subjectNames,
      averageRatings,
      evaluationsCount,
      feedbacks, // Send the feedbacks to display separately
    });
  } catch (error) {
    console.error("Error fetching evaluation summary:", error);
    res.status(500).send("Server Error");
  }
});

routes.get("/instructors", async (req, res) => {
  try {
    const instructors = await Instructor.findAll(); // Fetch all instructors from the database
    res.render("instructors", { instructors }); // Pass instructors to the view
  } catch (error) {
    console.error("Error fetching instructors:", error);
    res.status(500).send('Internal Server Error'); // Handle error properly
  }
});

// Add a new instructors
routes.post("/instructors", async (req, res) => {
  try {
    console.log(req.body); // Log the entire request body

    const { instructorId, funame, password, subjects } = req.body; // Destructure the incoming data
    console.log("Name:", funame); // Log the name to ensure it's being captured
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new instructor in the database
    await Instructor.create({
      instructorId,
      funame,
      password: hashedPassword,
      subjects
    });

    // Redirect to /instructors to see the updated list
    res.redirect("/instructors");
  } catch (error) {
    console.error("Error adding instructor:", error);
    return res.status(500).send('Internal Server Error'); // Return to prevent further code execution
  }
});

// Route to get all subjects
routes.get('/api/getsub', async (req, res) => {
  try {
    const subjects = await Subject.findAll(); // Using findAll to get all subjects
    res.json(subjects); // Send subjects as JSON
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});

// Route to remove a subject from an instructor
routes.delete('/api/instructor/subjects/remove/:subjectId', async (req, res) => {
  const { subjectId } = req.params;

  try {
    // Adjust this query to match your schema for removing the subject
    await db.execute('DELETE FROM InstructorSubjects WHERE subjectId = ?', [subjectId]);
    res.json({ success: true });
  } catch (error) {
    console.error("Error removing subject:", error);
    res.status(500).json({ success: false, message: "Failed to remove subject" });
  }
});

// Add a new subjects
routes.post("/1subjects", async (req, res) => {
  try {
    console.log(req.body); // Log the entire request body

    const { subjectId, subjectName, description, unit, time, day, isLab } = req.body; // Destructure the incoming data
    console.log("Name:", subjectName); // Log the name to ensure it's being captured

    const yearLevel = "1st Year";

    // Create a new subject in the database
    await Subject.create({
      subjectId,
      subjectName,
      description,
      unit,
      time,
      day,
      isLab,
      yearLevel
    });

    // Redirect to /subjects to see the updated list
    res.redirect("/1subjects");
  } catch (error) {
    console.error("Error adding subject:", error);
    return res.status(500).send('Internal Server Error'); // Return to prevent further code execution
  }
});

// Add a new subjects
routes.post("/2subjects", async (req, res) => {
  try {
    console.log(req.body); // Log the entire request body

    const { subjectId, subjectName, description, unit, time, day, isLab } = req.body; // Destructure the incoming data
    console.log("Name:", subjectName); // Log the name to ensure it's being captured

    const yearLevel = "2nd Year";

    // Create a new subject in the database
    await Subject.create({
      subjectId,
      subjectName,
      description,
      unit,
      time,
      day,
      isLab,
      yearLevel
    });

    // Redirect to /subjects to see the updated list
    res.redirect("/2subjects");
  } catch (error) {
    console.error("Error adding subject:", error);
    return res.status(500).send('Internal Server Error'); // Return to prevent further code execution
  }
});

// Add a new subjects
routes.post("/3subjects", async (req, res) => {
  try {
    console.log(req.body); // Log the entire request body

    const { subjectId, subjectName, description, unit, time, day, isLab } = req.body; // Destructure the incoming data
    console.log("Name:", subjectName); // Log the name to ensure it's being captured

    const yearLevel = "3rd Year";

    // Create a new subject in the database
    await Subject.create({
      subjectId,
      subjectName,
      description,
      unit,
      time,
      day,
      isLab,
      yearLevel
    });

    // Redirect to /subjects to see the updated list
    res.redirect("/3subjects");
  } catch (error) {
    console.error("Error adding subject:", error);
    return res.status(500).send('Internal Server Error'); // Return to prevent further code execution
  }
});

// Add a new subjects
routes.post("/4subjects", async (req, res) => {
  try {
    console.log(req.body); // Log the entire request body

    const { subjectId, subjectName, description, unit, time, day, isLab } = req.body; // Destructure the incoming data
    console.log("Name:", subjectName); // Log the name to ensure it's being captured
    const yearLevel = "4th Year";

    // Create a new subject in the database
    await Subject.create({
      subjectId,
      subjectName,
      description,
      unit,
      time,
      day,
      isLab,
      yearLevel
    });

    // Redirect to /subjects to see the updated list
    res.redirect("/4subjects");
  } catch (error) {
    console.error("Error adding subject:", error);
    return res.status(500).send('Internal Server Error'); // Return to prevent further code execution
  }
});

routes.get("/1subjects", async (req, res) => {
  const yearLevel = "1st Year"; // Specify the year level

  try {
    // Fetch subjects for the specified year level
    const subjects = await Subject.findAll({ where: { yearLevel } });

    console.log("Subjects fetched for 1st Year:", subjects); // Debugging output

    // Pass the fetched subjects and yearLevel to the view
    res.render("1subjects", { subjects, yearLevel });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).send("Internal Server Error");
  }
});

routes.get("/2subjects", async (req, res) => {
  const yearLevel = "2nd Year"; // Specify the year level

  try {
    // Fetch subjects for the specified year level
    const subjects = await Subject.findAll({ where: { yearLevel } });

    console.log("Subjects fetched for 2nd Year:", subjects); // Debugging output

    // Pass the fetched subjects and yearLevel to the view
    res.render("2subjects", { subjects, yearLevel });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).send("Internal Server Error");
  }
});

routes.get("/3subjects", async (req, res) => {
  const yearLevel = "3rd Year"; // Specify the year level

  try {
    // Fetch subjects for the specified year level
    const subjects = await Subject.findAll({ where: { yearLevel } });

    console.log("Subjects fetched for 3rd Year:", subjects); // Debugging output

    // Pass the fetched subjects and yearLevel to the view
    res.render("3subjects", { subjects, yearLevel });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).send("Internal Server Error");
  }
});

routes.get("/4subjects", async (req, res) => {
  const yearLevel = "4th Year"; // Specify the year level

  try {
    // Fetch subjects for the specified year level
    const subjects = await Subject.findAll({ where: { yearLevel } });

    console.log("Subjects fetched for 4th Year:", subjects); // Debugging output

    // Pass the fetched subjects and yearLevel to the view
    res.render("4subjects", { subjects, yearLevel });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Handle form submission for saving section
routes.post("/1section", saveSection);
routes.post("/2section", saveSection);
routes.post("/3section", saveSection);
routes.post("/4section", saveSection);

routes.get('/student', (req, res) => {
    console.log('req.user:', req.user);
    const fname = req.user ? req.user.fname : 'Student';
    res.render('student', { fname });
});

routes.get('/report', async (req, res) => {
  try {
    // Fetch all necessary data
    const evaluations = await Evaluation.findAll();
    const evaluationResponses = await EvaluationResponse.findAll();
    const instructors = await Instructor.findAll();
    const students = await Student.findAll();

    // Prepare evaluations for rendering
    const evaluationsData = evaluations.map((evaluation) => {
      const instructor = instructors.find((inst) => inst.id === evaluation.instructorId);
      const student = students.find((stud) => stud.studentId === evaluation.studentId);
      const subjectNames = evaluation.subjects ? evaluation.subjects.split(', ') : ['N/A'];

      // Calculate the average rating for the evaluation
      const responses = evaluationResponses.filter((response) => response.evaluationId === evaluation.id);
      const averageRating = responses.length
        ? (responses.reduce((sum, response) => sum + response.response, 0) / responses.length).toFixed(2)
        : 'No Ratings';

      return {
        id: evaluation.id,
        subject: subjectNames.join(', '),
        instructor: instructor ? instructor.funame : 'Unknown',
        student: student ? student.fname : 'Unknown',
        remarks: averageRating, // Average rating as remarks
        date: evaluation.evaluationdate ? new Date(evaluation.evaluationdate).toLocaleDateString() : 'No Date',
      };
    });

    // Calculate the most and least evaluated subjects
    const subjectCounts = evaluations.reduce((acc, evaluation) => {
      const subjects = evaluation.subjects ? evaluation.subjects.split(', ') : [];
      subjects.forEach(subject => {
        acc[subject] = (acc[subject] || 0) + 1;
      });
      return acc;
    }, {});

    const mostEvaluatedSubject = Object.keys(subjectCounts).reduce((a, b) => subjectCounts[a] > subjectCounts[b] ? a : b);
    const leastEvaluatedSubject = Object.keys(subjectCounts).reduce((a, b) => subjectCounts[a] < subjectCounts[b] ? a : b);

    // Find the highest and lowest average remarks
    const ratings = evaluations.map((evaluation) => {
      const responses = evaluationResponses.filter((response) => response.evaluationId === evaluation.id);
      const avgRating = responses.length
        ? (responses.reduce((sum, response) => sum + response.response, 0) / responses.length)
        : null;
      return { id: evaluation.id, avgRating };
    });

    const highestRemark = Math.max(...ratings.filter(r => r.avgRating !== null).map(r => r.avgRating));
    const lowestRemark = Math.min(...ratings.filter(r => r.avgRating !== null).map(r => r.avgRating));

    // Count ratings 1-5
    const ratingCounts = [1, 2, 3, 4, 5].reduce((acc, rating) => {
      acc[rating] = evaluationResponses.filter(response => response.response === rating).length;
      return acc;
    }, {});

    res.render('report', {
      evaluations: evaluationsData,
      mostEvaluatedSubject,
      leastEvaluatedSubject,
      highestRemark,
      lowestRemark,
      ratingCounts,
      subjectCounts
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});


// Serve user.ejs at the /users route
routes.get("/users", (req, res) => {
  res.render("user");
});

// Serve subjects.ejs at the /subjects route
routes.get("/1subjects", (req, res) => {
  res.render("1subjects");
});

// Login route
routes.post("/login", login);

//USER MANAGEMENT
// Get all users (for display)
routes.get('/users/list', async (req, res) => {
  const users = await User.findAll();
  res.json(users); // Return the users as JSON
});

// Update a specific user by ID
routes.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, username, password } = req.body;
  try {
    const user = await User.findOne({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update the user with new data
    user.name = name;
    user.username = username;

    // Only update the password if it is provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10); // Hash the new password
      user.password = hashedPassword;
    }

    await user.save();
    res.json(user); // Return the updated user
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Error updating user' });
  }
});

// Get a specific user by ID
routes.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findOne({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE user by ID
routes.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await User.destroy({ where: { id } });
    res.sendStatus(200);
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).send('Server error');
  }
});

// Add a new user
routes.post('/users', async (req, res) => {
  const { name, username, password } = req.body;
  try {
    // Hash the password before saving the user
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    const newUser = await User.create({ name, username, password: hashedPassword });
    res.json(newUser);
  } catch (error) {
    res.status(400).json({ error: 'Error creating user' });
  }
});

// Fetch user by ID for editing
routes.put('/api/students/:id', async (req, res) => {
  const { id } = req.params;
  const { studentId, yearLevel, block, fname, password, subjects } = req.body;

  try {
      const student = await Student.findOne({ where: { studentId: id } });
      if (!student) {
          return res.status(404).json({ message: "Student not found" });
      }

      // Update student fields
      student.studentId = studentId;
      student.yearLevel = yearLevel;
      student.block = block;
      student.fname = fname;
      student.subjects = subjects;

      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password with salt rounds of 10
        student.password = hashedPassword; // Save the hashed password
    }

      await student.save(); // Save the updated student

      res.status(200).json(student);
  } catch (error) {
      console.error("Error updating student:", error);
      res.status(500).json({ message: "Failed to update student" });
  }
});

// Add a new student in the /api/students route (also hashed)
routes.post("/api/students", async (req, res) => {
  try {
    const { studentId, yearLevel, block, fname, password, subjects } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newStudent = await Student.create({
      studentId,
      yearLevel,
      block,
      fname,
      password: hashedPassword,
      subjects,
    });

    res.status(201).json(newStudent);
  } catch (error) {
    console.error("Error creating student:", error);
    res.status(500).json({ message: "Failed to create student" });
  }
});

routes.put("/api/students/:id", async (req, res) => {
  try {
      const { id } = req.params;
      const { studentId, yearLevel, block, fname, password, subjects } = req.body;

      // Find the student by primary key
      const student = await Student.findByPk(id);
      if (!student) {
          return res.status(404).json({ message: "Student not found" });
      }

      // Update student data
      await student.update({ studentId, yearLevel, block, fname, password, subjects });
      res.status(200).json(student); // Return updated student data
  } catch (error) {
      console.error("Error updating student:", error);
      res.status(500).json({ message: "Failed to update student" });
  }
});

// Add a route to retrieve a student's current data for editing
routes.get("/api/students/:id", async (req, res) => {
  try {
      const { id } = req.params;
      const student = await Student.findByPk(id);
      if (!student) {
          return res.status(404).json({ message: "Student not found" });
      }
      res.status(200).json(student); // Return student data
  } catch (error) {
      console.error("Error retrieving student:", error);
      res.status(500).json({ message: "Failed to retrieve student" });
  }
});

// Delete a user
routes.delete('/api/students/:id', async (req, res) => {
  try {
      const studentId = req.params.id; // Get the student ID from the URL parameter
      const result = await Student.destroy({
          where: { studentId: studentId } // Assuming 'studentId' is the primary key
      });

      if (result === 0) {
          // No rows were deleted, maybe the ID doesn't exist
          return res.status(404).json({ message: "Student not found." });
      }

      res.status(200).json({ message: "Student deleted successfully." });
  } catch (error) {
      console.error("Error deleting student:", error);
      res.status(500).json({ message: "Internal server error." });
  }
});

routes.get('/1section', async (req, res) => {
  const yearLevel = '1st Year'; 
  try {
    // Fetch sections and students for the 1st year
    const sections = await Section.findAll({ where: { yearLevel: '1st Year' } });
    const students = await Student.findAll({ where: { yearLevel } });
    
    console.log("Sections fetched:", sections);
    console.log("Students fetched:", students);
    
    // Pass both sections, students, and yearLevel to the template
    res.render('1section', { sections, students, yearLevel });
  } catch (error) {
    console.error("Error retrieving sections or students:", error);
    res.status(500).send("Error retrieving sections or students.");
  }
});

routes.get('/2section', async (req, res) => {
  const yearLevel = '2nd Year'; 
  try {
    // Fetch sections and students for the 1st year
    const sections = await Section.findAll({ where: { yearLevel: '2nd Year' } });
    const students = await Student.findAll({ where: { yearLevel } });
    
    console.log("Sections fetched:", sections);
    console.log("Students fetched:", students);
    
    // Pass both sections, students, and yearLevel to the template
    res.render('2section', { sections, students, yearLevel });
  } catch (error) {
    console.error("Error retrieving sections or students:", error);
    res.status(500).send("Error retrieving sections or students.");
  }
});

routes.get('/3section', async (req, res) => {
  const yearLevel = '3rd Year'; 
  try {
    // Fetch sections and students for the 1st year
    const sections = await Section.findAll({ where: { yearLevel: '3rd Year' } });
    const students = await Student.findAll({ where: { yearLevel } });
    
    console.log("Sections fetched:", sections);
    console.log("Students fetched:", students);
    
    // Pass both sections, students, and yearLevel to the template
    res.render('3section', { sections, students, yearLevel });
  } catch (error) {
    console.error("Error retrieving sections or students:", error);
    res.status(500).send("Error retrieving sections or students.");
  }
});

routes.get('/4section', async (req, res) => {
  const yearLevel = '4th Year'; 
  try {
    // Fetch sections and students for the 1st year
    const sections = await Section.findAll({ where: { yearLevel: '4th Year' } });
    const students = await Student.findAll({ where: { yearLevel } });
    
    console.log("Sections fetched:", sections);
    console.log("Students fetched:", students);
    
    // Pass both sections, students, and yearLevel to the template
    res.render('4section', { sections, students, yearLevel });
  } catch (error) {
    console.error("Error retrieving sections or students:", error);
    res.status(500).send("Error retrieving sections or students.");
  }
});

routes.post('/1section/add', async (req, res) => {
  const { sectionBlock, sectionYearLevel } = req.body;

  // Validate input: Block should be a single uppercase letter
  if (!/^[A-Z]$/.test(sectionBlock)) {
    return res.status(400).send("Block must be a single uppercase letter.");
  }

  try {
    // Save the block with the associated year level to the Sections table
    await Section.create({ block: sectionBlock, yearLevel: sectionYearLevel });
    res.redirect("/1section");
  } catch (error) {
    console.error("Error adding block:", error);
    res.status(500).send("Failed to add block.");
  }
});

routes.post('/2section/add', async (req, res) => {
  const { sectionBlock, sectionYearLevel } = req.body;

  // Validate input: Block should be a single uppercase letter
  if (!/^[A-Z]$/.test(sectionBlock)) {
    return res.status(400).send("Block must be a single uppercase letter.");
  }

  try {
    // Save the block with the associated year level to the Sections table
    await Section.create({ block: sectionBlock, yearLevel: sectionYearLevel });
    res.redirect("/2section");
  } catch (error) {
    console.error("Error adding block:", error);
    res.status(500).send("Failed to add block.");
  }
});

routes.post('/3section/add', async (req, res) => {
  const { sectionBlock, sectionYearLevel } = req.body;

  // Validate input: Block should be a single uppercase letter
  if (!/^[A-Z]$/.test(sectionBlock)) {
    return res.status(400).send("Block must be a single uppercase letter.");
  }

  try {
    // Save the block with the associated year level to the Sections table
    await Section.create({ block: sectionBlock, yearLevel: sectionYearLevel });
    res.redirect("/3section");
  } catch (error) {
    console.error("Error adding block:", error);
    res.status(500).send("Failed to add block.");
  }
});

routes.post('/4section/add', async (req, res) => {
  const { sectionBlock, sectionYearLevel } = req.body;

  // Validate input: Block should be a single uppercase letter
  if (!/^[A-Z]$/.test(sectionBlock)) {
    return res.status(400).send("Block must be a single uppercase letter.");
  }

  try {
    // Save the block with the associated year level to the Sections table
    await Section.create({ block: sectionBlock, yearLevel: sectionYearLevel });
    res.redirect("/4section");
  } catch (error) {
    console.error("Error adding block:", error);
    res.status(500).send("Failed to add block.");
  }
});

routes.get("/get-blocks", async (req, res) => {
  const { yearLevel } = req.query;  // Extract yearLevel from query params

  try {
    // Find blocks based on yearLevel using Sequelize
    const blocks = await Section.findAll({
      where: { yearLevel },
      attributes: ['block'],  // Select only the 'block' column
    });

    console.log("Blocks found: ", blocks);  // Debugging the blocks

    if (blocks.length === 0) {
      return res.status(404).json({ message: "No blocks found for the given year level." });
    }

    // Map the result into a proper response
    const blockData = blocks.map(block => ({ section: block.block }));
    res.json(blockData);  // Send the blocks back as a JSON response
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

routes.get("/get-subjects", async (req, res) => {
  const { yearLevel } = req.query;
  console.log(`Fetching subjects for year level: ${yearLevel}`); // Debug log

  try {
    const subjects = await Subject.findAll({
      where: { yearLevel },
      attributes: ["subjectName", "description"],
    });

    console.log("Subjects fetched:", subjects); // Log subjects for debugging

    if (subjects.length === 0) {
      return res.status(404).json({ message: "No subjects found for the given year level." });
    }

    res.json(subjects);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error" });
  }
});



module.exports = routes;
