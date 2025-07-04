<?php
require 'open-db.php';
include 'logger.php';
session_start();

try {
    $userId = $_POST['user_id'] ?? $_SESSION['user_id'] ?? null;
    if (!$userId) {
        throw new Exception('User ID is required');
    }
    $applicationId = $_POST['application_id'] ?? null;

    // Validate application ID
    if (!$applicationId) {
        $sqlGetApplicationId = "SELECT application_id FROM Application WHERE user_id = ?";
        $stmt = $conn->prepare($sqlGetApplicationId);
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $applicationId = $row['application_id'];
        } else {
            throw new Exception('No application found for this user');
        }
    }

    // Fetch documents for the given application ID
    $sql = "SELECT * FROM ApplicationDocuments WHERE application_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $applicationId);
    $stmt->execute();
    $result = $stmt->get_result();

    // Fetch application status and additional document requests
    $appSql = "SELECT status, admin_notes FROM Application WHERE application_id = ?";
    $appStmt = $conn->prepare($appSql);
    $appStmt->bind_param("i", $applicationId);
    $appStmt->execute();
    $appResult = $appStmt->get_result();
    $applicationInfo = $appResult->fetch_assoc();

    if ($result->num_rows > 0) {
        $documents = [];
        while ($row = $result->fetch_assoc()) {
            $documents[] = [
                'document_id' => $row['document_id'],
                'document_type' => $row['document_type'],
                'document_path' => $row['document_path'],
                'created_at' => $row['created_at']
            ];
        }
        echo json_encode([
            'success' => true,
            'documents' => $documents,
            'application_status' => $applicationInfo['status'] ?? 'under-review',
            'admin_notes' => $applicationInfo['admin_notes'] ?? '',
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'No documents found',
            'application_status' => $applicationInfo['status'] ?? 'pending',
            'admin_notes' => $applicationInfo['admin_notes'] ?? '',
        ]);
    }
} catch (\Throwable $th) {
    writeLog("Error in get-verification-documents.php: " . $th->getMessage(), "admin-dashboard.log");
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred: ' . $th->getMessage()
    ]);
}
