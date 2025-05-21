document.addEventListener('DOMContentLoaded', function () {
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');

    const personalDetailsForm = document.getElementById('personal-info-form');
    const updatePasswordForm = document.getElementById('password-form');

    const currentPasswordInput = document.getElementById('current-password');
    const passwordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');

    const passwordValidationMessage = document.querySelectorAll('.validation-message');
    const changePasswordBtn = document.getElementById('change-password-btn');


    function fetchUsernameEmailPhone() {
        const formData = new FormData();
        formData.append('action', 'getUserInfo');
        fetch('php/client/user-settings/fetch-user-settings.php', {
            method: 'POST',
            body: formData
        }).then(response => response.json())
            .then(data => {
                console.log(data);
                const userInfo = data.data;
                if (data.status === 'success') {
                    usernameInput.value = userInfo.username;
                    emailInput.value = userInfo.email;
                    phoneInput.value = userInfo.phone;
                }
                else {
                    console.error('Error fetching user settings:', data.message);
                }
            }).catch(error => {
                console.error('Error fetching user settings:', error);
            });
    }

    personalDetailsForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const formData = new FormData(personalDetailsForm);
        let password = prompt('Please enter your password to confirm changes:');
        formData.append('password', password);
        formData.append('action', 'updateUserInfo');
        if (password === null || password === '') {
            alert('Password is required to confirm changes.');
            return;
        }
        if (password.length < 8) {
            alert('Password must be at least 8 characters long.');
            return;
        }
        fetch('php/client/user-settings/handle-settings-actions.php', {
            method: 'POST',
            body: formData
        }).then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.success) {
                    const message = data.message;
                    alert(message);
                    fetchUsernameEmailPhone();
                } else {
                    alert('Error: ' + data.message);
                }
            }).catch(error => {
                console.error('Error updating user settings:', error);
                alert('An error occurred while updating user settings. Please try again later.');
            });
    });

    function validatePasswords() {
        if (passwordInput.value !== confirmPasswordInput.value) {
            passwordValidationMessage.forEach(message => {
                message.style.display = 'block';
                message.textContent = 'Passwords do not match';
                message.style.color = 'red';
                changePasswordBtn.disabled = true;
            });
        } else {
            passwordValidationMessage.forEach(message => {
                message.style.display = 'none';
                message.textContent = '';
                message.style.color = 'green';
                changePasswordBtn.disabled = false;
            });
        }
    }

    passwordInput.addEventListener('input', validatePasswords);
    confirmPasswordInput.addEventListener('input', validatePasswords);

    updatePasswordForm.addEventListener('submit', function (event) {
        event.preventDefault();
        
        const formData = new FormData(updatePasswordForm);
        formData.append('action', 'updateUserPassword');
        
        if (!passwordInput.value || !confirmPasswordInput.value) {
            alert('Please fill in all fields.');
            return;
        } else if (passwordInput.value.length < 8) {
            alert('Password must be at least 8 characters long.');
            return;
        } 
        formData.append('current_password', currentPasswordInput.value);
        formData.append('new_password', passwordInput.value);
        formData.append('confirm_password', confirmPasswordInput.value);

        fetch('php/client/user-settings/handle-settings-actions.php', {
            method: 'POST',
            body: formData
        }).then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.success) {
                    const message = data.message;
                    alert(message);
                    updatePasswordForm.reset();
                } else {
                    alert(data.message);
                }
            })
    });

    fetchUsernameEmailPhone();
    // TODO: Fetch user settings from the server and populate the input fields
    // TODO: Add event listeners to the input fields to update the user settings on change
    // TODO: Implement IdentityVerification Documents, It should fetch the documents uploaded by the user.
    // TODO: Optionally, implement session management settings
    // TODO: Optionally implement the download all data button

});