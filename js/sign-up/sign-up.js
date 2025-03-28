document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('signup-form');
    const formGroups = document.querySelectorAll('.form-group');
    const messageDiv = document.getElementById('message');

    // Add animation class to each form group with delay
    formGroups.forEach((group, index) => {
        setTimeout(() => {
            group.classList.add('animate');
        }, 100 * index);
    });

    // Form submission using AJAX
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const submitBtn = document.querySelector('.submit-btn');
        submitBtn.classList.add('loading');
        
        // Create form data object
        const formData = new FormData(form);
        
        // Send AJAX request
        fetch('create-user.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            submitBtn.classList.remove('loading');
            
            // Display appropriate message
            messageDiv.style.display = 'block';
            
            if (data.success) {
                messageDiv.style.backgroundColor = '#d4edda';
                messageDiv.style.color = '#155724';
                messageDiv.textContent = '✅ ' + data.message;
                
                // Reset form on success
                form.reset();
            } else {
                messageDiv.style.backgroundColor = '#f8d7da';
                messageDiv.style.color = '#721c24';
                messageDiv.textContent = '❌ ' + data.message;
                
                // Highlight specific field based on error message
                const errorMsg = data.message.toLowerCase();
                if (errorMsg.includes('username')) {
                    highlightField('username');
                } else if (errorMsg.includes('email')) {
                    highlightField('email');
                } else if (errorMsg.includes('phone')) {
                    highlightField('phone');
                }
            }
            
            // Scroll to message
            messageDiv.scrollIntoView({ behavior: 'smooth' });
            
            // Hide message after 5 seconds
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        })
        .catch(error => {
            submitBtn.classList.remove('loading');
            messageDiv.style.display = 'block';
            messageDiv.style.backgroundColor = '#f8d7da';
            messageDiv.style.color = '#721c24';
            messageDiv.textContent = '❌ An error occurred. Please try again.';
            console.error('Error:', error);
        });
    });
    
    // Function to highlight field with error
    function highlightField(fieldName) {
        const field = document.querySelector(`[name="${fieldName}"]`);
        if (field) {
            field.style.borderColor = '#dc3545';
            field.style.boxShadow = '0 0 0 0.2rem rgba(220, 53, 69, 0.25)';
            
            // Remove highlighting after user starts typing
            field.addEventListener('input', function() {
                this.style.borderColor = '';
                this.style.boxShadow = '';
            }, { once: true });
        }
    }
    
    // Password visibility toggle
    const toggleButtons = document.querySelectorAll('.toggle-password');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            
            // Toggle icon between eye and eye-slash
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    });
});
