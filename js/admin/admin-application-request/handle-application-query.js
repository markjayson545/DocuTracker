document.addEventListener("DOMContentLoaded", function () {
    const urlString = window.location.href;
    const url = new URL(urlString);
    const applicationId = url.searchParams.get("id") ?? null;

    async function openApplicationDetails(appId) {
        const applicationDetails = await fetchApplicationDetails(appId);
        openUserProfileModal(applicationDetails);
    }

    if (applicationId) {
        openApplicationDetails(applicationId);
    }

});