document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');

    const systemMessage = document.getElementById('system-message');
    const systemMessageIcon = document.getElementById('system-message-icon');
    const systemMessageTitle = document.getElementById('system-message-title');
    const systemMessageText = document.getElementById('system-message-content');

    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const formData = new FormData(loginForm);
        fetch('php/auth/validate-user.php', {
            method: 'POST',
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                console.log(data.data);
                if (data.success == true && data.data.role === 'client') {
                    systemMessage.style.display = 'flex';
                    systemMessageTitle.innerText = 'Success';
                    systemMessageText.innerText = data.message;
                    systemMessage.style.backgroundColor = 'var(--success-color-light)';
                    systemMessageIcon.classList.remove('fa-circle-check');
                    systemMessageIcon.style.color = 'var(--success-color)';
                    systemMessageIcon.classList.add('fa-circle-check');
                    setTimeout(() => {
                        if (data.data.is_verified == 1) {
                            window.location.href = 'user-dashboard.html';
                        } else {
                            window.location.href = 'identity-verification.html';
                        }
                    }, 2000);
                } else if (data.success == true && data.data.role === 'admin') {
                    systemMessage.style.display = 'flex';
                    systemMessageTitle.innerText = 'Success';
                    systemMessageText.innerText = data.message + 'Admin mode';
                    systemMessage.style.backgroundColor = 'var(--success-color-light)';
                    systemMessageIcon.classList.remove('fa-circle-check');
                    systemMessageIcon.style.color = 'var(--success-color)';
                    systemMessageIcon.classList.add('fa-circle-check');
                    setTimeout(() => {
                        window.location.href = 'admin-dashboard.html';
                    }, 2000);
                }
                else {
                    systemMessage.style.display = 'flex';
                    systemMessage.style.backgroundColor = 'var(--error-color-light)';
                    systemMessageIcon.classList.remove('fa-circle-exclamation');
                    systemMessageIcon.style.color = 'var(--error-color)';
                    systemMessageIcon.classList.add('fa-circle-exclamation');
                    systemMessageTitle.innerText = 'Error';
                    systemMessageTitle.style.color = 'var(--error-color)';
                    systemMessageText.innerText = data.message;
                }
            }).catch(error => {
                console.log(error);
            })
            ;

    });

});