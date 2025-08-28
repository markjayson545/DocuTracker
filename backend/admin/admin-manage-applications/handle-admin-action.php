<?php
require __DIR__ . '/../../services/open-db.php';
include __DIR__ . '/../../services/logger.php';
session_start();

try {
    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
        throw new Exception('Unauthorized access');
    }
    
    $adminId = $_SESSION['user_id'];
    $action = $_POST['action'] ?? null;
    $applicationId = $_POST['application_id'] ?? null;
    $adminNotes = $_POST['admin_notes'] ?? '';
    
    if (!$applicationId) {
        throw new Exception('Application ID not provided');
    }
    
    if (!$action) {
        throw new Exception('Action not specified');
    }
    
    // Get the user ID for this application
    $userStmt = $conn->prepare("SELECT user_id FROM Application WHERE application_id = ?");
    $userStmt->bind_param("i", $applicationId);
    $userStmt->execute();
    $userResult = $userStmt->get_result();
    
    if ($userResult->num_rows === 0) {
        throw new Exception('Application not found');
    }
    
    $userId = $userResult->fetch_assoc()['user_id'];
    $userStmt->close();
    
    switch ($action) {
        case 'approve':
            // Update application status to approved
            $stmt = $conn->prepare("UPDATE Application SET status = 'approved', admin_notes = ?, updated_at = NOW(), admin_id = ? WHERE application_id = ?");
            $stmt->bind_param("sii", $adminNotes, $adminId, $applicationId);
            $stmt->execute();
            
            // Update user verification status
            $userStmt = $conn->prepare("UPDATE User SET is_verified = 1, status = 'active' WHERE id = ?");
            $userStmt->bind_param("i", $userId);
            $userStmt->execute();
            $userStmt->close();
            
            writeLog("Application ID: $applicationId approved by admin ID: $adminId", "admin-actions.log");
            break;
            
        case 'reject':
            // Update application status to rejected
            $stmt = $conn->prepare("UPDATE Application SET status = 'rejected', admin_notes = ?, updated_at = NOW(), admin_id = ? WHERE application_id = ?");
            $stmt->bind_param("sii", $adminNotes, $adminId, $applicationId);
            $stmt->execute();
            
            writeLog("Application ID: $applicationId rejected by admin ID: $adminId", "admin-actions.log");
            break;
            
        case 'request_info':
            // Update application to request additional information
            $stmt = $conn->prepare("UPDATE Application SET status = 'additional-info-requested', admin_notes = ?, updated_at = NOW(), admin_id = ? WHERE application_id = ?");
            $stmt->bind_param("sii", $adminNotes, $adminId, $applicationId);
            $stmt->execute();
            
            writeLog("Additional information requested for application ID: $applicationId by admin ID: $adminId", "admin-actions.log");
            break;
            
        default:
            throw new Exception('Invalid action');
    }
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Action processed successfully',
        'action' => $action,
        'application_id' => $applicationId
    ]);
    
} catch (\Throwable $th) {
    writeLog("Error in handle-admin-action.php: " . $th->getMessage(), "admin-actions.log");
    echo json_encode([
        'status' => 'error',
        'message' => 'An error occurred: ' . $th->getMessage()
    ]);
}
?>
