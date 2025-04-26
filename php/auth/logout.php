<?php
require __DIR__ . '/../services/open-db.php';
include __DIR__ . '/../services/logger.php';
session_start();
if (isset($_SESSION['token'])) {
    $token = $_SESSION['token'];
    $sql = "DELETE FROM SessionTokens WHERE token = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 's', $token);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_close($stmt);
    // Clear the session
    session_unset();
    session_destroy();
    // Clear the cookie
    setcookie('session_token', '', time() - 3600, "/"); // Expire the cookie
    writeLog("User with token: '" . $token . "' logged out successfully", "sign-out.log");
    echo json_encode([
        'success' => true,
        'message' => 'Logout successful'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'No active session found'
    ]);
    exit;
}
