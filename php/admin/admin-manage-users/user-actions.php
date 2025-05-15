<?php
require __DIR__ . '/../../services/open-db.php';
include __DIR__ . '/../../services/logger.php';
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
    return $result;
}

function suspendUser($userId)
{
    global $conn;
    $sql = "UPDATE User SET status = 'suspended' WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $userId);
    $result = $stmt->execute();
    $stmt->close();
    // Notify user about suspension
    return $result;
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
    return $success;
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
    $stmt->bind_param("isi", $$_SESSION['user_id'], $message, $userId); 
    if (!$stmt->execute()) {
        $success = false;
    }
    $stmt->close();

    return $success;
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
    $stmt->bind_param("isi", $$_SESSION['user_id'], $message, $userId);
    if (!$stmt->execute()) {
        $success = false;
    }
    $stmt->close();

    return $success;
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
?>
