document.addEventListener('DOMContentLoaded', function() {
    const personalInfoForm = document.getElementById('personal-info-form');
    
    // Add event listener to the form
    personalInfoForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission
        
        // Create a FormData object from the form
        const formData = new FormData(personalInfoForm);
        
        // Send the form data to the server
        fetch('php/save-personal-info-contact-address.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Save response:', data);
            if (data.success == true) {
                // Data saved successfully
                console.log('Data saved successfully');
                // Proceed to the next step
                window.nextStep();
            } else {
                // Error saving data
                console.error('Error saving data:', data.error);
                alert('Error saving your information: ' + (data.error || 'Please try again'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while saving your information');
        });
    });
});