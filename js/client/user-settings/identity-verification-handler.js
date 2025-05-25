document.addEventListener('DOMContentLoaded', function () {
    // Initialize document list
    populateDocumentList();
    // Add event listener for the "Add Document" button

    const form = document.getElementById('addDocumentForm');

    form.addEventListener('submit', function (e) {
        e.preventDefault(); // Prevent default form submission
        submitDocument(); // Call the function to handle document submission
    });

    // Add event listener for file input changes
    document.getElementById('verification-document').addEventListener('change', handleFileChange);
});

// Modal functionality
function openAddDocumentModal() {
    document.getElementById('addDocumentModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

let documents = null;
let currentDocument = null; // Store the current document for download

function populateDocumentList() {
    const documentList = document.getElementById('verification-documents');
    // Fetch document data from server
    fetch('php/services/get-verification-documents.php')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            documents = data.documents;

            documentList.innerHTML = ''; // Clear existing list

            if (data.documents.length === 0) {
                documentList.innerHTML = `
                    <li class="no-documents">
                        <div class="no-documents-icon">
                            <i class="fas fa-file-alt"></i>
                        </div>
                        <div class="no-documents-text">
                            <h4>No Documents Uploaded</h4>
                            <p>You have not uploaded any documents for verification.</p>
                        </div>
                    </li>
                `;
            }

            data.documents.forEach(doc => {
                const rowTemplate = `
                                <li>
                                    <div class="document-info">
                                        <div class="document-icon">
                                            <i class="fas fa-id-card"></i>
                                        </div>
                                        <div class="document-details">
                                            <h4>${doc.document_type
                        .replace(/-/g, ' ')
                        .split(' ')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')}</h4>
                                            <p>Date Uploaded: ${doc.created_at}</p>
                                        </div>
                                    </div>
                                    <div class="document-actions">
                                        <button class="btn btn-primary btn-sm" onclick="viewDocument(${doc.document_id})">
                                            <i class="fas fa-eye"></i> View
                                        </button>
                                    </div>
                                </li>
                    `;
                documentList.insertAdjacentHTML('beforeend', rowTemplate);
            });

        });
}

async function viewDocument(documentId) {
    // Check if documents are loaded
    if (!documents) {
        alert('Documents not loaded yet. Please try again later.');
        return;
    }

    const doc = documents.find(d => d.document_id === documentId);

    if (!doc) {
        alert('Document not found');
        return;
    }

    console.log(doc);

    // Store current document for download functionality
    currentDocument = doc;
    let fileSize = '';
    
    // Get file extension from document path
    const fileExtension = doc.document_path ? doc.document_path.split('.').pop().toLowerCase() : '';
    const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension);
    const isPdf = fileExtension === 'pdf';

    if (doc.document_path) {
        const formData = new FormData();
        formData.append('file_path', doc.document_path);
        await fetch('php/services/get-document.php', {
            method: 'POST',
            body: formData
        }).then(response => response.blob())
            .then(blob => {
                const url = URL.createObjectURL(blob);
                // Get file size from blob
                fileSize = formatFileSize(blob.size);
                
                // Handle different file types
                const documentImage = document.getElementById('documentImage');
                const documentPlaceholder = document.getElementById('documentPlaceholder');
                
                if (isImage && blob.type.startsWith('image/')) {
                    // Display the image
                    documentImage.src = url;
                    documentImage.style.display = 'block';
                    documentPlaceholder.style.display = 'none';
                } else if (isPdf && blob.type === 'application/pdf') {
                    // Show PDF icon with option to open
                    documentImage.style.display = 'none';
                    documentPlaceholder.style.display = 'flex';
                    documentPlaceholder.innerHTML = `
                        <div class="pdf-preview document-type-preview">
                            <i class="fas fa-file-pdf"></i>
                            <p>PDF Document</p>
                            <a href="${url}" target="_blank" class="btn btn-primary btn-sm">Open PDF</a>
                        </div>
                    `;
                } else {
                    // Generic file type that can't be previewed
                    documentImage.style.display = 'none';
                    documentPlaceholder.style.display = 'flex';
                    documentPlaceholder.innerHTML = `
                        <div class="file-preview document-type-preview">
                            <i class="fas fa-file-alt"></i>
                            <p>This document type (${fileExtension.toUpperCase()}) cannot be previewed</p>
                            <p class="preview-hint">You can still download this file</p>
                        </div>
                    `;
                }
            })
            .catch(error => {
                console.error('Error fetching document:', error);
                // Show error placeholder if document loading fails
                document.getElementById('documentImage').style.display = 'none';
                document.getElementById('documentPlaceholder').style.display = 'flex';
                document.getElementById('documentPlaceholder').innerHTML = `
                    <div class="error-preview document-type-preview">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Error loading document</p>
                        <p class="preview-hint">The document could not be loaded</p>
                    </div>
                `;
            });
    } else {
        // If no document path, show placeholder
        document.getElementById('documentImage').style.display = 'none';
        document.getElementById('documentPlaceholder').style.display = 'flex';
        document.getElementById('documentPlaceholder').innerHTML = `
            <div class="missing-preview document-type-preview">
                <i class="fas fa-file-slash"></i>
                <p>Document not available</p>
                <p class="preview-hint">The document path is missing</p>
            </div>
        `;
    }

    document.getElementById('modalDocumentType').textContent = doc.document_type
        .replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    document.getElementById('modalUploadDate').textContent = doc.created_at;
    document.getElementById('modalFileSize').textContent = fileSize || 'N/A';
    document.getElementById('documentViewModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    document.body.style.overflow = 'auto';
}

