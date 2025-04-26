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
    // Verify the document belongs to the user
    $stmt = $conn->prepare("SELECT document_path FROM Application WHERE user_id = ? AND document_path = ?");
    $stmt->bind_param("is", $userId, $requestedPath);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        // Document doesn't exist or doesn't belong to user
        header('HTTP/1.0 404 Not Found');
        echo "Document not found";
        exit;
    }
    
    // Document exists and belongs to user - serve it
    $document = $result->fetch_assoc();
    $filePath = $document['document_path'];
    
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
    
    $stmt->close();
    $conn->close();
    
} catch (\Throwable $th) {
    writeLog("Error viewing document: " . $th->getMessage(), "document-view.log");
    header('HTTP/1.0 500 Internal Server Error');
    echo "Error retrieving document";
    exit;
}
