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

    $filePath = $_POST['file_path'] ?? $_POST['document_path'] ?? null;
    
    // Validate file path
    if (!$filePath) {
        throw new Exception('No file path provided');
    }
    
    // Security check: Ensure the file is within allowed directories
    $basePath = realpath(__DIR__ . '/../../userfiles/');
    $requestedFile = realpath($filePath);
    
    if (!$requestedFile || strpos($requestedFile, $basePath) !== 0) {
        writeLog("Attempted access to unauthorized file: $filePath by user ID: $userId", "security.log");
        throw new Exception('Invalid file path');
    }
    
    // Authorization check based on role
    if ($role === 'admin') {
        // Admin can access any file within the base path
    } else {
        // Client can only access their own files
        $userFilePath = $basePath . '/' . $userId . '/';
        
        // Check if the requested file belongs to the current user
        if (strpos($requestedFile, $userFilePath) !== 0) {
            writeLog("User ID: $userId attempted to access unauthorized file: $filePath", "security.log");
            throw new Exception('Unauthorized access to this file');
        }
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
    
    // Output the file content
    readfile($requestedFile);
    exit; // Stop execution after sending file
    
} catch (\Throwable $th) {
    writeLog("Error in get-document.php: " . $th->getMessage(), "get-document.log");
    http_response_code(403); // Forbidden or error
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while fetching the document.',
        'error' => $th->getMessage()
    ]);
} finally {
    mysqli_close($conn);
}
