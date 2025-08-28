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
    
    // Remove admin-only restriction
    // Allow any logged-in user to access their files
    
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
        writeLog("Attempted access to unauthorized file: $filePath by user ID: $userId", "security.log");
        throw new Exception('Invalid file path');
    }
    
    // Enhanced file ownership detection with multiple approaches
    $relativePath = str_replace($basePath, '', $requestedFile);
    $relativePath = ltrim($relativePath, '/\\');
    
    // Debug logging
    writeLog("Requested file: $requestedFile", "file-access.log");
    writeLog("Relative path: $relativePath", "file-access.log");
    writeLog("User ID: $userId", "file-access.log");
    
    $isUserFile = false;
    
    // APPROACH 1: Direct user ID path check
    if (preg_match("#^/{$userId}/#", $relativePath) || preg_match("#^{$userId}/#", $relativePath) || 
        preg_match("#[\\\\/]{$userId}[\\\\/]#", $relativePath)) {
        $isUserFile = true;
        writeLog("Access granted via direct user ID match", "file-access.log");
    }
    
    // APPROACH 2: Extract document ID from path and check database ownership
    if (!$isUserFile && preg_match('#/requests/[^/]+/(\d+)/#', $relativePath, $matches)) {
        $requestId = $matches[1];
        $stmt = $conn->prepare("SELECT user_id FROM Request WHERE request_id = ?");
        $stmt->bind_param("i", $requestId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($row = $result->fetch_assoc()) {
            if ($row['user_id'] == $userId) {
                $isUserFile = true;
                writeLog("Access granted via database request ownership check", "file-access.log");
            }
        }
        $stmt->close();
    }
    
    // APPROACH 3: Component-based path validation
    if (!$isUserFile) {
        $pathComponents = explode('/', str_replace('\\', '/', $relativePath));
        if (!empty($pathComponents) && $pathComponents[0] == $userId) {
            $isUserFile = true;
            writeLog("Access granted via path component check", "file-access.log");
        }
    }
    
    // Handle admin access - always allow admins access to files
    if ($role === 'admin') {
        $isUserFile = true;
        writeLog("Access granted via admin role", "file-access.log");
    }
    
    // If all checks fail and debug mode is enabled, log detailed path information
    if (!$isUserFile) {
        writeLog("Access denied for path: $filePath", "security.log");
        writeLog("Normalized relative path: " . str_replace('\\', '/', $relativePath), "security.log");
        writeLog("User ID in session: $userId", "security.log");
        writeLog("Requested absolute path: $requestedFile", "security.log");
        throw new Exception('You do not have permission to access this file');
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
