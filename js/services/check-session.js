document.addEventListener('DOMContentLoaded', function () {
    const loginButton = document.getElementsByClassName('login-or-create');
    const userInfo = document.getElementsByClassName('user-info');
    const userName = document.getElementsByClassName('user-name');
    const userEmail = document.getElementsByClassName('user-email');

    // Fetch user information from the server
    fetch('php/check-session.php')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.status === 'success') {
                // User is logged in
                loginButton[0].style.display = 'none';
                userInfo[0].style.display = 'flex';
                userName[0].innerHTML = data.data.username;
                userEmail[0].innerHTML = data.data.email;

                userEmail[1].innerHTML = data.data.email;
                userName[1].innerHTML = data.data.username;
                // Add event listener to logout button
            } else {
                // User is not logged in
                loginButton[0].style.display = 'flex';
                userInfo[0].style.display = 'none';
                userName[0].innerHTML = '';
                userEmail[0].innerHTML = '';

                userEmail[1].innerHTML = '';
                userName[1].innerHTML = '';
                // Remove event listener from logout button
                // loginButton[0].removeEventListener('click', logout); 
            }
        })
        .catch(error => {
            console.log(error);
        });
});