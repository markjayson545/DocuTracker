document.addEventListener("DOMContentLoaded", function() {
    // Select elements with the correct IDs from the upload section
    const fileInput = document.getElementById('document-file');
    const fileNameDisplay = document.getElementById('upload-file-name');
    const fileSizeDisplay = document.getElementById('upload-file-size');
    const fileIconContainer = document.querySelector('.preview-file .file-icon-container');
    const previewContainer = document.getElementById('upload-preview-container');
    const previewImage = document.getElementById('upload-preview-image');
    let fileIcon = fileIconContainer.querySelector('i');
    
    if (!fileInput) return;
    
    fileInput.addEventListener('change', function(e) {
        if (this.files && this.files.length > 0) {
            const file = this.files[0];
            
            // Update file name display
            fileNameDisplay.textContent = file.name;
            
            // Update file size display - using utility function
            fileSizeDisplay.textContent = AdminRequestUtils.formatFileSize(file.size);
            
            // For image files, show preview and hide icon
            if (file.type.match('image.*')) {
                // Hide the icon and show preview
                if (fileIcon) fileIcon.style.display = 'none';
                
                // Make sure container is visible
                previewContainer.style.display = 'block';
                previewImage.style.display = 'block';
                
                // Read and display the image
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewImage.src = e.target.result;
                };
                reader.readAsDataURL(file);
            } else {
                // For non-image files, update the icon and hide preview
                if (fileIcon) fileIcon.style.display = 'inline-block';
                updateFileIcon(file);
                previewContainer.style.display = 'none';
                previewImage.style.display = 'none';
            }
        } else {
            // Reset to default when no file is selected
            fileNameDisplay.textContent = 'No file chosen';
            fileSizeDisplay.textContent = '0 KB';
            
            // Show default icon, hide preview
            if (fileIcon) {
                fileIcon.className = 'fas fa-file-upload';
                fileIcon.style.display = 'inline-block';
            } else {
                fileIconContainer.innerHTML = '<i class="fas fa-file-upload"></i>';
                fileIcon = fileIconContainer.querySelector('i');
            }
            
            previewContainer.style.display = 'none';
            previewImage.style.display = 'none';
        }
    });
    
    function updateFileIcon(file) {
        // Use the utility function to get the appropriate icon class
        let iconClass = AdminRequestUtils.getFileIconClass(file);
        
        // Update the icon
        if (fileIcon) {
            fileIcon.className = iconClass;
        } else {
            fileIconContainer.innerHTML = `<i class="${iconClass}"></i>`;
            fileIcon = fileIconContainer.querySelector('i');
        }
    }
});
