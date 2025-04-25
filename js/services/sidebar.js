document.addEventListener('DOMContentLoaded', function () {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarMenu = document.getElementById('sidebar-menu');

    const userDashboardBtn = document.getElementById('user-dashboard-home-sidebar-btn');
    const requestsBtn = document.getElementById('request-history-sidebar-btn');
    const profileBtn = document.getElementById('profile-sidebar-btn');
    const settingsBtn = document.getElementById('settings-sidebar-btn');

    const adminDashboardBtn = document.getElementById('admin-dashboard-home');
    const adminManageApplicationsBtn = document.getElementById('admin-manage-applications-sidebar-btn');
    const adminManageRequestsBtn = document.getElementById('admin-manage-requests-sidebar-btn');
    const adminManageUsersBtn = document.getElementById('admin-manage-users-sidebar-btn');
    const adminProfileBtn = document.getElementById('admin-profile-sidebar-btn');
    const adminSettingsBtn = document.getElementById('admin-settings-sidebar-btn');


    // User Sidebar
    if (sidebarToggle && sidebarMenu) {
        sidebarToggle.addEventListener('click', function () {
            if (sidebarMenu.style.display === 'block') {
                sidebarMenu.style.display = 'none';
            } else {
                sidebarMenu.style.display = 'block';
            }
        });
    }

    if (userDashboardBtn) {
        userDashboardBtn.addEventListener('click', function () {
            window.location.href = 'user-dashboard.html';
        });
    }
    if (requestsBtn) {
        requestsBtn.addEventListener('click', function () {
            window.location.href = 'user-request-history.html';
        });
    }

    //TODO: Uncomment when profile and settings pages are available
    // if (profileBtn) {
    //     profileBtn.addEventListener('click', function () {
    //         window.location.href = '/profile';
    //     });
    // }
    // if (settingsBtn) {
    //     settingsBtn.addEventListener('click', function () {
    //         window.location.href = '/settings';
    //     });
    // }

    // Admin Sidebar
    if (adminDashboardBtn) {
        adminDashboardBtn.addEventListener('click', function () {
            window.location.href = 'admin-dashboard.html';
        });
    }
    if (adminManageApplicationsBtn) {
        adminManageApplicationsBtn.addEventListener('click', function () {
            window.location.href = 'admin-manage-applications.html';
        });
    }
    if (adminManageRequestsBtn) {
        adminManageRequestsBtn.addEventListener('click', function () {
            window.location.href = 'admin-manage-requests.html';
        });
    }
    if (adminManageUsersBtn) {
        adminManageUsersBtn.addEventListener('click', function () {
            window.location.href = 'admin-manage-users.html';
        });
    }

    // TODO: Uncomment when profile and settings pages are available
    // if (adminProfileBtn) {
    //     adminProfileBtn.addEventListener('click', function () {
    //         window.location.href = 'admin-profile.html';
    //     });
    // }
    // if (adminSettingsBtn) {
    //     adminSettingsBtn.addEventListener('click', function () {
    //         window.location.href = 'admin-settings.html';
    //     });
    // }

    

});