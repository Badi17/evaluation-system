// instructors.js

document.addEventListener('DOMContentLoaded', () => {
  const openPopup = document.getElementById("open-popup");
  const closePopup = document.getElementById("close-popup");
  const modal = document.getElementById("add-instructor-modal");
  const cancelBtn = document.getElementById("cancel-btn");

  // Open and close modal
  openPopup.addEventListener("click", () => {
    modal.style.display = "flex";
  });

  closePopup.addEventListener("click", () => {
    modal.style.display = "none";
  });

  cancelBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  });

  // Get all edit buttons and add event listeners
  const editButtons = document.querySelectorAll(".bx-edit");
  editButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      modal.style.display = "flex";
      document.querySelector(".modal-header h2").innerHTML =
        '<i class="bx bx-edit"></i> Edit Instructor';
      document.querySelector(".btn-add").textContent = "Save Changes";

      const instructorRow = event.target.closest("tr");
      const instructorData = {
        instructorId: instructorRow.cells[1].textContent,
        subjects: instructorRow.cells[2].textContent,
        name: instructorRow.cells[3].textContent,
        password: instructorRow.cells[4].textContent,
      };

      // Populate the form fields with instructor data
      document.getElementById("instructor-id").value = instructorData.instructorId;
      document.getElementById("instructor-name").value = instructorData.name;
      document.getElementById("instructor-password").value = instructorData.password;
      document.getElementById("subjects").value = instructorData.subjects;
    });
  });

  // Reset form and modal content for "Add Instructor"
  openPopup.addEventListener("click", () => {
    modal.style.display = "flex";
    document.querySelector(".modal-header h2").innerHTML =
      '<i class="bx bx-plus"></i> Add Instructor';
    document.querySelector(".btn-add").textContent = "Add";
    document.querySelector(".add-instructor-form").reset();
  });

  // Load instructors
  async function loadInstructors() {
    try {
      const response = await fetch('/api/instructors'); // Your API endpoint
      const instructors = await response.json();

      const tableBody = document.getElementById('instructors-table-body');
      tableBody.innerHTML = '';

      instructors.forEach((instructor, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${instructor.instructorId}</td>
          <td>${instructor.funame}</td>
          <td>${instructor.subjects}</td>
          <td>
            <i class="bx bx-show"></i>
            <i class="bx bx-edit"></i>
            <i class="bx bx-trash"></i>
          </td>
        `;
        tableBody.appendChild(row);
      });

      document.getElementById('table-footer').innerText = `Showing ${instructors.length} entries`;
    } catch (error) {
      console.error('Error loading instructors:', error);
    }
  }

  loadInstructors();
});
