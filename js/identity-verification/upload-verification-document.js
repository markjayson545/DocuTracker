document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.getElementById('upload-verification-form');
    const documentTypeSelect = document.getElementById('document-type');
    const verificationDocumentInput = document.getElementById('verification-document');
    const backButton = document.getElementById('back-button');
    
    // Add preview container reference
    const previewContainer = document.getElementById('document-preview-container');

    // Handle going back to personal details form
    if (backButton) {
        backButton.addEventListener('click', function(e) {
            e.preventDefault();
            // Use the global function from identity-verification.js
            if (window.previousStep) {
                window.previousStep();
            }
        });
    }

    // Add file preview handler
    if (verificationDocumentInput) {
        verificationDocumentInput.addEventListener('change', function() {
            showFilePreview(this.files[0]);
        });
    }

    // Add form submission handler
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate form
            if (!validateForm()) {
                return false;
            }
            
            // Submit form via AJAX
            uploadDocument();
        });
    }
    
    // Form validation
    function validateForm() {
        let isValid = true;
        
        // Check if document type is selected
        if (documentTypeSelect.value === "") {
            alert("Please select a document type");
            isValid = false;
        }
        
        // Check if a file is selected
        if (verificationDocumentInput.files.length === 0) {
            alert("Please select a file to upload");
            isValid = false;
        } else {
            // Check file extension
            const fileName = verificationDocumentInput.files[0].name;
            const fileExt = fileName.split('.').pop().toLowerCase();
            const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf'];
            
            if (!allowedExtensions.includes(fileExt)) {
                alert("Only JPG, JPEG, PNG & PDF files are allowed");
                isValid = false;
            }
            
            // Check file size (5MB max)
            const fileSize = verificationDocumentInput.files[0].size;
            const maxSize = 5 * 1024 * 1024; // 5MB in bytes
            
            if (fileSize > maxSize) {
                alert("File size should be less than 5MB");
                isValid = false;
            }
        }
        
        return isValid;
    }
    
    // Show file preview function
    function showFilePreview(file) {
        if (!file) return;
        
        // Clear previous preview
        if (previewContainer) {
            previewContainer.innerHTML = '';
            previewContainer.style.display = 'block';
        }
        
        const fileName = file.name;
        const fileExt = fileName.split('.').pop().toLowerCase();
        
        // Create preview header
        const previewHeader = document.createElement('h4');
        previewHeader.textContent = 'Document Preview';
        previewContainer.appendChild(previewHeader);
        
        if (['jpg', 'jpeg', 'png'].includes(fileExt)) {
            // Image preview
            const img = document.createElement('img');
            img.classList.add('document-preview-img');
            img.file = file;
            previewContainer.appendChild(img);
            
            // Use FileReader to load the image
            const reader = new FileReader();
            reader.onload = (function(aImg) { 
                return function(e) { 
                    aImg.src = e.target.result; 
                }; 
            })(img);
            reader.readAsDataURL(file);
        } else if (fileExt === 'pdf') {
            // PDF preview (icon and filename)
            const pdfPreview = document.createElement('div');
            pdfPreview.classList.add('pdf-preview');
            
            const pdfIcon = document.createElement('i');
            pdfIcon.className = 'fas fa-file-pdf';
            
            const pdfName = document.createElement('p');
            pdfName.textContent = fileName;
            
            pdfPreview.appendChild(pdfIcon);
            pdfPreview.appendChild(pdfName);
            previewContainer.appendChild(pdfPreview);
        }
        
        // Add file info
        const fileInfo = document.createElement('div');
        fileInfo.classList.add('file-info');
        
        const fileNameElem = document.createElement('p');
        fileNameElem.innerHTML = `<strong>Name:</strong> ${fileName}`;
        
        const fileTypeElem = document.createElement('p');
        fileTypeElem.innerHTML = `<strong>Type:</strong> ${file.type}`;
        
        const fileSizeElem = document.createElement('p');
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        fileSizeElem.innerHTML = `<strong>Size:</strong> ${fileSizeMB} MB`;
        
        fileInfo.appendChild(fileNameElem);
        fileInfo.appendChild(fileTypeElem);
        fileInfo.appendChild(fileSizeElem);
        previewContainer.appendChild(fileInfo);
    }
    
    // Handle document upload
    function uploadDocument() {
        const formData = new FormData(uploadForm);
        
        // Add a flag to indicate if this is an update to an existing application
        const isUpdate = document.querySelector('.processing-status').style.display === 'block';
        if (isUpdate) {
            formData.append('is_update', '1');
        }
        
        // Show loading state
        const submitButton = uploadForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
        submitButton.disabled = true;
        
        fetch('php/upload-verification-document.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // If updating an existing document
                if (isUpdate) {
                    alert("Document updated successfully!");
                    window.location.reload(); // Reload to show updated status
                } else {
                    // Show success and move to processing stage
                    showProcessingStatus(data);
                }
            } else {
                // Show error
                alert("Error: " + data.message);
                // Reset button
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert("An error occurred. Please try again.");
            // Reset button
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
        });
    }
    
    // Show processing status with application details
    function showProcessingStatus(data) {
        // Update application details
        document.getElementById('application-id').textContent = data.application_id || 'Pending';
        document.getElementById('application-date').textContent = data.submission_date || new Date().toLocaleDateString();
        document.getElementById('application-status').textContent = 'Under Review';
        
        // Use the global function from identity-verification.js if available
        if (window.goToProcessingStep) {
            window.goToProcessingStep();
        }
    }
});
