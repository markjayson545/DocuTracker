document.addEventListener('DOMContentLoaded', function () {
    const loginButton = document.getElementsByClassName('login-or-create');
    const userInfo = document.getElementsByClassName('user-info');
    const userName = document.getElementsByClassName('user-name');
    const userEmail = document.getElementsByClassName('user-email');
    const dashboardLink = document.getElementById('dashboard-link');
    const verificationStatus = document.getElementById('verification-status');

    window.getUserInfo = function() {
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
                    
                    // Handle verification status
                    if (data.data.verification_status) {
                        updateVerificationUI(data.data.verification_status);
                    }
                } else {
                    // User is not logged in
                    loginButton[0].style.display = 'flex';
                    userInfo[0].style.display = 'none';
                    userName[0].innerHTML = '';
                    userEmail[0].innerHTML = '';

                    userEmail[1].innerHTML = '';
                    userName[1].innerHTML = '';
                }
            })
            .catch(error => {
                console.log(error);
            });
    }
    
    // Function to update UI based on verification status
    function updateVerificationUI(status) {
        if (!dashboardLink) return;
        
        if (status === 'unverified') {
            dashboardLink.innerHTML = '<i class="fas fa-exclamation-circle"></i> Complete Verification';
            dashboardLink.href = 'verification.html';
            
            if (verificationStatus) {
                verificationStatus.innerHTML = 'Account needs verification';
                verificationStatus.className = 'verification-status unverified';
                verificationStatus.style.display = 'block';
            }
        } else if (status === 'processing') {
            dashboardLink.innerHTML = '<i class="fas fa-clock"></i> Verification in Progress';
            dashboardLink.href = 'verification-status.html';
            
            if (verificationStatus) {
                verificationStatus.innerHTML = 'Verification in progress';
                verificationStatus.className = 'verification-status processing';
                verificationStatus.style.display = 'block';
            }
        } else if (status === 'verified') {
            dashboardLink.innerHTML = '<i class="fas fa-tachometer-alt"></i> Dashboard';
            dashboardLink.href = 'user-dashboard.html';
            
            if (verificationStatus) {
                verificationStatus.style.display = 'none';
            }
        }
    }

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
                
                // Handle verification status
                if (data.data.verification_status) {
                    updateVerificationUI(data.data.verification_status);
                }
                
                // Add event listener to logout button
                const logoutButton = document.getElementById('logout-button');
                if (logoutButton) {
                    logoutButton.addEventListener('click', function() {
                        window.location.href = 'php/logout.php';
                    });
                }
            } else {
                // User is not logged in
                loginButton[0].style.display = 'flex';
                userInfo[0].style.display = 'none';
                userName[0].innerHTML = '';
                userEmail[0].innerHTML = '';

                userEmail[1].innerHTML = '';
                userName[1].innerHTML = '';
            }
        })
        .catch(error => {
            console.log(error);
        });
});