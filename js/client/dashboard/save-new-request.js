/**
 * Document Request Form Handler
 * 
 * This script handles the submission of new document requests from the user dashboard
 */
document.addEventListener('DOMContentLoaded', function() {
    const submitRequestForm = document.getElementById('submit-document-request-form');
    
    if (!submitRequestForm) return;
    
    submitRequestForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        try {
            // Get form values
            const documentType = document.getElementById('document-type').value;
            const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
            const amountToPay = document.getElementById('amount-to-pay').value;
            
            // Show loading state
            const submitButton = submitRequestForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Processing...';
            
            // Use API utility to send request
            const response = await createDocumentRequest(documentType, paymentMethod, amountToPay);
            
            // Handle response
            if (response.success) {
                showAlert('Document request submitted successfully!', 'success');
                
                // Reset form and reload dashboard data
                submitRequestForm.reset();
                document.getElementById('close-request-form').click();
                fetchDashboardData();
            } else {
                showAlert(response.message || 'Failed to submit document request', 'error');
            }
        } catch (error) {
            console.error('Error submitting document request:', error);
            showAlert('An error occurred while submitting your request', 'error');
        } finally {
            // Restore button state
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        }
    });
});