document.addEventListener('DOMContentLoaded', function () {

    const userMenuContainer = document.getElementById('user-info');
    const userMenuDropdown = document.getElementById('user-dropdown');

    function toggle() {
        if(userMenuDropdown.style.display.match('none')){
            userMenuDropdown.style.display = 'flex';
        } else {
            userMenuDropdown.style.display = 'none';
        }
    }

    userMenuContainer.addEventListener('click', function () {
        toggle();
    });

});