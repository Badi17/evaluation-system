document.addEventListener("DOMContentLoaded", function () {
    loadStudents(); // Load students on page load

    // Search functionality
    document.getElementById("search").addEventListener("input", function () {
        const query = this.value.toLowerCase();
        filterStudents(query);
    });
});

// Fetch students and populate the table
async function loadStudents() {
    try {
        const response = await fetch("/api/students");
        const students = await response.json();
        const tableBody = document.getElementById("student-table-body");
        tableBody.innerHTML = ""; // Clear existing rows

        students.forEach((student, index) => {
            const row = document.createElement("tr");
            row.dataset.id = student.studentId; // Ensure this is set correctly
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${student.studentId}</td>
                <td>${student.fname}</td>
                <td>${student.yearLevel}</td>
                <td>${student.block}</td>
                <td>${student.subjects}</td>
                <td>
                    <i class="bx bx-show show-btn" onclick="viewStudent(${student.studentId})"></i>
                    <i class="bx bx-edit edit-btn" onclick="editStudent(${student.studentId})"></i>
                    <i class="bx bx-trash delete-btn" data-id="${student.studentId}"></i> 
                </td>`;
            tableBody.appendChild(row);

            // Add click event listener for delete button in the current row
            const deleteButton = row.querySelector(".delete-btn");
            deleteButton.addEventListener("click", function () {
                const studentId = this.dataset.id; // Get student ID from data-id
                console.log("Student ID to delete:", studentId); // Debugging statement
                deleteStudent(studentId);
            });
        });

        // Maintain the search state after loading students
        const searchQuery = document.getElementById("search").value;
        filterStudents(searchQuery);
    } catch (error) {
        console.error("Error loading students:", error);
    }
}

// Function to filter displayed students based on search input
function filterStudents(query) {
    const rows = document.querySelectorAll("#student-table-body tr");
    rows.forEach(row => {
        const fname = row.cells[2].textContent.toLowerCase();
        const studentId = row.cells[1].textContent.toLowerCase();
        row.style.display = fname.includes(query) || studentId.includes(query) ? "" : "none";
    });
}

document.addEventListener("DOMContentLoaded", function () {
    loadStudents();

    // Event delegation for delete buttons
    document.getElementById("student-table-body").addEventListener("click", function (event) {
        if (event.target.classList.contains("delete-btn")) {
            const studentId = event.target.dataset.id; // Correctly get the studentId from data-id
            console.log("Student ID to delete:", studentId); // Debugging statement
            deleteStudent(studentId);
        }
    });
});

// Delete student
async function deleteStudent(id) {
    console.log("Deleting student with ID:", id); // Debugging statement
    if (confirm("Are you sure you want to delete this student?")) {
        try {
            const response = await fetch(`/api/students/${id}`, { method: "DELETE" });
            if (response.ok) {
                loadStudents(); // Reload the students after deletion
            } else {
                alert("Failed to delete student. Please try again.");
            }
        } catch (error) {
            console.error("Error deleting student:", error);
        }
    }
}

document.getElementById("close-view-popup").addEventListener("click", () => {
    const viewModal = document.getElementById("view-student-modal");
    viewModal.style.display = "none"; // Hide the modal
});

window.addEventListener("click", (event) => {
    const viewModal = document.getElementById("view-student-modal");
    if (event.target == viewModal) {
        viewModal.style.display = "none";
    }
});

document.getElementById("student-table-body").addEventListener("click", function (event) {
    if (event.target.classList.contains("edit-btn")) {
        const studentId = event.target.closest("tr").dataset.id; // Get student ID
        editStudent(studentId); // Call edit function
    }
});

document.getElementById("close-success-popup").addEventListener("click", () => {
    const successModal = document.getElementById("success-modal");
    successModal.style.display = "none"; // Hide the modal
    loadStudents();
});

function showSuccessModal() {
    const successModal = document.getElementById("success-modal");
    successModal.style.display = "flex"; // Show the modal

    // Automatically close the modal after 3 seconds and refresh the student list
    setTimeout(() => {
        successModal.style.display = "none"; // Hide the modal
        loadStudents(); // Refresh the student list
    }, 2000);
}
        // Open modal and fill in data
        openPopup.addEventListener("click", () => {
            modal.style.display = "flex";
            // Reset form fields and modal title
            document.querySelector(".modal-header h2").innerHTML = '<i class="bx bx-plus"></i> Add Student';
            document.querySelector(".btn-add").textContent = "Add";
            document.querySelector(".add-student-form").reset(); // Reset form fields
            document.getElementById("edit-mode").value = "false"; // Reset edit mode
        });

        // Reset form and modal content when the Add button is clicked
        openPopup.addEventListener("click", () => {
            modal.style.display = "flex";
            document.querySelector(".modal-header h2").innerHTML = '<i class="bx bx-plus"></i> Add Student';
            document.querySelector(".btn-add").textContent = "Add";
            document.querySelector(".add-student-form").reset(); // Reset form fields

        
        document.addEventListener('DOMContentLoaded', loadStudents);
        
                });

        closePopup.addEventListener("click", () => {
            modal.style.display = "none";
            // Reset form when modal is closed
            document.querySelector(".add-student-form").reset();
            isEditing = false; // Reset editing state
        });

        cancelBtn.addEventListener("click", () => {
            modal.style.display = "none";
            // Reset form when canceled
            document.querySelector(".add-student-form").reset();
            isEditing = false; // Reset editing state
        });

        const isEditMode = document.getElementById("edit-mode").value === "true";
        const studentId = document.getElementById("student-id").value;
        
// Edit student
async function editStudent(id) {
    try {
        const response = await fetch(`/api/students/${id}`);
        if (!response.ok) throw new Error("Failed to fetch student data");

        const student = await response.json();

        // Populate the form fields with the student's data
        document.getElementById("student-id").value = student.studentId;
        document.getElementById("year-level").value = student.yearLevel; // Correct property reference
        document.getElementById("block").value = student.block;
        document.getElementById("student-name").value = student.fname;
        document.getElementById("subjects").value = student.subjects;

        // Update modal UI for editing
        const modal = document.getElementById("add-student-modal");
        modal.style.display = "flex";
        document.querySelector(".modal-header h2").innerHTML = '<i class="bx bx-edit"></i> Edit Student';
        document.querySelector(".btn-add").textContent = "Save Changes";
        document.getElementById("edit-mode").value = "true"; // Set edit mode
    } catch (error) {
        console.error("Error editing student:", error);
    }
}

// Add or Update student on form submission
document.querySelector(".add-student-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const editMode = document.getElementById("edit-mode").value === "true";
    const studentId = document.getElementById("student-id").value;
    const yearLevel = document.getElementById("year-level").value; 
    const block = document.getElementById("block").value; 
    const fname = document.getElementById("student-name").value;
    const password = document.getElementById("student-password").value;
    const subjects = document.getElementById("subjects").value;

    const studentData = { studentId, yearLevel, block, fname, password, subjects }; 

    try {
        const url = editMode ? `/api/students/${studentId}` : '/api/students';
        const method = editMode ? "PUT" : "POST";

        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(studentData)
        });

        if (response.ok) {
            document.getElementById("add-student-modal").style.display = "none";
            showSuccessModal();
        } else {
            alert("Failed to save student data. Please try again.");
        }
    } catch (error) {
        console.error("Error saving student data:", error);
    }
});
// View student details
async function viewStudent(id) {
    try {
        const response = await fetch(`/api/students/${id}`);
        const student = await response.json();

        // Fill in the modal with student details
        document.getElementById("view-student-id").textContent = student.studentId;
        document.getElementById("view-student-name").textContent = student.fname;
        document.getElementById("view-student-yearlevel").textContent = student.yearlevel;
        document.getElementById("view-student-block").textContent = student.block;
        document.getElementById("view-student-subjects").textContent = student.subjects;

        // Display the modal
        const viewModal = document.getElementById("view-student-modal");
        viewModal.style.display = "flex"; // Show the modal

    } catch (error) {
        console.error("Error viewing student:", error);
    }
}

function closeModal() {
    modal.style.display = "none";
    document.querySelector(".add-student-form").reset();
    document.getElementById("edit-mode").value = "false";
    document.querySelector(".modal-header h2").textContent = "Add Student";
    document.querySelector(".btn-add").textContent = "Add";
}

document.addEventListener("DOMContentLoaded", function () {
    // Get references to the year level and block dropdowns
    const yearLevelSelect = document.getElementById("year-level");
    const blockSelect = document.getElementById("block");

    // Listen for changes to the year level selection
    yearLevelSelect.addEventListener("change", function () {
        const selectedYearLevel = yearLevelSelect.value;  // Get the selected year level

        // Clear existing block options 
        blockSelect.innerHTML = '<option value="" disabled selected>Select a Block</option>';

        if (selectedYearLevel) {
            // Make an AJAX request to fetch blocks based on the selected year level
            fetch(`/get-blocks?yearLevel=${selectedYearLevel}`)
                .then(response => response.json())
                .then(data => {
                    // If blocks are returned, populate the block dropdown
                    if (data && data.length > 0) {
                        data.forEach(function (block) {
                            const option = document.createElement("option");
                            option.value = block.section;  // Use block_name from DB
                            option.textContent = block.section;  // Display block name
                            blockSelect.appendChild(option);
                        });
                    } else {
                        blockSelect.innerHTML = '<option value="" disabled>No blocks available</option>';
                    }
                })
                .catch(error => {
                    console.error("Error fetching blocks:", error);
                    blockSelect.innerHTML = '<option value="" disabled>Error fetching blocks</option>';
                });
        }
    });
});

let subjectsList = []; // Store subjects in a variable

document.getElementById("year-level").addEventListener("change", function () {
  const yearLevel = this.value; // Get selected year level
  loadSubjects(yearLevel); // Call loadSubjects with yearLevel
});

async function loadSubjects(yearLevel) {
    try {
      console.log(`Loading subjects for year level: ${yearLevel}`); // Debug log
  
      const url = `/get-subjects?yearLevel=${encodeURIComponent(yearLevel)}`;
      const response = await fetch(url);
  
      // Clear the existing subjects list and remove buttons immediately
      subjectsList = [];
      const subjectTextarea = document.getElementById("subjects");
      subjectTextarea.value = '';
      document.getElementById("subject-buttons").innerHTML = '';
  
      if (!response.ok) {
        throw new Error(`Failed to fetch subjects: ${response.statusText}`);
      }
  
      const subjects = await response.json();
      console.log("Subjects received:", subjects); // Log received data
  
      // Check if subjects are empty
      if (!subjects.length) {
        console.log("No subjects found for the selected year level."); // Log empty subjects
        return;
      }
  
      // Store subjects in the global array
      subjectsList = subjects;
  
      // Display the subjects in the textarea
      subjectTextarea.value = subjects
        .map((s) => `${s.subjectName}: ${s.description}`)
        .join("\n");
  
      // Generate remove buttons dynamically
      generateRemoveButtons();
    } catch (error) {
      console.error("Error loading subjects:", error);
    }
  }
  

function generateRemoveButtons() {
  const removeButtons = subjectsList.map((s, index) => {
    return `<button type="button" onclick="removeSubject(${index})">Remove ${s.subjectName}</button>`;
  });

  // Update the "Remove" buttons section
  document.getElementById("subject-buttons").innerHTML = removeButtons.join(" ");
}

function removeSubject(index) {
  // Remove the subject from the list (local only)
  subjectsList.splice(index, 1);

  // Update the displayed subjects list in the textarea
  const subjectTextarea = document.getElementById("subjects");
  subjectTextarea.value = subjectsList
    .map((s) => `${s.subjectName}: ${s.description}`)
    .join("\n");

  // Regenerate the "Remove" buttons after updating the subjects list
  generateRemoveButtons();
}

// Function to close the modal and clear the remove buttons
function closeModal() {
  const modal = document.getElementById("subject-modal"); // Assuming modal has this ID
  modal.style.display = "none"; // Hide the modal

  // Clear the "Remove" buttons when the modal is closed
  document.getElementById("subject-buttons").innerHTML = '';
  
  // Optionally, reset the subjects list if needed
  subjectsList = [];
  document.getElementById("subjects").value = ''; // Clear the textarea
}

// Example of how you might open and close the modal
document.getElementById("open-modal-button").addEventListener("click", () => {
  document.getElementById("subject-modal").style.display = "block"; // Show modal
});

document.getElementById("close-modal-button").addEventListener("click", closeModal);
