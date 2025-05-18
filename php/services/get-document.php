<?php

require 'open-db.php';
include 'logger.php';
session_start();
try {
    $userId = $_SESSION['user_id'] ?? null;
    $role = $_SESSION['role'] ?? null;

    if (!isset($_SESSION['user_id'])) {
        throw new Exception('User not logged in');
    }
    if ($role !== 'admin') {
        writeLog("Unauthorized access attempt by user ID: $userId", "admin-dashboard.log");
        throw new Exception("Unauthorized access");
    }

    // Check for both parameter names to ensure compatibility
    $filePath = $_POST['file_path'] ?? $_POST['document_path'] ?? null;
    
    // Validate file path
    if (!$filePath) {
        throw new Exception('No file path provided');
    }
    
    // Security check: Ensure the file is within allowed directories
    // Adjust the base path as needed for your application
    $basePath = realpath(__DIR__ . '/../../userfiles/');
    $requestedFile = realpath($filePath);
    
    if (!$requestedFile || strpos($requestedFile, $basePath) !== 0) {
        writeLog("Attempted access to unauthorized file: $filePath by user ID: $userId", "admin-dashboard.log");
        throw new Exception('Invalid file path');
    }
    
    // Check if file exists and is readable
    if (!file_exists($requestedFile) || !is_readable($requestedFile)) {
        throw new Exception('File does not exist or is not readable');
    }
    
    // Get file information
    $fileInfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($fileInfo, $requestedFile);
    finfo_close($fileInfo);
    
    // Get file size
    $fileSize = filesize($requestedFile);
    
    // Set appropriate headers
    header('Content-Type: ' . $mimeType);
    header('Content-Length: ' . $fileSize);
    header('Cache-Control: private, max-age=0, must-revalidate');
    header('Content-Disposition: inline; filename="' . basename($requestedFile) . '"');
    
    // Make sure no content has been output before sending the file
    if (ob_get_level()) ob_end_clean();
    
    // Output the file content
    readfile($requestedFile);
    exit; // Stop execution after sending file
    
} catch (\Throwable $th) {
    // Clear any output before sending error response
    if (ob_get_level()) ob_end_clean();
    
    header('Content-Type: application/json');
    writeLog("Error in get-document.php: " . $th->getMessage(), "admin-dashboard.log");
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while fetching the document.',
        'error' => $th->getMessage()
    ]);
} finally {
    mysqli_close($conn);
}
