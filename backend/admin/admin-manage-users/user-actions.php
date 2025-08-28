<?php
require __DIR__ . '/../../services/open-db.php';
include __DIR__ . '/../../services/logger.php';
include __DIR__ . '/../../services/audit-log.php';
session_start();

// User Actions
function activateUser($userId)
{
    global $conn;
    $sql = "UPDATE User SET status = 'active' WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $userId);
    $result = $stmt->execute();
    $stmt->close();
    $writeAudit = writeAuditLog($userId, "User activated", "User activated by admin");
    return $result && $writeAudit;
}

function resetPassword($userId, $newPassword, $confirmPassword)
{
    global $conn;
    $success = true;
    if ($newPassword !== $confirmPassword) {
        $success = false;
    } else {
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        $sql = "UPDATE User SET password = ? WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("si", $hashedPassword, $userId);
        if (!$stmt->execute()) {
            $success = false;
        }
        $stmt->close();
    }
    $writeAudit = writeAuditLog($userId, "Password reset", "Password reset by admin");
    return $success && $writeAudit;
}

function suspendUser($userId)
{
    global $conn;

    $message = $_POST['message'] ?? "User suspended";

    $sql = "UPDATE User SET status = 'suspended' WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $userId);
    $result = $stmt->execute();
    $stmt->close();
    // Notify user about suspension
    $writeAudit = writeAuditLog($userId, "User suspended", "User suspended by admin: $message");
    return $result && $writeAudit;
}

// Verification actions
function verifyUser($userId)
{
    global $conn;
    $success = true;

    // Update user status
    $sql = "UPDATE User SET status = 'active', is_verified = 1 WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $userId);
    if (!$stmt->execute()) {
        $success = false;
    }
    $stmt->close();

    // Update application status
    $sql = "UPDATE Application SET status = 'approved', admin_id = ? WHERE user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $_SESSION['user_id'], $userId);
    if (!$stmt->execute()) {
        $success = false;
    }
    $stmt->close();

    // Notify user about verification
    // Send email or notification
    
    $writeAudit = writeAuditLog($userId, "User verified", "User verified by admin");

    return $success && $writeAudit;
}

function requestMoreInfo($userId)
{
    global $conn;
    $success = true;

    // Get the message from the POST data
    $message = $_POST['message'] ?? "Additional information requested";

    // Update user status
    $sql = "UPDATE User SET status = 'pending', is_verified = 0 WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $userId);
    if (!$stmt->execute()) {
        $success = false;
    }
    $stmt->close();

    // Update application with admin notes
    $sql = "UPDATE Application SET status = 'additional-info-requested', admin_id = ?, admin_notes = ? WHERE user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("isi", $_SESSION['user_id'], $message, $userId);
    if (!$stmt->execute()) {
        $success = false;
    }
    $stmt->close();

    $writeAudit = writeAuditLog($userId, "Additional information requested", "Admin requested additional information: $message");

    return $success && $writeAudit; 
}

function rejectUser($userId)
{
    global $conn;
    $success = true;

    // Get the rejection reason from the POST data
    $message = $_POST['message'] ?? "Application rejected";

    // Update user status
    $sql = "UPDATE User SET status = 'suspended', is_verified = 0 WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $userId);
    if (!$stmt->execute()) {
        $success = false;
    }
    $stmt->close();

    // Update application with rejection reason
    $sql = "UPDATE Application SET status = 'rejected', admin_id = ?, admin_notes = ? WHERE user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("isi", $_SESSION['user_id'], $message, $userId);
    if (!$stmt->execute()) {
        $success = false;
    }
    $stmt->close();

    // Notify user about rejection

    $writeAudit = writeAuditLog($userId, "User rejected", "User application rejected by admin: $message");

    return $success && $writeAudit;
}

function updateUserRole($userId, $newRole)
{
    global $conn;
    $sql = "UPDATE User SET role = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("si", $newRole, $userId);
    $result = $stmt->execute();
    $stmt->close();

    // Notify user about role change
    $writeAudit = writeAuditLog($userId, "User role updated", "User role changed to $newRole by admin");

    return $result;
}

function validateAdminPassword($adminId, $password){
    global $conn;
    $sql = "SELECT password FROM User WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $adminId);
    $stmt->execute();
    $stmt->bind_result($hashedPassword);
    $stmt->fetch();
    $stmt->close();

    return password_verify($password, $hashedPassword);
}


try {
    $admin_id = $_SESSION['user_id'] ?? null;
    $role = $_SESSION['role'] ?? null;

    if (!$admin_id || $role !== 'admin') {
        writeLog("Unauthorized access attempt to update
        user data", "admin-manage-users.log");
        echo json_encode([
            'success' => false,
            'message' => 'Unauthorized access'
        ]);
        exit;
    }

    // Get user ID and action
    $user_id = $_POST['user_id'] ?? null;
    $action = $_POST['action'] ?? null;

    if (!$user_id || !$action) {
        throw new Exception('User ID or action not provided');
    }

    // Begin transaction
    $conn->begin_transaction();
    $success = false;

    switch ($action) {
        case 'activate':
            $success = activateUser($user_id);
            break;
        case 'reset-password':
            $newPassword = $_POST['new_password'] ?? null;
            $confirmPassword = $_POST['confirm_password'] ?? null;
            if (!$newPassword || !$confirmPassword) {
                throw new Exception('New password or confirmation not provided');
            }
            $success = resetPassword($user_id, $newPassword, $confirmPassword);
            break;
        case 'suspend':
            $success = suspendUser($user_id);
            break;
        case 'verify':
            $success = verifyUser($user_id);
            break;
        case 'request-more-info':
            $success = requestMoreInfo($user_id);
            break;
        case 'reject-verification':
            $success = rejectUser($user_id);
            break;
        case 'make-admin':
        case 'make-client':
            $adminPassword = $_POST['admin_password'] ?? null;
            if (!$adminPassword) {
                throw new Exception('Admin password not provided');
            }
            
            // Validate admin password
            if (!validateAdminPassword($admin_id, $adminPassword)) {
                throw new Exception('Invalid admin password');
            }
            
            // Determine new role based on action
            $newRole = ($action == 'make-admin') ? 'admin' : 'client';
            $success = updateUserRole($user_id, $newRole);
            break;
        default:
            throw new Exception('Invalid action');
    }

    if ($success) {
        // Commit the transaction
        $conn->commit();
        writeLog("User action '$action' successfully applied to user ID: $user_id", "admin-manage-users.log");
        echo json_encode([
            'success' => true,
            'message' => 'Action completed successfully'
        ]);
    } else {
        throw new Exception('Failed to execute action');
    }
} catch (\Throwable $th) {
    // Rollback transaction in case of error
    $conn->rollback();
    writeLog("Error: " . $th->getMessage(), "admin-manage-users.log");
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred: ' . $th->getMessage()
    ]);
} finally {
    // Close the connection
    $conn->close();
}
