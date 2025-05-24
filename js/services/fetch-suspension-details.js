document.addEventListener('DOMContentLoaded', function () {
    const suspensionDate = document.getElementById('suspension-date');
    const suspensionReason = document.getElementById('suspension-reason');

    fetch('php/services/get-suspension.php')
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if (data.status === 'success') {
            suspensionDate.textContent = data.data.created_at || 'N/A';
            suspensionReason.textContent = data.data.message || 'N/A';
        } else {
            suspensionDate.textContent = 'Error fetching data';
            suspensionReason.textContent = 'Error fetching data';
        }
    })
});