    document.addEventListener("DOMContentLoaded", function () {
    const openPopup = document.getElementById("open-popup");
    const closePopup = document.getElementById("close-popup");
    const modal = document.getElementById("add-subject-modal");
    const cancelBtn = document.getElementById("cancel-btn");
  
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
  
    // Get all edit buttons
    const editButtons = document.querySelectorAll(".bx-edit");
  
    // Loop through all edit buttons and add event listeners
    editButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        // Open modal
        modal.style.display = "flex";
  
        // Change modal title and button text to "Edit Subject"
        document.querySelector(".modal-header h2").innerHTML =
          '<i class="bx bx-edit"></i> Edit Subject';
        document.querySelector(".btn-add").textContent = "Save Changes";
  
        const subjectRow = event.target.closest("tr"); // Get the parent row of the clicked button
        const subjectData = {
          subjectId: subjectRow.cells[1].textContent,
          name: subjectRow.cells[2].textContent,
          unit: subjectRow.cells[3].textContent,
          time: subjectRow.cells[4].textContent,
          type: subjectRow.cells[5].textContent,
        };
  
        // Populate the form fields with existing subject data
        document.getElementById("subject-id").value = subjectData.subjectId;
        document.getElementById("isLab").value = subjectData.isLab;
        document.getElementById("subject-name").value = subjectData.name;
        document.getElementById("unit").value = subjectData.unit;
        document.getElementById("time").value = subjectData.time;
      });
    });
  
    // Reset form and modal content when the Add button is clicked
    openPopup.addEventListener("click", () => {
      modal.style.display = "flex";
  
      // Change modal title and button text back to "Add Subject"
      document.querySelector(".modal-header h2").innerHTML =
        '<i class="bx bx-plus"></i> Add Subject';
      document.querySelector(".btn-add").textContent = "Add";
  
      // Clear form fields
      document.querySelector(".add-subject-form").reset();
    });
  
    // Function to load subjects from the server
    async function loadSubjects() {
        try {
          const response = await fetch("/api/subjects");
          const subjects = await response.json();
    
          const tableBody = document.getElementById("subject-table-body");
          tableBody.innerHTML = "";
    
          subjects.forEach((subject, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
              <td>${index + 1}</td>
              <td>${subject.subjectId}</td>
              <td>${subject.subjectName}</td>
              <td>${subject.description}</td>
              <td>${subject.unit}</td>
              <td>${subject.isLab}</td>
              <td>${subject.time}</td>
              <td>${subject.day}</td>
              <td>
                <i class="bx bx-show"></i>
                <i class="bx bx-edit"></i>
                <i class="bx bx-trash"></i>
              </td>
            `;
            tableBody.appendChild(row);
          });
    
          document.getElementById("table-footer").innerText = `Showing ${subjects.length} entries`;
        } catch (error) {
          console.error("Error loading subjects:", error);
        }
      }
    
      // Call loadSubjects on page load
      loadSubjects();
    });