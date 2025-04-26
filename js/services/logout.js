document.addEventListener('DOMContentLoaded', function () {
    const logoutButton = document.getElementById('logout-button');

    // Add event listener to logout button
    logoutButton.addEventListener('click', function () {
        // Send a request to the server to log out the user
        fetch('php/auth/logout.php')
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.success == true) {
                    // User logged out successfully
                    window.location.href = 'index.html';
                } else {
                    // Error logging out
                    alert('Error logging out: ' + data.message);
                }
            })
            .catch(error => {
                console.log(error);
            });
    });
}
);