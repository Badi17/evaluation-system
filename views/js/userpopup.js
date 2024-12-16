document.addEventListener("DOMContentLoaded", function () {
    // Ensure both modals are hidden on page load
    const newUserModal = document.getElementById("newUserModal");
    const editUserModal = document.getElementById("editUserModal");

    newUserModal.style.display = "none";
    editUserModal.style.display = "none";

    // Get the button that opens the new user modal
    const newUserBtn = document.querySelector(".new-user-btn");

    // Get the <span> element that closes the modal for both new user and edit user modals
    const closeBtns = document.querySelectorAll(".close");

    // Get the cancel buttons for both modals
    const cancelBtns = document.querySelectorAll(".cancel-btn");

    // When the user clicks the new user button, open the new user modal
    newUserBtn.onclick = function () {
        newUserModal.style.display = "flex"; // Display the modal when the button is clicked
    };

    // Close modals when clicking on <span> (x) or cancel buttons
    closeBtns.forEach((span) => {
        span.onclick = function () {
            newUserModal.style.display = "none"; // Hide new user modal
            editUserModal.style.display = "none"; // Hide edit user modal
        };
    });

    cancelBtns.forEach((btn) => {
        btn.onclick = function () {
            newUserModal.style.display = "none"; // Hide new user modal
            editUserModal.style.display = "none"; // Hide edit user modal
        };
    });

    // Close the modal when clicking outside of it
    window.onclick = function (event) {
        if (event.target == newUserModal || event.target == editUserModal) {
            newUserModal.style.display = "none";
            editUserModal.style.display = "none";
        }
    };

    // Handle the edit user modal open when clicking edit buttons
    document.querySelectorAll('.edit-btn').forEach((editBtn) => {
        editBtn.addEventListener('click', function () {
            const row = this.closest('tr');
            const userId = row.children[0].innerText;
            const userName = row.children[1].innerText;
            const userUsername = row.children[2].innerText;

            // Pre-fill the form with user data
            document.getElementById('editUserId').value = userId;
            document.getElementById('editName').value = userName;
            document.getElementById('editUsername').value = userUsername;

            // Open edit modal
            editUserModal.style.display = 'flex'; // Use 'flex' for proper display
        });
    });
    

    // Handle form submission (for edit user form)
    const editUserForm = document.getElementById('editUserForm');
    editUserForm.onsubmit = function (e) {
        e.preventDefault();

        const data = {
            id: document.getElementById('editUserId').value,
            name: document.getElementById('editName').value,
            username: document.getElementById('editUsername').value,
            password: document.getElementById('editPassword').value,
        };

        // Handle form submission logic (e.g., via AJAX or form submission)
        console.log('Updated user data:', data);

        // Close the modal after submission
        editUserModal.style.display = 'none';
    };
});
