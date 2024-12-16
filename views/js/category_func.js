let currentPage = 1;
let rowsPerPage = 5; // Default number of rows per page
let totalCategories = 0; // This will store the total number of categories
let allCategories = []; // This will hold all categories data
let originalCategories = []; // This will store the unfiltered, original category list

// Fetch categories and store them in the global variables
function fetchCategories() {
    fetch("/section/list")
        .then(response => {
            if (!response.ok) {
                throw new Error("Error fetching categories");
            }
            return response.json();
        })
        .then(data => {
            originalCategories = data; // Store the original data
            allCategories = [...originalCategories]; // Initialize allCategories with the original data
            totalCategories = allCategories.length;
            displayPage(currentPage); // Initially display the first page
        })
        .catch(error => {
            console.error("Error fetching categories:", error);
            alert(error.message);
        });
}

// Display a specific page of categories
function displayPage(page) {
    const tbody = document.querySelector("tbody");
    tbody.innerHTML = ""; // Clear current content

    // Calculate start and end indices for the current page
    const start = (page - 1) * rowsPerPage;
    const end = Math.min(start + rowsPerPage, totalCategories);

    for (let i = start; i < end; i++) {
        const category = allCategories[i];
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${i + 1}</td>
            <td>${category.category_name} - ${category.category_description}</td>
            <td>
                <button class="btn-icon btn-edit" data-id="${category.category_id}">
                    <i class="bx bx-edit-alt"></i>
                </button>
                <button class="btn-icon btn-delete" data-id="${category.category_id}">
                    <i class="bx bx-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    }

    // Update pagination info
    document.getElementById("pagination-info").textContent =
        `Showing ${start + 1} to ${end} of ${totalCategories} entries`;

    // Disable or enable buttons based on the current page
    document.getElementById("prev-button").disabled = page === 1;
    document.getElementById("next-button").disabled = end === totalCategories;
}

// Event listener for pagination buttons
document.getElementById("prev-button").addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        displayPage(currentPage);
    }
});

document.getElementById("next-button").addEventListener("click", () => {
    if (currentPage * rowsPerPage < totalCategories) {
        currentPage++;
        displayPage(currentPage);
    }
});

// Change rows per page dynamically
document.getElementById("entries-count").addEventListener("change", function () {
    rowsPerPage = parseInt(this.value, 10);
    currentPage = 1; // Reset to first page whenever rows per page changes
    displayPage(currentPage);
});

// Search functionality
document.getElementById("search").addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase();

    if (searchTerm) {
        // Filter based on search term
        allCategories = originalCategories.filter(category => 
            category.category_name.toLowerCase().includes(searchTerm) || 
            category.category_description.toLowerCase().includes(searchTerm)
        );
    } else {
        // Reset to the original categories list if search input is cleared
        allCategories = [...originalCategories];
    }

    totalCategories = allCategories.length;
    currentPage = 1; // Reset to the first page after search or reset
    displayPage(currentPage);
});

// Handle form submission for saving a new category
document.getElementById("categoryForm").addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent the default form submission

    const categoryName = document.getElementById("category-name").value;
    const categoryDescription = document.getElementById("category-description").value;

    fetch("/section", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            category_name: categoryName,
            category_description: categoryDescription,
        }),
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || 'Error occurred');
            });
        }
        return response.json();
    })
    .then(data => {
        alert("Category saved successfully!");
        // Clear the form inputs
        document.getElementById("category-name").value = '';
        document.getElementById("category-description").value = '';
        fetchCategories(); // Fetch and display updated categories
    })
    .catch(error => {
        console.error("Error saving category:", error);
        alert(error.message); // Show the error message
    });
});

// Fetch categories on initial load
fetchCategories(); // Load categories when the page is first rendered

// Event listener for edit buttons
document.addEventListener("click", function (e) {
    if (e.target.closest(".btn-edit")) {
        const button = e.target.closest(".btn-edit");
        const categoryId = button.getAttribute("data-id");
        const row = button.closest("tr");
        const categoryName = row.querySelector("td:nth-child(2)").innerText.split(" - ")[0]; // Get name
        const categoryDescription = row.querySelector("td:nth-child(2)").innerText.split(" - ")[1]; // Get description

        // Fill modal fields
        document.getElementById("edit-category-id").value = categoryId;
        document.getElementById("edit-category-name").value = categoryName;
        document.getElementById("edit-category-description").value = categoryDescription;

        // Show the modal
        document.getElementById("editModal").style.display = "block";
    }
});

// Close modal
document.getElementById("closeModal").onclick = function() {
    document.getElementById("editModal").style.display = "none";
};

// Cancel button action
document.getElementById("cancelEdit").onclick = function() {
    document.getElementById("editModal").style.display = "none";
};

// Handle form submission for updating category
document.getElementById("editCategoryForm").addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent the default form submission

    const categoryId = document.getElementById("edit-category-id").value;
    const categoryName = document.getElementById("edit-category-name").value;
    const categoryDescription = document.getElementById("edit-category-description").value;

    fetch(`/section/${categoryId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            category_name: categoryName,
            category_description: categoryDescription,
        }),
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || 'Error occurred');
            });
        }
        return response.json(); 
    })
    .then(data => {
        alert("Category updated successfully!");
        fetchCategories(); // Refresh the categories list
        document.getElementById("editModal").style.display = "none"; // Close the modal
    })
    .catch(error => {
        console.error("Error updating category:", error);
        alert(error.message); // Show error message
    });
});
