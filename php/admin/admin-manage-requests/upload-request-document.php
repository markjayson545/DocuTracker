<?php
require __DIR__ . '/../../services/open-db.php';
include __DIR__ . '/../../services/logger.php';
session_start();

/**
 * Validates input parameters
 */
function validateInput($post, $files) {
    $userId = $post['user_id'] ?? null;
    $request_id = $post['request_id'] ?? null;
    $document_name = $post['document_name'] ?? null;
    
    if (!$userId || !$request_id || !$document_name || !isset($files['document-file'])) {
        throw new Exception('Missing required fields');
    }
    
    return [
        'user_id' => $userId,
        'request_id' => $request_id,
        'document_name' => $document_name
    ];
}

/**
 * Checks if the user has admin authorization
 */
function checkAuthorization($session) {
    if (!isset($session['user_id']) || $session['role'] != 'admin') {
        echo json_encode([
            'success' => false,
            'message' => 'Unauthorized access.'
        ]);
        exit;
    }
}

/**
 * Handles the file upload process
 */
function uploadFile($file, $userId, $document_name, $request_id) {
    // Validate the uploaded file
    if ($file['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('File upload error: ' . getUploadErrorMessage($file['error']));
    }
    
    $safe_document_name = preg_replace('/[^a-zA-Z0-9_-]/', '_', $document_name);
    
    // Get the user that PHP is running as - for diagnostics
    $current_user = function_exists('posix_getpwuid') ? posix_getpwuid(posix_geteuid())['name'] : 'unknown';
    writeLog("PHP running as user: $current_user", "upload-request-document.log");
    
    // Use a directory that's likely writable by the web server
    // Use the project userfiles directory for persistent storage
    $upload_base = __DIR__ . '/../../../userfiles';
    // Ensure the userfiles directory exists and is writable
    if (!is_dir($upload_base)) {
        mkdir($upload_base, 0755, true);
    }
    
    writeLog("Using upload base: $upload_base", "upload-request-document.log");
    
    $directory = $upload_base . '/' . $userId . '/requests/' . $safe_document_name . '/' . $request_id . '/';
    
    writeLog("Creating directory: $directory", "upload-request-document.log");
    
    // Create directory with proper error handling
    if (!is_dir($directory)) {
        if (!mkdir($directory, 0755, true)) {
            throw new Exception('Failed to create directory: ' . error_get_last()['message']);
        }
        
        // Verify directory was created and is writable
        if (!is_dir($directory) || !is_writable($directory)) {
            throw new Exception('Directory is not writable: ' . $directory);
        }
    }

    // Remove any existing file in this folder so the new upload replaces it
    $existingFiles = glob($directory . '*');
    if ($existingFiles !== false) {
        foreach ($existingFiles as $exist) {
            if (is_file($exist)) {
                @unlink($exist);
            }
        }
    }

    $file_extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    
    // Validate file extension (optional - can be expanded)
    $allowed_extensions = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
    if (!in_array($file_extension, $allowed_extensions)) {
        throw new Exception('Invalid file extension. Allowed: ' . implode(', ', $allowed_extensions));
    }
    
    $unique_filename = uniqid('doc_') . '.' . $file_extension;
    $filePath = $directory . $unique_filename;

    writeLog("Uploading document to: $filePath", "upload-request-document.log");
    
    if (!move_uploaded_file($file['tmp_name'], $filePath)) {
        $error_msg = error_get_last() ? error_get_last()['message'] : 'Unknown error';
        writeLog("Failed to move uploaded file: $error_msg", "upload-request-document.log");
        throw new Exception('Failed to upload the document: ' . $error_msg);
    }
    
    return $filePath;
}

/**
 * Helper function to translate upload error codes to messages
 */
function getUploadErrorMessage($error_code) {
    $errors = [
        UPLOAD_ERR_INI_SIZE => 'The uploaded file exceeds the upload_max_filesize directive in php.ini',
        UPLOAD_ERR_FORM_SIZE => 'The uploaded file exceeds the MAX_FILE_SIZE directive in the HTML form',
        UPLOAD_ERR_PARTIAL => 'The uploaded file was only partially uploaded',
        UPLOAD_ERR_NO_FILE => 'No file was uploaded',
        UPLOAD_ERR_NO_TMP_DIR => 'Missing a temporary folder',
        UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
        UPLOAD_ERR_EXTENSION => 'A PHP extension stopped the file upload'
    ];
    
    return $errors[$error_code] ?? 'Unknown upload error';
}

/**
 * Updates the database with the file path
 */
function updateDatabase($conn, $filePath, $request_id) {
    $sql = "UPDATE Request SET document_path = ?, status = 'approved' WHERE request_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("si", $filePath, $request_id);
    $stmt->execute();
    
    // Check affected rows before closing the statement
    $updateResult = $stmt->affected_rows;
    $stmt->close();
    writeLog("Updated database with file path: $filePath", "upload-request-document.log");

    $sql = "INSERT INTO RequestLog (request_id, status, created_at) VALUES (?, 'completed', NOW())";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $request_id);
    $stmt->execute();
    $stmt->close();
    writeLog("Inserted into RequestLog for request_id: $request_id", "upload-request-document.log");

    if ($updateResult === 0) {
        throw new Exception('Failed to update the database');
    }
    writeLog("Database updated successfully for request_id: $request_id", "upload-request-document.log");
}

/**
 * Main function to handle the document upload process
 */
function handleRequestDocumentUpload() {
    global $conn;
    writeLog("Starting document upload process", "upload-request-document.log");
    
    try {
        // Validate input
        $data = validateInput($_POST, $_FILES);
        
        // Check authorization
        checkAuthorization($_SESSION);
        
        // Upload file
        $filePath = uploadFile($_FILES['document-file'], $data['user_id'], $data['document_name'], $data['request_id']);
        
        // Update database
        updateDatabase($conn, $filePath, $data['request_id']);
        
        echo json_encode([
            'success' => true,
            'message' => 'Document uploaded successfully.'
        ]);
        
    } catch (Exception $e) {
        writeLog("Error: " . $e->getMessage(), "upload-request-document.log");
        echo json_encode([
            'success' => false,
            'message' => 'Error: ' . $e->getMessage()
        ]);
    }
}

// Execute the main function
handleRequestDocumentUpload();
