<?php

require __DIR__ . '/../../services/open-db.php';
include __DIR__ . '/../../services/logger.php';
session_start();

try {
    $userId = $_SESSION['user_id'];

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $documentType = $_POST['document-type'];
        $isUpdate = isset($_POST['is_update']) ? true : false;
        $isAdditionalDocument = isset($_POST['is_additional_document']) ? true : false;
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

        // Get or create application record
        $applicationId = null;
        // Always get or create the application for this user
        $checkAppStmt = $conn->prepare("SELECT application_id, status FROM Application WHERE user_id = ?");
        $checkAppStmt->bind_param("i", $userId);
        $checkAppStmt->execute();
        $checkAppResult = $checkAppStmt->get_result();
        
        if ($checkAppResult->num_rows > 0) {
            $appRow = $checkAppResult->fetch_assoc();
            $applicationId = $appRow['application_id'];
            
            // If this is an additional document upload, update application status
            if ($isAdditionalDocument) {
                $updateAppStmt = $conn->prepare("UPDATE Application SET status = 'under-review', additional_documents_required = 0, updated_at = NOW() WHERE application_id = ?");
                $updateAppStmt->bind_param("i", $applicationId);
                $updateAppStmt->execute();
                $updateAppStmt->close();
                writeLog("Application ID $applicationId updated with additional documents", "verification-upload.log");
            }
        } else {
            $newAppStmt = $conn->prepare("INSERT INTO Application (user_id, status) VALUES (?, 'under-review')");
            $newAppStmt->bind_param("i", $userId);
            $newAppStmt->execute();
            $applicationId = $conn->insert_id;
            $newAppStmt->close();
        }
        $checkAppStmt->close();

        // Insert new document into ApplicationDocuments
        $docStmt = $conn->prepare("INSERT INTO ApplicationDocuments (application_id, document_type, document_path) VALUES (?, ?, ?)");
        $docStmt->bind_param("iss", $applicationId, $documentType, $fileDestination);
        if ($docStmt->execute()) {
            $conn->commit();
            echo json_encode([
                'status' => 'success',
                'message' => $isAdditionalDocument ? 'Additional document uploaded successfully.' : 'Document uploaded successfully.',
                'file_name' => $fileNameNew,
                'application_id' => $applicationId,
                'document_id' => $conn->insert_id,
                'submission_date' => date('F j, Y')
            ]);
        } else {
            throw new Exception("Failed to insert document record: " . $conn->error);
        }
        $docStmt->close();
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
