<?php
require 'open-db.php';
include 'logger.php';
session_start();
try {
    // Check if the user is logged in
    if (!isset($_SESSION['user_id']) || !isset($_SESSION['token'])) {
        echo json_encode([
            'status' => 'error',
            'message' => 'User not logged in'
        ]);
        exit;
    }
    $userId = $_SESSION['user_id'];
    $status = $_SESSION['status'];

    if ($status !== 'suspended') {
        echo json_encode([
            'status' => 'error',
            'message' => 'User is not suspended'
        ]);
        exit;
    }

    if($status === 'suspended') {
        $sql = "SELECT title, action AS message, created_at FROM AuditLog WHERE user_id = ? AND title = 'User suspended' ORDER BY created_at DESC LIMIT 1";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, 'i', $userId);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $suspensionData = mysqli_fetch_assoc($result);
        mysqli_stmt_close($stmt);
        if ($suspensionData) {
            echo json_encode([
                'status' => 'success',
                'message' => 'User is suspended',
                'data' => $suspensionData
            ]);
        } else {
            echo json_encode([
                'status' => 'error',
                'message' => 'No suspension data found'
            ]);
        }
    }
} catch (\Throwable $th) {
    writeLog("Error fetching suspension data: " . $th->getMessage(), "suspension.log");
    echo json_encode([
        'status' => 'error',
        'message' => 'An error occurred while fetching suspension data',
        'error' => $th->getMessage()
    ]);
}

?>