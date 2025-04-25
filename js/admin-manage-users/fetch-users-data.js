document.addEventListener("DOMContentLoaded", function () {
    const totalUsersValue = document.getElementById("total-users-value");
    const activeUsersValue = document.getElementById("active-users-value");
    const pendingVerificationValue = document.getElementById("pending-verification-value");
    const suspendedUsersValue = document.getElementById("suspended-users-value");
    const verifiedUsersValue = document.getElementById("verified-users-value");

    const userTableBody = document.getElementById("user-table-body");

    function parseDate(dateString) {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
    function insertUserRow(userId, fName, lName, email, role, status, isVerified, createdAt) {
        let icon = 'fa-check-circle verified-icon';

        if (!isVerified) {
            icon = 'fa-clock pending-icon';
        }

        let rowTemplate = `
                                <tr>
                                    <td>USR-${userId}</td>
                                    <td>${fName} ${lName}</td>
                                    <td>${email}</td>
                                    <td><span class="role-badge role-${role}">${role}</span></td>
                                    <td><span class="status-badge status-${status}">${status}</span></td>
                                    <td><i class="fas ${icon}"></i></td>
                                    <td>${parseDate(createdAt)}</td>
                                    <td class="actions-cell">
                                        <button class="action-icon-btn" title="Edit User"><i class="fas fa-edit"></i></button>
                                        <button class="action-icon-btn" title="View User"><i class="fas fa-eye"></i></button>
                                    </td>
                                </tr>
        `;
        userTableBody.innerHTML += rowTemplate;
    }

    function fetchUsersData() {
        fetch('php/fetch-admin-user-manage.php')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.success){
                totalUsersValue.innerText = data.totalUsers;
                activeUsersValue.innerText = data.totalActiveUsers;
                pendingVerificationValue.innerText = data.totalPendingVerificationUsers;
                suspendedUsersValue.innerText = data.totalSuspendedUsers;
                verifiedUsersValue.innerText = data.totalVerifiedUsers;

                userTableBody.innerHTML = '';
                data.users.forEach(user => {
                    const userId = user.user_id;
                    const fName = user.first_name;
                    const lName = user.last_name;
                    const email = user.email;
                    const role = user.role;
                    const status = user.status;
                    const isVerified = user.is_verified;
                    const createdAt = user.created_at;

                    insertUserRow(userId, fName, lName, email, role, status, isVerified, createdAt);
                });
            }
        });
    }

    fetchUsersData();
    setInterval(fetchUsersData, 60000);

});