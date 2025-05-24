document.addEventListener('DOMContentLoaded', function () {
    console.log('Sidebar script loaded');
    
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarMenu = document.getElementById('sidebar-menu');

    const userDashboardBtn = document.getElementById('dashboard-home-sidebar-btn');
    const requestsBtn = document.getElementById('request-history-sidebar-btn');
    const profileBtn = document.getElementById('profile-sidebar-btn');
    const settingsBtn = document.getElementById('settings-sidebar-btn');

    const adminDashboardBtn = document.getElementById('admin-dashboard-home');
    const adminManageApplicationsBtn = document.getElementById('admin-manage-applications-sidebar-btn');
    const adminManageRequestsBtn = document.getElementById('admin-manage-requests-sidebar-btn');
    const adminManageUsersBtn = document.getElementById('admin-manage-users-sidebar-btn');
    const adminReportsBtn = document.getElementById('admin-reports-btn');
    const adminProfileBtn = document.getElementById('admin-profile-sidebar-btn');
    const adminSettingsBtn = document.getElementById('admin-settings-sidebar-btn');

    // Debug: Check if buttons are found
    console.log('Admin Dashboard button found:', !!adminDashboardBtn);
    console.log('Admin Manage Applications button found:', !!adminManageApplicationsBtn);
    console.log('Admin Manage Requests button found:', !!adminManageRequestsBtn);
    console.log('Admin Manage Users button found:', !!adminManageUsersBtn);
    console.log('Admin Reports button found:', !!adminReportsBtn);
    console.log('Admin Settings button found:', !!adminSettingsBtn);


    // User Sidebar
    if (sidebarToggle && sidebarMenu) {
        sidebarToggle.addEventListener('click', function (e) {
            e.preventDefault();
            if (sidebarMenu.style.display === 'block') {
                sidebarMenu.style.display = 'none';
            } else {
                sidebarMenu.style.display = 'block';
            }
        });
    }

    if (userDashboardBtn) {
        userDashboardBtn.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.href = 'user-dashboard.html';
        });
    }
    if (requestsBtn) {
        requestsBtn.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.href = 'user-request-history.html';
        });
    }
    if (profileBtn) {
        profileBtn.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.href = 'user-profile.html';
        });
    }
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.href = 'user-settings.html';
        });
    }

    // Admin Sidebar
    if (adminDashboardBtn) {
        adminDashboardBtn.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.href = 'admin-dashboard.html';
        });
    }
    if (adminManageApplicationsBtn) {
        adminManageApplicationsBtn.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.href = 'admin-manage-applications.html';
        });
    }
    if (adminManageRequestsBtn) {
        adminManageRequestsBtn.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.href = 'admin-manage-requests.html';
        });
    }
    if (adminManageUsersBtn) {
        adminManageUsersBtn.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.href = 'admin-manage-users.html';
        });
    }
    
    // Make sure the Reports button works properly
    if (adminReportsBtn) {
        console.log('Adding click event to Reports button');
        adminReportsBtn.addEventListener('click', function (e) {
            e.preventDefault();
            console.log('Reports button clicked');
            window.location.href = 'admin-reports.html';
        });
    } else {
        console.error('Reports button not found in the DOM');
    }
    
    if (adminProfileBtn) {
        adminProfileBtn.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.href = 'admin-user-profile.html';
        });
    }
    if (adminSettingsBtn) {
        adminSettingsBtn.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.href = 'admin-settings.html';
        });
    }

    

});