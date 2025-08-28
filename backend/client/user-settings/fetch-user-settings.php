<?php
require __DIR__ . '/../../services/open-db.php';
include __DIR__ . '/../../services/logger.php';
session_start();

function getUserNameEmailPhone($userId)
{
    global $conn;
    $stmt = $conn->prepare("SELECT username, email, phone FROM User WHERE id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $stmt->bind_result($username, $email, $phone);
    $stmt->fetch();
    $stmt->close();

    return [
        'username' => $username,
        'email' => $email,
        'phone' => $phone
    ];
}

// FUTURE IMPLEMENTATION
function getSessions($userId)
{
    global $conn;
    $sql = "SELECT * FROM SessionTokens WHERE user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $sessions = [];
    while ($row = $result->fetch_assoc()) {
        $sessions[] = [
            'session_id' => $row['session_id'],
            'created_at' => $row['created_at'],
            'last_active' => $row['last_active'],
            'ip_address' => $row['ip_address'],
            'user_agent' => $row['user_agent']
        ];
    }
    $stmt->close();
    return $sessions;
}

try {
    $userId = $_SESSION['user_id'] ?? null;
    $action = $_POST['action'] ?? null;
    if (!isset($userId) || !isset($action)) {
        throw new Exception('Invalid request');
    }

    switch ($action) {
        case 'getUserInfo':
            $userInfo = getUserNameEmailPhone($userId);
            echo json_encode([
                'status' => 'success',
                'data' => $userInfo
            ]);
            break;
        // case 'get_sessions':
        //     $sessions = getSessions($userId);
        //     echo json_encode([
        //         'status' => 'success',
        //         'data' => $sessions
        //     ]);
        //     break;
        default:
            throw new Exception('Invalid action');
    }
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
