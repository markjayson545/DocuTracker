<?php
require __DIR__ . '/../../services/open-db.php';
include __DIR__ . '/../../services/logger.php';
session_start();

try {
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('User not logged in');
    }

    $userId = $_SESSION['user_id'];
    $userRole = $_SESSION['user_role'];

    if ($userRole !== 'admin') {
        throw new Exception('Unauthorized access');
    }

    if (isset($_POST['verify'])) {
        $applicationId = $_POST['application_id'];
        $sql = 'UPDATE Applications SET status = "verified" WHERE user_id = ? AND application_id = ?';
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('ii', $userId, $applicationId);
        if ($stmt->execute()) {
            writeLog('Application ' . $applicationId . ' verified by user ' . $userId, 'verify-user.log');
            header('Location: /admin/manage-applications.php?success=Application verified successfully');
        } else {
            throw new Exception('Failed to verify application');
        }

        $sqlUserStatus = 'UPDATE Users SET status = "verified" WHERE user_id = ?';
        $stmtUserStatus = $conn->prepare($sqlUserStatus);
        $stmtUserStatus->bind_param('i', $userId);
        if ($stmtUserStatus->execute()) {
            writeLog('User ' . $userId . ' status updated to verified', 'verify-user.log');
        } else {
            throw new Exception('Failed to update user status');
        }
        
        exit();
    }

} catch (Exception $e) {
    writeLog('Error verifying application ' . $e->getMessage(), 'verify-user.log');
    header('Location: /admin/manage-applications.php?error=' . urlencode($e->getMessage()));
    exit();
}


?>