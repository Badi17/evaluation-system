document.addEventListener("DOMContentLoaded", function () {
    const saveButton = document.getElementById("saveButton");
    const cancelButton = document.getElementById("cancelButton");
    const criteriaSelect = document.getElementById("criteriaSelect");
    const questionInput = document.getElementById("questionInput");

    let editMode = false;
    let editQuestionId = null;

    saveButton.addEventListener("click", function () {
        const selectedCriteria = criteriaSelect.value;
        const questionText = questionInput.value;

        if (!selectedCriteria || !questionText) {
            alert("Please fill in both criteria and question.");
            return;
        }

        const url = editMode ? `/questionnaire/${editQuestionId}` : "/questionnaire"; // Fixed URL for PUT
        const method = editMode ? "PUT" : "POST";

        fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                criteria: selectedCriteria,
                question: questionText,
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(editMode ? "Question updated successfully." : "Question saved successfully.");
                questionInput.value = ""; // Clear input fields
                criteriaSelect.value = "";

                if (editMode) {
                    // Update the existing question in the DOM
                    const questionRow = document.querySelector(`.question-row[data-question-id="${editQuestionId}"]`);
                    const questionParagraph = questionRow.querySelector('p');
                    questionParagraph.textContent = questionText; // Update question text

                    // You can also update the criteria if necessary
                    questionRow.setAttribute('data-criteria-id', selectedCriteria);
                } else {
                    // Add a new question if it's not in edit mode
                    const newQuestionHTML = `
                        <div class="question-row" data-question-id="${data.questionId}" data-criteria-id="${selectedCriteria}">
                            <div class="action-icons">
                                <span class="icon edit-icon" title="Edit">&#x270E;</span>
                                <span class="icon delete-icon" title="Delete">&#x1F5D1;</span>
                                <span class="icon drag-icon" title="Drag">&#x21C5;</span>
                            </div>
                            <p>${questionText}</p>
                            <div class="rating-options">
                                ${[5, 4, 3, 2, 1].map(score => `
                                    <label>
                                        <input type="radio" name="question_${data.questionId}" value="${score}">
                                        ${score}
                                    </label>
                                `).join('')}
                            </div>
                        </div>`;
                    const criteriaSection = document.querySelector(`.criteria-section[data-criteria-id="${selectedCriteria}"]`);
                    criteriaSection.querySelector('.question-row').insertAdjacentHTML('beforeend', newQuestionHTML);
                }

                // Reset edit mode
                editMode = false;
                editQuestionId = null;
            } else {
                alert("Failed to save the question.");
            }
        })
        .catch(error => console.error("Error:", error));
    });

    cancelButton.addEventListener("click", function () {
        questionInput.value = "";
        criteriaSelect.value = "";
        editMode = false;
        editQuestionId = null;
    });

    // Edit and Delete Logic
    const editIcons = document.querySelectorAll('.edit-icon');
    const deleteIcons = document.querySelectorAll('.delete-icon');

    editIcons.forEach(icon => {
        icon.addEventListener('click', function () {
            const questionRow = icon.closest('.question-row');
            const questionText = questionRow.querySelector('p').textContent;
            const questionId = questionRow.dataset.questionId;
            const criteriaId = questionRow.dataset.criteriaId;

            questionInput.value = questionText;
            criteriaSelect.value = criteriaId;

            editMode = true;
            editQuestionId = questionId;
        });
    });

    deleteIcons.forEach(icon => {
        icon.addEventListener('click', function () {
            if (!confirm("Are you sure you want to delete this question?")) return;

            const questionRow = icon.closest('.question-row');
            const questionId = questionRow.dataset.questionId;

            fetch(`/questionnaire/${questionId}`, { 
                method: "DELETE",
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Question deleted successfully.");
                    questionRow.remove(); // Remove the question row from the DOM
                } else {
                    alert("Failed to delete the question.");
                }
            })
            .catch(error => console.error("Error:", error));
        });
    });
});
