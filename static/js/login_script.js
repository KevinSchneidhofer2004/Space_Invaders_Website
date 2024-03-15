document.addEventListener('DOMContentLoaded', function () {
    const loginTitle = document.getElementById('loginTitle');
    const emailHelp = document.getElementById('emailHelp');
    const submitButton = document.getElementById('submitButton');
    const pills = document.querySelectorAll(".nav-link");
    const loginForm = document.getElementById('loginForm');

    loginForm.action = '/login';

    document.getElementById('tab-login').click();

    pills.forEach(pill => {
        pill.addEventListener("click", function () {
            pills.forEach(p => p.classList.remove("active"));
            this.classList.add("active");
            
            if (this.id === "tab-login") {
                loginTitle.textContent = 'Login';
                emailHelp.hidden = false;
                submitButton.textContent = 'Login';
                loginForm.action = '/login';
            } else if (this.id === "tab-register") {
                loginTitle.textContent = 'New Account';
                emailHelp.hidden = true;
                submitButton.textContent = 'Register';
                loginForm.action = '/register';
            }

        });
    });

});