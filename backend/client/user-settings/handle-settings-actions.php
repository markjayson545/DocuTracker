<?php
require __DIR__ . '/../../services/open-db.php';
include __DIR__ . '/../../services/logger.php';
session_start();

function validateUserPassword($userId, $password)
{
    // Validate the user ID and password
    if (empty($userId) || empty($password)) {
        writeLog("validateUserPassword: Empty userId or password", "user-settings.log");
        return false;
    }

    global $conn;
    $sql = "SELECT password FROM User WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $hashedPassword = null;
    $stmt->bind_result($hashedPassword);
    $stmt->fetch();
    $stmt->close();

    $result = password_verify($password, $hashedPassword);
    writeLog("validateUserPassword for userId: $userId - Result: " . ($result ? "true" : "false"), "user-settings.log");
    return $result;
}

function checkDuplicate($value, $column, $userId)
{
    global $conn;
    $stmt = $conn->prepare("SELECT COUNT(*) FROM User WHERE $column = ? AND id != ?");
    $stmt->bind_param("si", $value, $userId);
    $stmt->execute();
    $stmt->bind_result($count);
    $stmt->fetch();
    $stmt->close();
    return $count > 0;
}

function updateUserNameEmailPhone($userId, $userName, $email, $phone)
{
    global $conn;

    $errors = null;

    // Check for duplicates
    if (checkDuplicate($userName, 'username', $userId)) {
        $errors = 'Username, ';
    }
    if (checkDuplicate($email, 'email', $userId)) {
        if ($errors) {
            $errors .= ' ';
        }
        $errors .= 'Email, ';
    }
    if (checkDuplicate($phone, 'phone', $userId)) {
        if ($errors) {
            $errors .= ' ';
        }
        $errors .= 'Phone number ';
    }

    // If there are no errors, update the user information
    if ($errors === null) {
        $stmt = $conn->prepare("UPDATE User SET username = ?, email = ?, phone = ? WHERE id = ?");
        $stmt->bind_param("sssi", $userName, $email, $phone, $userId);
        $stmt->execute();
        $stmt->close();
        writeLog("User settings updated for user ID: $userId", "user-settings.log");
    }

    // If there are errors, return them
    if ($errors) {
        $errors = rtrim($errors, ', ');
        $errors .= ' already exists.';
    }

    return $errors;
}

function updateUserPassword($userId, $newPassword)
{
    global $conn;
    // Update user password
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    $stmt = $conn->prepare("UPDATE User SET password = ? WHERE id = ?");
    $stmt->bind_param("si", $hashedPassword, $userId);
    $stmt->execute();
    $stmt->close();
    writeLog("User password updated for user ID: $userId", "user-settings.log");
}

try {
    $userId = $_SESSION['user_id'] ?? null;
    $action = $_POST['action'] ?? null;

    switch ($action) {
        case 'updateUserInfo':
            $userName = $_POST['username'] ?? null;
            $email = $_POST['email'] ?? null;
            $phone = $_POST['phone'] ?? null;
            $password = $_POST['password'] ?? null;
            if (validateUserPassword($userId, $password) === false) {
                throw new Exception('Invalid password.');
            }
            $updateError = updateUserNameEmailPhone($userId, $userName, $email, $phone);
            if ($updateError) {
                throw new Exception($updateError);
            } else {
                echo json_encode(['success' => true, 'message' => 'User information updated successfully.']);
            }
            break;

        case 'updateUserPassword':
            $currentPassword = $_POST['current_password'] ?? null;
            $newPassword = $_POST['new_password'] ?? null;
            $confirmPassword = $_POST['confirm_password'] ?? null;

            writeLog("updateUserPassword attempt - userID: $userId", "user-settings.log");

            if (!validateUserPassword($userId, $currentPassword)) {
                throw new Exception('Current password is incorrect.');
            }
            
            if ($newPassword !== $confirmPassword) {
                throw new Exception('New password and confirmation do not match.');
            }
            
            if (strlen($newPassword) < 8) {
                throw new Exception('Password must be at least 8 characters long.');
            }
            
            updateUserPassword($userId, $newPassword);
            echo json_encode(['success' => true, 'message' => 'Password updated successfully.']);
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Invalid action.', 'action' => $action]);
    }
} catch (\Throwable $th) {
    writeLog("Error in handle-settings-actions.php: " . $th->getMessage(), "user-settings.log");
    echo json_encode(['success' => false, 'message' => 'An error occurred: ' . $th->getMessage()]);
}
