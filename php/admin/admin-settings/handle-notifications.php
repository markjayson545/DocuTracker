<?php
require __DIR__ . '/../../services/open-db.php';
include __DIR__ . '/../../services/logger.php';

session_start();

function getAllUser()
{
    global $conn;
    $sql = "SELECT id, username, email FROM User";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $fetched = $stmt->get_result();
    $result = [];
    while ($row = $fetched->fetch_assoc()) {
        $result[] = [
            'id' => $row['id'],
            'username' => $row['username'],
            'email' => $row['email']
        ];
    }
    return $result;
}

function searchUser($value)
{
    global $conn;
    writeLog("Searching for user with value: $value", 'handle-notifications.log');

    // Fix: Use case-insensitive search with LOWER()
    $searchValue = "%$value%";
    $sql = "SELECT id, username, email FROM User WHERE 
            LOWER(username) LIKE LOWER(?) OR 
            LOWER(email) LIKE LOWER(?)";

    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        writeLog("SQL Prepare Error: " . $conn->error, 'handle-notifications.log');
        return [];
    }

    $stmt->bind_param("ss", $searchValue, $searchValue);

    if (!$stmt->execute()) {
        writeLog("SQL Execute Error: " . $stmt->error, 'handle-notifications.log');
        return [];
    }

    $fetched = $stmt->get_result();
    $result = [];

    // Check if we have results
    if ($fetched->num_rows === 0) {
        writeLog("No users found matching: $value", 'handle-notifications.log');
    }

    while ($row = $fetched->fetch_assoc()) {
        $result[] = [
            'id' => $row['id'],
            'username' => $row['username'],
            'email' => $row['email']
        ];
    }

    writeLog("Found " . count($result) . " users", 'handle-notifications.log');
    return $result;
}

function sendNotification($userId, $title, $message, $type)
{
    global $conn;
    $sql = "INSERT INTO Notification (user_id, title, message, type) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("isss", $userId, $title, $message, $type);
    return $stmt->execute();
}

function sendSystemNotification($title, $message, $type)
{
    global $conn;
    $sql = "INSERT INTO SystemNotification (title, message, type) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sss", $title, $message, $type);
    return $stmt->execute();
}

function deleteNotification($notificationId)
{
    global $conn;
    $sql = "DELETE FROM Notification WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $notificationId);
    return $stmt->execute();
}

function getAllNotification()
{
    global $conn;
    $sql = "SELECT * FROM Notification ORDER BY created_at DESC LIMIT 10";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $fetched = $stmt->get_result();
    $result = [];
    while ($row = $fetched->fetch_assoc()) {
        $result[] = [
            'id' => $row['id'],
            'user_id' => $row['user_id'],
            'title' => $row['title'],
            'message' => $row['message'],
            'type' => $row['type'],
            'created_at' => $row['created_at']
        ];
    }
    return $result;
}

try {
    // Ensure we have a session
    if (!isset($_SESSION['user_id']) || !isset($_SESSION['role'])) {
        throw new Exception('User not logged in');
    }

    $userId = $_SESSION['user_id'];
    $role = $_SESSION['role'];

    // Check if action exists in POST data
    if (!isset($_POST['action'])) {
        throw new Exception('No action specified');
    }

    $action = $_POST['action'];
    writeLog("Processing action: $action", 'handle-notifications.log');

    if ($role != 'admin') {
        throw new Exception('User not authorized');
    }

    switch ($action) {
        case 'getAllUser':
            $users = getAllUser();
            echo json_encode([
                "success" => true,
                "message" => "Get all users successfully",
                "data" => $users
            ]);
            break;
        case 'searchUser':
            if (!isset($_POST['value'])) {
                throw new Exception('Search value is required');
            }
            $value = $_POST['value'];
            writeLog("Search term: $value", 'handle-notifications.log');
            $users = searchUser($value);
            echo json_encode([
                "success" => true,
                "message" => "Search user successfully",
                "data" => $users
            ]);
            break;
        case 'sendNotification':
            $userId = $_POST['userId'];
            $title = $_POST['title'];
            $message = $_POST['message'];
            $type = $_POST['type'];
            sendNotification($userId, $title, $message, $type);
            echo json_encode([
                "success" => true,
                "message" => "Send notification successfully"
            ]);
            break;
        case 'sendSystemNotification':
            $title = $_POST['title'];
            $message = $_POST['message'];
            $type = $_POST['type'];
            sendSystemNotification($title, $message, $type);
            echo json_encode([
                "success" => true,
                "message" => "Send system notification successfully"
            ]);
            break;
        case 'deleteNotification':
            $notificationId = $_POST['notificationId'];
            deleteNotification($notificationId);
            echo json_encode([
                "success" => true,
                "message" => "Delete notification successfully"
            ]);
            break;
        case 'getAllNotification':
            $notifications = getAllNotification();
            echo json_encode([
                "success" => true,
                "message" => "Get all notifications successfully",
                "data" => $notifications
            ]);
            break;
        default:
            throw new Exception('Invalid action');
    }
} catch (\Throwable $th) {
    writeLog("Error: " . $th->getMessage() . "\n" . $th->getTraceAsString(), 'handle-notifications.log');
    echo json_encode([
        "success" => false,
        "message" => $th->getMessage()
    ]);
}
