document.addEventListener("DOMContentLoaded", function () {
    const urlString = window.location.href;
    const url = new URL(urlString);
    const reqId = url.searchParams.get("id") ?? null;
    const userId = url.searchParams.get("userId") ?? null;


    async function openRequestDetails(reqId, userId) {
        AdminRequestUtils.getRequestDetails(reqId, (userId, reqId) => {
            currentUserId = userId;
            currentReqId = reqId;
        });
    }

    if (reqId && userId) {
        openRequestDetails(reqId, userId);
    }

});