<?php

require 'open-db.php';
include 'logger.php';
session_start();

try {
    // Check if user is logged in
    if (!isset($_SESSION['user_id'])) {
        echo json_encode([
            'status' => 'error',
            'message' => 'User not logged in.'
        ]);
        exit;
    }

    $userId = $_SESSION['user_id'];

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Create directory for profile pictures if it doesn't exist
        $directory = '/home/mark/apache-xampp-hosting/docutracker/userfiles/' . $userId . '/profile-picture/';
        
        if (!is_dir($directory)) {
            mkdir($directory, 0777, true);
        }
        
        // Check if file was uploaded
        if (!isset($_FILES['profile-picture']) || $_FILES['profile-picture']['error'] !== UPLOAD_ERR_OK) {
            echo json_encode([
                'status' => 'error',
                'message' => 'No file uploaded or upload error occurred.'
            ]);
            exit;
        }
        
        $fileTmpName = $_FILES['profile-picture']['tmp_name'];
        $fileName = $_FILES['profile-picture']['name'];
        $fileSize = $_FILES['profile-picture']['size'];
        $fileType = $_FILES['profile-picture']['type'];
        
        // Check file type
        $allowed = ['jpg', 'jpeg', 'png'];
        $fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        
        if (!in_array($fileExt, $allowed)) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Invalid file type. Please upload a JPG, JPEG, or PNG image.'
            ]);
            exit;
        }
        
        // Check file size (max 5MB)
        if ($fileSize > 5000000) {
            echo json_encode([
                'status' => 'error',
                'message' => 'File size exceeds the 5MB limit. Please upload a smaller file.'
            ]);
            exit;
        }
        
        // Generate a unique filename to avoid caching issues
        $fileNameNew = date('YmdHis') . '_' . uniqid() . '.' . $fileExt;
        $fileDestination = $directory . $fileNameNew;
        
        // Move the uploaded file to the destination
        if (!move_uploaded_file($fileTmpName, $fileDestination)) {
            writeLog("Failed to move uploaded profile picture to $fileDestination", "profile-picture-upload.log");
            echo json_encode([
                'status' => 'error',
                'message' => 'Failed to save the uploaded file. Please try again.'
            ]);
            exit;
        }
        
        // Update user profile in database
        // Using the full server file system path instead of a relative path
        $relativePath = $fileDestination; // Full path: /home/mark/apache-xampp-hosting/docutracker/userfiles/' . $userId . '/profile-picture/' . $fileNameNew
        
        // Alternatively, if you need a web-accessible path:
        // $relativePath = '/docutracker/userfiles/' . $userId . '/profile-picture/' . $fileNameNew;

        $sql = "UPDATE User SET profile_picture = ? WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("si", $relativePath, $userId);
        
        if ($stmt->execute()) {
            echo json_encode([
                'status' => 'success',
                'message' => 'Profile picture updated successfully.',
                'file_name' => $fileNameNew,
                'file_path' => $relativePath
            ]);
        } else {
            throw new Exception("Failed to update profile picture in database: " . $conn->error);
        }
        
        $stmt->close();
        $conn->close();
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid request method.'
        ]);
    }
} catch (\Throwable $th) {
    writeLog("Error when uploading profile picture: " . $th->getMessage(), "profile-picture-upload.log");
    echo json_encode([
        'status' => 'error',
        'message' => 'An error occurred while uploading the profile picture.',
        'details' => $th->getMessage()
    ]);
}
