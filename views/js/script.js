// LOGIN JAVASCRIPT
const container = document.querySelector(".container"),
  pwShowHide = document.querySelectorAll(".showHidePw"),
  pwFields = document.querySelectorAll(".password"),
  login = document.querySelector(".login-link");

// JS code to show/hide password and change icon
pwShowHide.forEach((eyeIcon) => {
  eyeIcon.addEventListener("click", () => {
    pwFields.forEach((pwField) => {
      // Toggle the password type
      const isPassword = pwField.type === "password";
      pwField.type = isPassword ? "text" : "password";

      // Change the eye icon based on the password visibility
      eyeIcon.classList.toggle("uil-eye-slash", !isPassword);
      eyeIcon.classList.toggle("uil-eye", isPassword);
    });
  });
});

// JS code to appear login form

login.addEventListener("click", (e) => {
  e.preventDefault();
  container.classList.remove("active");
});



