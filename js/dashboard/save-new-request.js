document.addEventListener('DOMContentLoaded', function() {
    const submitRequestForm = document.getElementById('submit-document-request-form');
    
    submitRequestForm.addEventListener('submit', function(event){
        event.preventDefault();

        const formData = new FormData(submitRequestForm);
        
        fetch('php/create-new-doc-request.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Save response:', data);
            if (data.status == 'success') {
                alert('Request submitted successfully!');
            } else{
                alert('Error: ' + data.stack_trace);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while submitting the request. Please try again.');
        })
        ;

    });

});