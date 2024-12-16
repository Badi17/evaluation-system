$(document).ready(function () {
  // Load users into the table
  function loadUsers() {
    $.ajax({
      url: '/users/list',
      method: 'GET',
      success: function (users) {
        let rows = '';
        users.forEach((user, index) => {
          rows += `
            <tr data-id="${user.id}">
              <td>${index + 1}</td>
              <td>${user.name}</td>
              <td>${user.username}</td>
              <td>
                <button class="edit-btn"><i class="bx bxs-edit"></i></button>
                <button class="delete-btn"><i class="bx bxs-trash"></i></button>
              </td>
            </tr>`;
        });
        $('tbody').html(rows);
      }
    });
  }

  loadUsers(); // Initial load

  // Show the new user modal when the button is clicked
  $('.new-user-btn').click(function () {
    $('#newUserModal').show();
  });

  // Close the modals when the close button is clicked
  $('.close').click(function () {
    $(this).closest('.modal').hide();
  });

  // Add user
  $('#newUserForm').submit(function (e) {
    e.preventDefault();
    const formData = $(this).serialize();

    $.ajax({
      url: '/users',
      method: 'POST',
      data: formData,
      success: function (newUser) {
        alert('User successfully added!');

        const newRow = `
          <tr data-id="${newUser.id}">
            <td>${$('tbody tr').length + 1}</td>
            <td>${newUser.name}</td>
            <td>${newUser.username}</td>
            <td>
              <button class="edit-btn"><i class="bx bxs-edit"></i></button>
              <button class="delete-btn"><i class="bx bxs-trash"></i></button>
            </td>
          </tr>`;
          
        $('tbody').append(newRow);
        $('#newUserForm')[0].reset();
        $('#newUserModal').hide();
      }
    });
  });

// Edit user
$(document).on('click', '.edit-btn', function () {
  const id = $(this).closest('tr').data('id');

  // Fetch the user data and fill the form
  $.get(`/users/${id}`, function (user) {
    $('#editUserId').val(user.id);
    $('#editName').val(user.name);
    $('#editUsername').val(user.username);
    $('#editUserModal').show(); // Show the edit modal
  }).fail(function() {
    alert("Error: Could not fetch user data.");
  });
});

  // Save edited user
  $('#editUserForm').submit(function (e) {
    e.preventDefault();
    const id = $('#editUserId').val();
    const formData = $(this).serialize();

    $.ajax({
      url: `/users/${id}`,
      method: 'PUT',
      data: formData,
      success: function (updatedUser) {
        alert('User successfully updated!');

        const row = $(`tr[data-id="${updatedUser.id}"]`);
        row.find('td:nth-child(2)').text(updatedUser.name);
        row.find('td:nth-child(3)').text(updatedUser.username);

        $('#editUserModal').hide();
      },
      error: function () {
        alert('Error updating user. Please try again.');
      }
    });
  });

  // Delete user
// Delete user using event delegation
$(document).on('click', '.delete-btn', function () {
  const id = $(this).closest('tr').data('id');

  if (confirm('Are you sure you want to delete this user?')) {
    $.ajax({
      url: `/users/${id}`,
      method: 'DELETE',
      success: function () {
        alert('User successfully deleted!');
        $(`tr[data-id="${id}"]`).remove(); // Remove the row from the table
      },
      error: function () {
        alert('Error deleting user. Please try again.');
      }
    });
  }
});

  // Search users dynamically
  $('#search').on('input', function () {
    const query = $(this).val().toLowerCase();

    $('tbody tr').each(function () {
      const name = $(this).find('td:nth-child(2)').text().toLowerCase();
      const username = $(this).find('td:nth-child(3)').text().toLowerCase();

      if (name.includes(query) || username.includes(query)) {
        $(this).show();
      } else {
        $(this).hide();
      }
    });
  });
});
