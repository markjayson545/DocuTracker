<?php
require __DIR__ . '/../../services/open-db.php';
include __DIR__ . '/../../services/logger.php';
session_start();

function notifyUser($userId, $title, $message, $type) {
    global $conn;
    $sql = "INSERT INTO Notification (user_id, title, message, type) VALUES (?, ?, ?, ?)"; 
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("isss", $userId, $title, $message, $type); 
    $stmt->execute();
    if ($stmt->affected_rows > 0) {
        writeLog("Notification sent to user_id: $userId with title: $title", "handle-request-status.log");
    } else {
        writeLog("Failed to send notification to user_id: $userId with title: $title", "handle-request-status.log");
    }
    $stmt->close();
}

function rejectRequest($reqId, $userId){
    global $conn; 
    $sql = "UPDATE Request SET status = 'rejected' WHERE request_id = ?"; 
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $reqId); 
    $stmt->execute();
    if ($stmt->affected_rows > 0) {
        writeLog("Request #$reqId has been rejected for user_id: $userId", "handle-request-status.log");
    } else {
        writeLog("Failed to reject request #$reqId for user_id: $userId", "handle-request-status.log");
    }
    $stmt->close();
    // Notify the user about the rejection
    notifyUser($userId, "Request Rejected", "Your request #$reqId has been rejected.", "warning");
}

function requestMoreInfo($reqId, $message, $userId) {
    global $conn;
    $sql = "UPDATE Request SET status = 'more_info' WHERE request_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $reqId);
    $stmt->execute();
    if ($stmt->affected_rows > 0) {
        writeLog("Request #$reqId requires more information for user_id: $userId", "handle-request-status.log");
    } else {
        writeLog("Failed to update request #$reqId for user_id: $userId", "handle-request-status.log");
    }
    $stmt->close();
    // We'll still send the notification with the message even though we don't store it in the Request table
    notifyUser($userId, "More Information Required", "Your request #$reqId requires more information: $message", "info");
}

try {
    $adminUserId = $_SESSION['user_id'] ?? null;
    $role = $_SESSION['role'] ?? null;
    if (!$adminUserId || !$role) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Unauthorized access.'
        ]);
        exit;
    }
    if ($role !== 'admin') {
        echo json_encode([
            'status' => 'error',
            'message' => 'You do not have permission to perform this action.'
        ]);
        exit;
    }
    $userId = $_POST['user_id'] ?? null;
    $reqId = $_POST['req_id'] ?? null;
    $action = $_POST['action'] ?? null;
    $message = $_POST['message'] ?? null;

    if (!$userId || !$reqId) {
        echo json_encode([
            'status' => 'error',
            'message' => 'User ID and Request ID are required.'
        ]);
        exit;
    }

    switch ($action) {
        case 'reject':
            rejectRequest($reqId, $userId);
            echo json_encode([
                'status' => 'success',
                'message' => "Request #$reqId has been rejected."
            ]);
            break;
        case 'more_info':
            if (empty($message)) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Message is required for requesting more information.'
                ]);
                exit;
            }
            requestMoreInfo($reqId, $message, $userId);
            echo json_encode([
                'status' => 'success',
                'message' => "Request #$reqId requires more information."
            ]);
            break;
        default:
            echo json_encode([
                'status' => 'error',
                'message' => 'Invalid action.'
            ]);
    }

} catch (\Throwable $th) {
    writeLog("Error in handle-request-status.php: " . $th->getMessage(), "handle-request-status.log");
    echo json_encode([
        'status' => 'error',
        'message' => 'An error occurred while processing your request.',
        'error' => $th->getMessage()
    ]);
}

?>