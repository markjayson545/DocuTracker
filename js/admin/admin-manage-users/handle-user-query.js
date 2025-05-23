document.addEventListener("DOMContentLoaded", function () {
    const urlString = window.location.href;
    const url = new URL(urlString);
    const userId = url.searchParams.get("id");

    if (userId) {
        openUserModal(userId);
    }

});