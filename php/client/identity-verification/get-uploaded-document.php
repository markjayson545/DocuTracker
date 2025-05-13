<?php
require __DIR__ . '/../../services/open-db.php';
include __DIR__ . '/../../services/logger.php';
session_start();

try {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode([
            'status' => 'error',
            'message' => 'User not authenticated'
        ]);
        exit;
    }

    $userId = $_SESSION['user_id'];
    
    // Query the database for user's application
    $stmt = $conn->prepare("SELECT * FROM Application WHERE user_id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $application = $result->fetch_assoc();
        
        // Get documents from the application
        $docsStmt = $conn->prepare("SELECT * FROM ApplicationDocuments WHERE application_id = ? ORDER BY created_at DESC");
        $docsStmt->bind_param("i", $application['application_id']);
        $docsStmt->execute();
        $docsResult = $docsStmt->get_result();
        $documents = [];
        
        while($doc = $docsResult->fetch_assoc()) {
            $documents[] = $doc;
        }
        
        // Just check if personal details exist without fetching all the data
        $profileStmt = $conn->prepare("SELECT 1 FROM ClientProfile WHERE user_id = ? LIMIT 1");
        $profileStmt->bind_param("i", $userId);
        $profileStmt->execute();
        $hasPersonalDetails = ($profileStmt->get_result()->num_rows > 0);
        
        // Format the response
        echo json_encode([
            'status' => 'success',
            'has_application' => true,
            'application' => [
                'id' => $application['application_id'] ?? null,
                'status' => $application['status'] ?? 'Under Review',
                'submission_date' => $application['created_at'] ?? date('F j, Y'),
                'last_updated' => $application['updated_at'] ?? date('F j, Y'),
                'admin_notes' => $application['admin_notes'] ?? '',
                'additional_documents_required' => $application['additional_documents_required'] ?? false
            ],
            'documents' => $documents,
            'has_personal_details' => $hasPersonalDetails
        ]);
    } else {
        echo json_encode([
            'status' => 'success',
            'has_application' => false
        ]);
    }
    
    // Close connections
    if (isset($profileStmt)) {
        $profileStmt->close();
    }
    if (isset($docsStmt)) {
        $docsStmt->close();
    }
    $stmt->close();
    $conn->close();
    
} catch (\Throwable $th) {
    writeLog("Error getting uploaded document: " . $th->getMessage(), "application-status.log");
    echo json_encode([
        'status' => 'error',
        'message' => 'An error occurred while retrieving the document.',
    ]);
}
