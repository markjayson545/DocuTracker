<?php
require __DIR__ . '/../../services/open-db.php';
include __DIR__ . '/../../services/logger.php';
session_start();


try {
    $loggedInUser = $_SESSION['user_id'];
    $role = $_SESSION['role'];
    $userId = $_POST['user_id'];
    $newPassword = $_POST['new_password'];
    $confirmPassword = $_POST['confirm_password'];
    if ($role !== 'admin') {
        throw new Exception('Unauthorized access');
    }
    if (empty($userId) || empty($newPassword) || empty($confirmPassword)) {
        throw new Exception('All fields are required');
    }

    if ($newPassword !== $confirmPassword) {
        throw new Exception('Passwords do not match');
    }

    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    $stmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
    $stmt->bind_param("si", $hashedPassword, $userId);
    if ($stmt->execute()) {
        writeLog('Password updated successfully for user ID: ' . $userId, 'update-password.log');
        echo json_encode([
            'status' => 'success',
            'message' => 'Password updated successfully'
        ]);
    } else {
        throw new Exception('Failed to update password');
    }
    $stmt->close();

} catch (\Throwable $th) {
    writeLog('Error: ' . $th->getMessage(), 'update-password.log');
    echo json_encode([
        'status' => 'error',
        'message' => 'Error: ' . $th->getMessage()
    ]);
} finally {
    $conn->close();
}
?>