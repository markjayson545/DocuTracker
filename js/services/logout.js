document.addEventListener('DOMContentLoaded', function () {
    const logoutButton = document.getElementById('logout-button');

    // Add event listener to logout button
    logoutButton.addEventListener('click', function () {
        // Send a request to the server to log out the user
        fetch('php/auth/logout.php', {
            method: 'POST', // Using POST instead of GET for logout actions
            credentials: 'same-origin' // Include cookies in the request
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                // Redirect regardless of the response to ensure logout
                window.location.href = 'index.html';
            })
            .catch(error => {
                console.error('Logout error:', error);
                // Still redirect even if there's an error
                window.location.href = 'index.html';
            });
    });
});