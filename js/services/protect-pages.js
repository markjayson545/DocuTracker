document.addEventListener('DOMContentLoaded', function () {
    const page =
        fetch('php/check-session.php')
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.status === 'success') {
                    // User is logged in
                    protectedElements.forEach(element => {
                        element.style.display = 'block';
                    });
                } else {
                    // User is not logged in - redirect to error page
                    window.location.href = 'error-login-required.html';
                }
            })
            .catch(error => {
                console.log(error);
                // On error, also redirect to error page
                window.location.href = 'error-login-required.html';
            });
});