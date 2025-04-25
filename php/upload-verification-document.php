<?php

require 'services/open-db.php';
include 'services/logger.php';
session_start();

try {
    $userId = $_SESSION['user_id'];

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $documentType = $_POST['document-type'];
        $isUpdate = isset($_POST['is_update']) ? true : false;
        $directory = '/home/mark/apache-xampp-hosting/docutracker/userfiles/' . $userId . '/verification/' . $documentType . '/';
        $fileTmpName = $_FILES['verification-document']['tmp_name'];
        $fileName = $_FILES['verification-document']['name'];
        $fileSize = $_FILES['verification-document']['size'];
        $fileError = $_FILES['verification-document']['error'];
        $fileType = $_FILES['verification-document']['type'];

        $allowed = ['jpg', 'jpeg', 'png', 'pdf'];

        $fileExt = strtolower(pathinfo($_FILES['verification-document']['name'], PATHINFO_EXTENSION));

        if (!in_array($fileExt, $allowed)) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Invalid file type. Please upload a JPG, JPEG, PNG, or PDF file.'
            ]);
            exit;
        }

        if ($fileError !== 0) {
            writeLog("File upload error: Code $fileError", "verification-upload.log");
            echo json_encode([
                'status' => 'error',
                'message' => 'Error uploading file. Please try again.'
            ]);
            exit;
        }

        if ($fileSize > 10000000) {
            echo json_encode([
                'status' => 'error',
                'message' => 'File size exceeds the 10MB limit. Please upload a smaller file.'
            ]);
            exit;
        }

        if (!is_dir($directory)) {
            mkdir($directory, 0777, true);
        }

        // For updates, use a new filename with timestamp to avoid caching issues
        $fileNameNew = date('YmdTHis') . "." . $fileExt;
        $fileDestination = $directory . $fileNameNew;

        if (!move_uploaded_file($fileTmpName, $fileDestination)) {
            writeLog("Failed to move uploaded file to $fileDestination", "verification-upload.log");
            echo json_encode([
                'status' => 'error',
                'message' => 'Failed to save the uploaded file. Please try again.'
            ]);
            exit;
        }

        // If this is an update, fetch the current application ID
        $applicationId = null;
        if ($isUpdate) {
            $checkStmt = $conn->prepare("SELECT id FROM Application WHERE user_id = ?");
            $checkStmt->bind_param("i", $userId);
            $checkStmt->execute();
            $checkResult = $checkStmt->get_result();
            if ($checkResult->num_rows > 0) {
                $applicationId = $checkResult->fetch_assoc()['id'];
            }
            $checkStmt->close();
        }

        if ($applicationId) {
            // Update existing application
            $stmt = $conn->prepare("UPDATE Application SET document_type = ?, document_path = ?, status = 'under-review', updated_at = NOW() WHERE id = ?");
            $stmt->bind_param("ssi", $documentType, $fileDestination, $applicationId);
        } else {
            // Insert new application
            $stmt = $conn->prepare("INSERT INTO Application (user_id, document_type, document_path, status) 
                    VALUES (?, ?, ?, 'Under Review')
                    ON DUPLICATE KEY UPDATE 
                    document_path = VALUES(document_path),
                    status = 'Under Review',
                    updated_at = NOW()");
            $stmt->bind_param("iss", $userId, $documentType, $fileDestination);
        }

        if ($stmt->execute()) {
            // Get the application ID for new submissions
            if (!$applicationId) {
                $applicationId = $conn->insert_id;
            }

            echo json_encode([
                'status' => 'success',
                'message' => $isUpdate ? 'Document updated successfully.' : 'Document uploaded successfully.',
                'file_name' => $fileNameNew,
                'application_id' => $applicationId,
                'submission_date' => date('F j, Y'),
                'is_update' => $isUpdate
            ]);
        } else {
            writeLog("Database error: " . $conn->error, "verification-upload.log");
            echo json_encode([
                'status' => 'error',
                'message' => 'Failed to save document information in the database.'
            ]);
        }
        $stmt->close();
        $conn->close();
    }
} catch (\Throwable $th) {
    writeLog("Error when uploading verification document: " . $th->getMessage(), "verification-upload.log");
    echo json_encode([
        'status' => 'error',
        'message' => 'An error occurred while uploading the document.',
        'stack' => $th->getTraceAsString()
    ]);
}
