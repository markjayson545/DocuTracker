document.addEventListener('DOMContentLoaded', function () {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarMenu = document.getElementById('sidebar-menu');

    if (sidebarToggle && sidebarMenu) {
        sidebarToggle.addEventListener('click', function () {
            if (sidebarMenu.style.display === 'block') {
                sidebarMenu.style.display = 'none';
            } else {
                sidebarMenu.style.display = 'block';
            }
        });
    }

});