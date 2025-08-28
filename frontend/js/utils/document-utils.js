/**
 * Document Utilities
 * Contains global utility functions for the DocuTracker application
 */

// Format a date string to a localized format
window.parseDate = function(dateString) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

// Capitalize a string and replace hyphens with spaces
window.capitalize = function(string) {
    if (!string) return '';
    string = string.replace(/-/g, ' ');
    return string.charAt(0).toUpperCase() + string.slice(1);
};

// Get the appropriate Font Awesome icon class based on file extension
window.getFileIconClass = function(fileExt) {
    // Default icon
    let iconClass = 'fa-file';
    
    // Map file extensions to Font Awesome icons
    switch (fileExt.toLowerCase()) {
        // Images
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'bmp':
        case 'svg':
        case 'webp':
            iconClass = 'fa-file-image';
            break;
        // Documents
        case 'pdf':
            iconClass = 'fa-file-pdf';
            break;
        case 'doc':
        case 'docx':
            iconClass = 'fa-file-word';
            break;
        case 'xls':
        case 'xlsx':
        case 'csv':
            iconClass = 'fa-file-excel';
            break;
        case 'ppt':
        case 'pptx':
            iconClass = 'fa-file-powerpoint';
            break;
        case 'txt':
            iconClass = 'fa-file-alt';
            break;
        // Archives
        case 'zip':
        case 'rar':
        case '7z':
        case 'tar':
        case 'gz':
            iconClass = 'fa-file-archive';
            break;
        // Code
        case 'html':
        case 'htm':
        case 'css':
        case 'js':
        case 'php':
        case 'py':
        case 'java':
        case 'c':
        case 'cpp':
            iconClass = 'fa-file-code';
            break;
        // Audio
        case 'mp3':
        case 'wav':
        case 'ogg':
        case 'flac':
        case 'm4a':
            iconClass = 'fa-file-audio';
            break;
        // Video
        case 'mp4':
        case 'avi':
        case 'mov':
        case 'wmv':
        case 'flv':
        case 'mkv':
        case 'webm':
            iconClass = 'fa-file-video';
            break;
        // Default already set
    }
    
    return iconClass;
};

// Get file color based on file extension (useful for document icons)
window.getFileColor = function(fileExt) {
    switch (fileExt.toLowerCase()) {
        case 'pdf':
            return '#dc3545'; // red
        case 'doc':
        case 'docx':
            return '#0d6efd'; // blue
        case 'xls':
        case 'xlsx':
        case 'csv':
            return '#198754'; // green
        case 'ppt':
        case 'pptx':
            return '#fd7e14'; // orange
        case 'txt':
            return '#212529'; // dark
        case 'zip':
        case 'rar':
        case '7z':
        case 'tar':
        case 'gz':
            return '#6610f2'; // purple
        default:
            return '#6c757d'; // gray
    }
};
