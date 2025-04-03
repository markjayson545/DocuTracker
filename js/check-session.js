document.addEventListener('DOMContentLoaded', function () {
    fetch('php/user-session/check-session.php')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.status == 'success') {
                if (data.data.is_verified == 1) {
                    window.location.href = 'user-dashboard.html';
                } else {
                    window.location.href = 'identity-verification.html';
                }
            }
        })
        .catch(error => {
            console.log(error);
        });
}
);