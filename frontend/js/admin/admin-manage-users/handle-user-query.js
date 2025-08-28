document.addEventListener("DOMContentLoaded", function () {
    const urlString = window.location.href;
    const url = new URL(urlString);
    const userId = url.searchParams.get("id");

    if (userId) {
        // Wait a short time to ensure all scripts have loaded
        setTimeout(function() {
            if (window.openUserModal) {
                window.openUserModal(userId);
            } else {
                console.error("openUserModal function not available");
            }
        }, 100);
    }
});