function downloadDocument() {
    if (!currentDocument || !currentDocument.document_path) {
        alert('No document available for download');
        return;
    }

    const formData = new FormData();
    formData.append('file_path', currentDocument.document_path);

    fetch('php/services/get-document.php', {
        method: 'POST',
        body: formData
    })
        .then(response => response.blob())
        .then(blob => {
            // Create a temporary download link
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            // Determine file extension from MIME type or use default
            let fileExtension = '';
            if (blob.type.includes('pdf')) {
                fileExtension = '.pdf';
            } else if (blob.type.includes('image/jpeg') || blob.type.includes('image/jpg')) {
                fileExtension = '.jpg';
            } else if (blob.type.includes('image/png')) {
                fileExtension = '.png';
            } else {
                fileExtension = '.doc';
            }

            // Set filename for download
            const documentType = currentDocument.document_type.replace(/-/g, '_');
            a.download = `${documentType}${fileExtension}`;

            // Trigger download
            document.body.appendChild(a);
            a.click();

            // Clean up
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
        })
        .catch(error => {
            console.error('Error downloading document:', error);
            alert('Failed to download document. Please try again later.');
        });
}


function submitDocument() {
    const form = document.getElementById('addDocumentForm');
    const formData = new FormData(form);
    
    // Get the values from the form
    const documentType = document.getElementById('documentType').value;
    const fileInput = document.getElementById('verification-document');
    
    // Make sure we have the necessary data
    if (!documentType || fileInput.files.length === 0) {
        alert('Please select a document type and upload a file');
        return;
    }
    
    // Rename form parameters to match what the PHP script expects
    formData.set('document-type', documentType);
    
    fetch('php/client/identity-verification/upload-verification-document.php', {
        method: 'POST',
        body: formData
    }).then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Document uploaded successfully');
                closeModal('addDocumentModal');
                populateDocumentList();
                removeFile();
            } else {
                alert('Error uploading document: ' + data.message);
            }
        }).catch(error => {
            console.error('Error uploading document:', error);
            alert('Failed to upload document. Please try again later.');
        });
}

function removeFile() {
    document.getElementById('verification-document').value = '';
    document.getElementById('uploadedFiles').style.display = 'none';
    document.getElementById('documentPreview').style.display = 'none';
}

// File upload handling - update to match the correct ID
function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileSize').textContent = formatFileSize(file.size);
        document.getElementById('uploadedFiles').style.display = 'block';
        
        // Add preview functionality
        previewFile(file);
    }
}

// Add a function to preview the file
function previewFile(file) {
    const preview = document.getElementById('documentPreview');
    const reader = new FileReader();
    
    reader.onloadend = function() {
        if (file.type.startsWith('image/')) {
            // If it's an image, show the image preview
            preview.innerHTML = `<img src="${reader.result}" alt="Document preview" class="document-preview-image">`;
            preview.style.display = 'block';
        } else if (file.type === 'application/pdf') {
            // If it's a PDF, show a PDF icon
            preview.innerHTML = `
                <div class="pdf-preview">
                    <i class="fas fa-file-pdf"></i>
                    <p>PDF Document</p>
                </div>`;
            preview.style.display = 'block';
        } else {
            // For other file types, show generic file icon
            preview.innerHTML = `
                <div class="file-preview">
                    <i class="fas fa-file"></i>
                    <p>Document File</p>
                </div>`;
            preview.style.display = 'block';
        }
    }
    
    if (file) {
        reader.readAsDataURL(file);
    }
}

// Document type selection handling
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('documentType').addEventListener('change', function (e) {
        const otherGroup = document.getElementById('otherDocumentTypeGroup');
        if (e.target.value === 'other') {
            otherGroup.style.display = 'block';
            document.getElementById('otherDocumentType').required = true;
        } else {
            otherGroup.style.display = 'none';
            document.getElementById('otherDocumentType').required = false;
        }
    });
    
    // Add event listener for the file input
    document.getElementById('verification-document').addEventListener('change', handleFileChange);
});

// Drag and drop functionality
document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.querySelector('.file-upload-area');
    
    if (uploadArea) {
        uploadArea.addEventListener('dragover', function (e) {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', function (e) {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', function (e) {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                document.getElementById('verification-document').files = files;
                handleFileChange({target: {files: files}});
            }
        });
        
        uploadArea.addEventListener('click', function() {
            document.getElementById('verification-document').click();
        });
    }
});

// Helper function to format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Close modal when clicking outside
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});