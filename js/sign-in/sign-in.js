document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');

    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const formData = new FormData(loginForm);


        fetch('php/validate-user.php', {
            method: 'POST',
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                console.log(data.data);
                if (data.success == true) {
                    alert('Login successful');
                }
                else {
                    alert('Invalid username or password');
                }
            }).catch(error => {
                console.log(error);
            })
            ;

    });

});