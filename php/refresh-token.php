<?php
// refresh.php

session_start();

if (!isset($_SESSION['token'], $_COOKIE['session_token']) || $_SESSION['token'] !== $_COOKIE['session_token']) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid session']);
    exit;
}
try {
    setcookie('session_token', $_SESSION['token'], time() + (7 * 24 * 60 * 60), "/", "", false, true);

    $sql = "UPDATE Session SET created_at = CURRENT_TIMESTAMP WHERE token = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 's', $_SESSION['token']);
    mysqli_stmt_execute($stmt);

    echo json_encode(['status' => 'success', 'message' => 'Session refreshed']);
} catch (\Throwable $th) {
    echo json_encode(['status' => 'error', 'message' => 'An error occurred: ' . $th->getMessage()]);
}
