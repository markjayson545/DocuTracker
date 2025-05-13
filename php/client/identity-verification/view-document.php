<?php
require __DIR__ . '/../../services/open-db.php';
include __DIR__ . '/../../services/logger.php';
session_start();

// Security check
if (!isset($_SESSION['user_id'])) {
    header('HTTP/1.0 403 Forbidden');
    echo "Access Denied";
    exit;
}

$userId = $_SESSION['user_id'];

// Get requested document path
if (!isset($_GET['path'])) {
    header('HTTP/1.0 400 Bad Request');
    echo "No document specified";
    exit;
}

$requestedPath = $_GET['path'];

try {
    // Check if the document belongs to the user in ApplicationDocuments
    $stmt = $conn->prepare("SELECT ad.document_path FROM ApplicationDocuments ad JOIN Application a ON ad.application_id = a.application_id WHERE ad.document_path = ? AND a.user_id = ?");
    $stmt->bind_param("si", $requestedPath, $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        // Document doesn't exist or doesn't belong to user
        header('HTTP/1.0 404 Not Found');
        echo "Document not found";
        exit;
    }
    
    // Document exists and belongs to user - serve it
    $filePath = $result->fetch_assoc()['document_path'];
    $stmt->close();
    
    // Check if file exists
    if (!file_exists($filePath)) {
        header('HTTP/1.0 404 Not Found');
        echo "Document file not found";
        exit;
    }
    
    // Get file info and set appropriate headers
    $fileInfo = pathinfo($filePath);
    $extension = strtolower($fileInfo['extension']);
    
    switch ($extension) {
        case 'pdf':
            header('Content-Type: application/pdf');
            break;
        case 'jpg':
        case 'jpeg':
            header('Content-Type: image/jpeg');
            break;
        case 'png':
            header('Content-Type: image/png');
            break;
        default:
            header('Content-Type: application/octet-stream');
    }
    
    header('Content-Disposition: inline; filename="' . basename($filePath) . '"');
    header('Content-Length: ' . filesize($filePath));
    
    // Output the file
    readfile($filePath);
    
    $conn->close();
    
} catch (\Throwable $th) {
    writeLog("Error viewing document: " . $th->getMessage(), "document-view.log");
    header('HTTP/1.0 500 Internal Server Error');
    echo "Error retrieving document";
    exit;
}
