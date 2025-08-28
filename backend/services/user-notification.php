<?php
require 'open-db.php';
include 'logger.php';
session_start();

function getAllNotification($userId)
{
    global $conn;
    $sql = "SELECT notification_id, user_id, type, title, message, created_at FROM Notification WHERE user_id = ? AND status != 'read' ORDER BY created_at DESC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $fetched = $stmt->get_result();
    $result = [];
    while ($row = $fetched->fetch_assoc()) {
        $result[] = [
            'id' => $row['notification_id'],
            'user_id' => $row['user_id'],
            'type' => $row['type'],
            'title' => $row['title'],
            'message' => $row['message'],
            'created_at' => $row['created_at']
        ];
    }
    return $result;
}

function getAllSystemNotification()
{
    global $conn;
    $sql = "SELECT system_notification_id, type, message, created_at FROM SystemNotification WHERE status = unread ORDER BY created_at DESC";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $fetched = $stmt->get_result();
    $result = [];
    while ($row = $fetched->fetch_assoc()) {
        $result[] = [
            'id' => $row['system_notification_id'],
            'type' => $row['type'],
            'message' => $row['message'],
            'created_at' => $row['created_at']
        ];
    }
    return $result;
}

function setReadNotification($notificationId)
{
    global $conn;
    $sql = "UPDATE Notification SET status = 'read' WHERE notification_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $notificationId);
    return $stmt->execute();
}

try {
    $userId = $_SESSION['user_id'];

    if (!isset($userId)) {
        throw new Exception('User not logged in');
    }

    $action = $_POST['action'] ?? null;

    switch ($action) {
        case 'getAllNotification':
            $notifications = getAllNotification($userId);
            echo json_encode([
                "success" => true,
                "message" => "Notifications fetched successfully",
                "data" => $notifications
            ]);
            break;
        case 'getAllSystemNotification':
            $notifications = getAllSystemNotification();
            echo json_encode([
                "success" => true,
                "message" => "System notifications fetched successfully",
                "data" => $notifications
            ]);
            break;
        case 'setReadNotification':
            $notificationId = $_POST['notificationId'] ?? null;
            if (!$notificationId) {
                throw new Exception('Notification ID is required');
            }
            setReadNotification($notificationId);
            echo json_encode([
                "success" => true,
                "message" => "Notification marked as read successfully"
            ]);
            break;
        default:
            throw new Exception('Invalid action');
    }
} catch (\Throwable $th) {
    writeLog($th->getMessage(), 'user-notifications.log');
    echo json_encode([
        "success" => false,
        "message" => $th->getMessage()
    ]);
}
