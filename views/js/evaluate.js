document.addEventListener("DOMContentLoaded", () => {
  fetchQuestions();

  async function fetchQuestions() {
    try {
      const response = await fetch("/questionnaire/questions");
      const result = await response.json();

      if (result.success) {
        const questionnaireContainer = document.querySelector(".questionnaire-table");
        questionnaireContainer.innerHTML =
          `<h6>Evaluation Questionnaire</h6>
          <div class="legend">
            <p>Rating Legend</p>
            <p>5 = Strongly Agree, 4 = Agree, 3 = Uncertain, 2 = Disagree, 1 = Strongly Disagree</p>
          </div>`;

        const allCriteria = ["Criteria 1", "Criteria 2", "Criteria 3"];

        allCriteria.forEach((criteria) => {
          const criteriaSection = document.createElement("div");
          criteriaSection.className = "criteria-section";
          criteriaSection.innerHTML = `<h4>${criteria}</h4>`;

          const questions = result.data[criteria] || [];
          if (questions.length === 0) {
            const noQuestions = document.createElement("p");
            noQuestions.textContent = "No questions available for this criteria.";
            criteriaSection.appendChild(noQuestions);
          } else {
            questions.forEach((question) => {
              const questionRow = document.createElement("div");
              questionRow.className = "question-row";
              questionRow.innerHTML = 
                `<p>${question.text}</p>
                 <div class="rating-options">
                   ${[5, 4, 3, 2, 1].map(
                     (rating) =>
                       `<label>
                          <input type="radio" name="question_${question.id}" value="${rating}"> ${rating}
                        </label>`
                   ).join("")}
                 </div>`;
              criteriaSection.appendChild(questionRow);
            });
          }

          questionnaireContainer.appendChild(criteriaSection);
        });

        // Add feedback and submit button at the end
        const feedbackSection = document.createElement("div");
        feedbackSection.className = "feedback-section";
        feedbackSection.innerHTML =
          `<h3>Feedback</h3>
           <textarea rows="5" placeholder="Write your feedback here..."></textarea>`;
        questionnaireContainer.appendChild(feedbackSection);

        const submitButton = document.createElement("button");
        submitButton.className = "btn save-order";
        submitButton.id = "submitEvaluation";
        submitButton.textContent = "Submit Evaluation";
        questionnaireContainer.appendChild(submitButton);

        submitButton.addEventListener("click", handleSubmit);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
  
    if (confirm("Are you sure you want to submit?")) {
      const selectedRatings = Array.from(
        document.querySelectorAll(".rating-options input:checked")
      ).map((input) => ({
        questionId: input.name.split("_")[1],
        value: parseInt(input.value, 10), // Ensure value is an integer
      }));
  
      const feedback = document.querySelector(".feedback-section textarea").value.trim();
      const instructorId = document.getElementById("instructorSelect").value;
      const subjects = document.getElementById("instructorSubjects").textContent.trim();
  
      if (!instructorId || !subjects || selectedRatings.length === 0 || !feedback) {
        alert("Please complete all fields and provide feedback.");
        return;
      }
  
      const evaluationData = {
        instructorId,
        ratings: selectedRatings,
        feedback,
        subjects,
      };
  
      try {
        const response = await fetch("/api/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(evaluationData),
        });
  
        const result = await response.json();
  
        if (response.ok && result.success) {
          alert("Evaluation submitted successfully!");
          clearForm();
        } else {
          alert(`Failed to submit evaluation: ${result.message || "Server error"}`);
        }
      } catch (error) {
        console.error("Error submitting evaluation:", error);
        alert("An error occurred while submitting the evaluation.");
      }
    }
  }
  
  async function getStudentId() {
    try {
      const response = await fetch("/api/getStudentId", {
        method: "GET",
        credentials: "same-origin"  // Ensure the session cookie is sent
      });
  
      const result = await response.json();
      console.log("getStudentId response:", result);
  
      if (result.success) {
        return result.studentId;
      } else {
        throw new Error("Failed to retrieve student ID");
      }
    } catch (error) {
      console.error("Error fetching student ID:", error);
      return null;
    }
  }
  
  function clearForm() {
    document.querySelector(".feedback-section textarea").value = "";
    const selectedRatings = document.querySelectorAll(".rating-options input:checked");
    selectedRatings.forEach((rating) => {
      rating.checked = false;
    });
    document.getElementById("instructorSelect").value = "";
    document.getElementById("instructorDetails").style.display = "none";
  }  
});

  document.addEventListener("DOMContentLoaded", () => {
  const instructorSelect = document.getElementById("instructorSelect");
  const instructorDetails = document.getElementById("instructorDetails");
  const instructorName = document.getElementById("instructorName");
  const instructorSubjects = document.getElementById("instructorSubjects");

  // Fetch available instructors and populate the dropdown
  async function fetchInstructors() {
    try {
      const response = await fetch("/api/instructors");
      const data = await response.json();
      if (data.success) {
        const instructors = data.instructors;
        instructorSelect.innerHTML =
          '<option value="" disabled selected>Select an instructor</option>';
        instructors.forEach((instructor) => {
          const option = document.createElement("option");
          option.value = instructor.id;
          option.textContent = instructor.funame;
          instructorSelect.appendChild(option);
        });
      } else {
        alert("No instructors found!");
      }
    } catch (error) {
      console.error("Error fetching instructors:", error);
      alert("Failed to load instructors.");
    }
  }

  // Handle instructor selection change
  instructorSelect.addEventListener("change", async (event) => {
    const instructorId = event.target.value;

    if (instructorId) {
      try {
        const response = await fetch(`/instructor/${instructorId}`);
        const data = await response.json();

        if (data.success) {
          instructorName.textContent = data.instructor.funame || "No name available";
          instructorSubjects.textContent = data.instructor.subjects.join(", ");
          instructorDetails.style.display = "block"; // Show the details section
        } else {
          instructorDetails.style.display = "none"; // Hide if no data
        }
      } catch (error) {
        console.error("Error fetching instructor details:", error);
        instructorDetails.style.display = "none"; // Hide in case of error
      }
    }
  });

  fetchInstructors();
});
