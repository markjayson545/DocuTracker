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
            const maxSize = 20 * 1024 * 1024; // 5MB in bytes
            
            if (fileSize > maxSize) {
                alert("File size should be less than 20MB");
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
        
        // Check if this is an additional document upload requested by admin
        const isAdditionalDocRequest = document.querySelector('.admin-notes') !== null;
        if (isAdditionalDocRequest) {
            formData.append('is_additional_document', '1');
        }
        
        // Show loading state
        const submitButton = uploadForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
        submitButton.disabled = true;
        
        fetch('php/client/identity-verification/upload-verification-document.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // If this was for additional documents requested by admin
                if (isAdditionalDocRequest) {
                    window.showNotification("Additional document uploaded successfully!", "success");
                    setTimeout(() => {
                        window.location.reload(); // Reload to show updated status
                    }, 1500);
                } else {
                    // Show success and move to processing stage
                    showProcessingStatus(data);
                }
            } else {
                // Show error
                window.showNotification("Error: " + data.message, "error");
                // Reset button
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            window.showNotification("An error occurred. Please try again.", "error");
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

    // Fetch and display all uploaded documents
    function fetchUploadedDocuments() {
        fetch('php/client/identity-verification/get-uploaded-documents.php')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    renderDocumentsTable(data.documents);
                }
            });
    }

    function renderDocumentsTable(documents) {
        const tableBody = document.querySelector('#documents-table tbody');
        if (!tableBody) return;
        tableBody.innerHTML = '';
        if (!documents.length) {
            tableBody.innerHTML = '<tr><td colspan="5">No documents uploaded yet.</td></tr>';
            return;
        }
        documents.forEach(doc => {
            const fileExt = doc.document_path.split('.').pop().toLowerCase();
            let previewHtml = '';
            if (["jpg","jpeg","png"].includes(fileExt)) {
                previewHtml = `<img src="php/client/identity-verification/view-document.php?path=${encodeURIComponent(doc.document_path)}" style="max-width:60px;max-height:60px;">`;
            } else if (fileExt === 'pdf') {
                previewHtml = `<a href="php/client/identity-verification/view-document.php?path=${encodeURIComponent(doc.document_path)}" target="_blank"><i class='fas fa-file-pdf'></i> View</a>`;
            }
            tableBody.innerHTML += `
                <tr data-document-id="${doc.document_id}" data-document-path="${doc.document_path}" data-document-type="${doc.document_type}">
                    <td>${doc.document_type}</td>
                    <td>${previewHtml}</td>
                    <td>${new Date(doc.created_at).toLocaleString()}</td>
                    <td>
                        <button class="view-document-btn">View</button>
                        <button class="delete-document-btn">Delete</button>
                        <button class="update-document-btn">Update</button>
                    </td>
                </tr>
            `;
        });
        attachDocumentActionListeners();
    }

    function attachDocumentActionListeners() {
        document.querySelectorAll('.view-document-btn').forEach(btn => {
            btn.onclick = function() {
                const row = btn.closest('tr');
                const docPath = row.getAttribute('data-document-path');
                const docType = row.getAttribute('data-document-type');
                showExistingDocument(docType, docPath);
            };
        });
        document.querySelectorAll('.delete-document-btn').forEach(btn => {
            btn.onclick = function() {
                const row = btn.closest('tr');
                const docId = row.getAttribute('data-document-id');
                if (confirm('Delete this document?')) {
                    fetch('php/client/identity-verification/delete-document.php', {
                        method: 'POST',
                        headers: { },
                        body: new URLSearchParams({ document_id: docId })
                    })
                    .then(r => r.json())
                    .then(data => {
                        if (data.status === 'success') fetchUploadedDocuments();
                        else alert(data.message);
                    });
                }
            };
        });
        document.querySelectorAll('.update-document-btn').forEach(btn => {
            btn.onclick = function() {
                const row = btn.closest('tr');
                const docId = row.getAttribute('data-document-id');
                // Show file input dialog for update
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = '.jpg,.jpeg,.png,.pdf';
                fileInput.onchange = function() {
                    if (!fileInput.files.length) return;
                    const formData = new FormData();
                    formData.append('document_id', docId);
                    formData.append('document_type', row.children[0].textContent);
                    formData.append('verification-document', fileInput.files[0]);
                    fetch('php/client/identity-verification/update-document.php', {
                        method: 'POST',
                        body: formData
                    })
                    .then(r => r.json())
                    .then(data => {
                        if (data.status === 'success') fetchUploadedDocuments();
                        else alert(data.message);
                    });
                };
                fileInput.click();
            };
        });
    }

    // Add a function to refresh document list after upload/delete
    function refreshDocumentList() {
        // Fetch updated document list
        fetchUploadedDocuments();
        
        // If we're on the processing step, refresh application status
        if (window.applicationState && window.applicationState.processingStarted) {
            window.checkExistingApplication().then(result => {
                // Update status display without changing the current view
                // This ensures we get fresh data about admin feedback
            });
        }
    }

    // Initial fetch
    fetchUploadedDocuments();
});
