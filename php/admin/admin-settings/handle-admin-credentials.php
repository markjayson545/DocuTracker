<?php
require __DIR__ . '/../../services/open-db.php';
include __DIR__ . '/../../services/logger.php';
session_start();

try {
    // Check if the user is logged in and is an admin
    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
        throw new Exception("Unauthorized access");
    }
    
    $admin_id = $_SESSION['user_id'];
    $response = ['success' => false, 'message' => ''];
    
    // Check if it's a POST request
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Get the action type from the form
        $action = isset($_POST['action']) ? $_POST['action'] : '';
        
        switch ($action) {
            case 'changeUsername':
                handleUsernameChange($conn, $admin_id);
                break;
            
            case 'changeEmail':
                handleEmailChange($conn, $admin_id);
                break;
            
            case 'changePassword':
                handlePasswordChange($conn, $admin_id);
                break;
            
            default:
                throw new Exception("Invalid action specified");
        }
    } else {
        throw new Exception("Invalid request method");
    }
} catch (Exception $e) {
    $response = [
        'success' => false,
        'message' => $e->getMessage()
    ];
    
    writeLog("Admin credentials update error: " . $e->getMessage(), 'admin_credentials_update.log');
    
    // Send error response
    header('Content-Type: application/json');
    echo json_encode($response);
}

/**
 * Handle username change request
 */
function handleUsernameChange($conn, $admin_id) {
    $new_username = trim($_POST['new_username']);
    $password = $_POST['confirm_password_username']; // Added password requirement
    
    // Validate username
    if (empty($new_username)) {
        throw new Exception("Username cannot be empty");
    }
    
    if (strlen($new_username) < 3 || strlen($new_username) > 30) {
        throw new Exception("Username must be between 3 and 30 characters");
    }
    
    // Verify current password
    $pwd_stmt = $conn->prepare("SELECT password FROM User WHERE id = ?");
    $pwd_stmt->bind_param("i", $admin_id);
    $pwd_stmt->execute();
    $pwd_result = $pwd_stmt->get_result();
    
    if ($pwd_result->num_rows !== 1) {
        throw new Exception("User not found");
    }
    
    $user_data = $pwd_result->fetch_assoc();
    if (!password_verify($password, $user_data['password'])) {
        throw new Exception("Incorrect password");
    }
    
    // Check if username already exists
    $check_stmt = $conn->prepare("SELECT id FROM User WHERE username = ? AND id != ?");
    $check_stmt->bind_param("si", $new_username, $admin_id);
    $check_stmt->execute();
    $result = $check_stmt->get_result();
    
    if ($result->num_rows > 0) {
        throw new Exception("Username already exists. Please choose a different one.");
    }
    
    // Update username
    $update_stmt = $conn->prepare("UPDATE User SET username = ? WHERE id = ?");
    $update_stmt->bind_param("si", $new_username, $admin_id);
    
    if ($update_stmt->execute()) {
        $_SESSION['username'] = $new_username;
        writeLog("Admin (ID: $admin_id) changed username to: $new_username", "admin_activity.log");
        
        $response = [
            'success' => true,
            'message' => 'Username updated successfully'
        ];
    } else {
        throw new Exception("Failed to update username: " . $conn->error);
    }
    
    // Send response
    header('Content-Type: application/json');
    echo json_encode($response);
}

/**
 * Fetch the current username for an admin
 */
function getCurrentUsername($conn, $admin_id) {
    $stmt = $conn->prepare("SELECT username FROM User WHERE id = ?");
    $stmt->bind_param("i", $admin_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows !== 1) {
        throw new Exception("User not found");
    }
    
    $user_data = $result->fetch_assoc();
    return $user_data['username'];
}

/**
 * Fetch the current email for an admin
 */
function getCurrentEmail($conn, $admin_id) {
    $stmt = $conn->prepare("SELECT email FROM User WHERE id = ?");
    $stmt->bind_param("i", $admin_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows !== 1) {
        throw new Exception("User not found");
    }
    
    $user_data = $result->fetch_assoc();
    return $user_data['email'];
}

/**
 * Handle email change request
 */
function handleEmailChange($conn, $admin_id) {
    $new_email = trim($_POST['new_email']);
    $password = $_POST['confirm_password_email'];
    
    // Validate email
    if (empty($new_email) || !filter_var($new_email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Please enter a valid email address");
    }
    
    // Verify current password
    $pwd_stmt = $conn->prepare("SELECT password FROM User WHERE id = ?");
    $pwd_stmt->bind_param("i", $admin_id);
    $pwd_stmt->execute();
    $pwd_result = $pwd_stmt->get_result();
    
    if ($pwd_result->num_rows !== 1) {
        throw new Exception("User not found");
    }
    
    $user_data = $pwd_result->fetch_assoc();
    if (!password_verify($password, $user_data['password'])) {
        throw new Exception("Incorrect password");
    }
    
    // Check if email already exists
    $check_stmt = $conn->prepare("SELECT id FROM User WHERE email = ? AND id != ?");
    $check_stmt->bind_param("si", $new_email, $admin_id);
    $check_stmt->execute();
    $result = $check_stmt->get_result();
    
    if ($result->num_rows > 0) {
        throw new Exception("Email already in use. Please choose a different one.");
    }
    
    // Update email
    $update_stmt = $conn->prepare("UPDATE User SET email = ? WHERE id = ?");
    $update_stmt->bind_param("si", $new_email, $admin_id);
    
    if ($update_stmt->execute()) {
        $_SESSION['email'] = $new_email;
        writeLog("Admin (ID: $admin_id) changed email to: $new_email", "admin_activity.log");
        
        $response = [
            'success' => true,
            'message' => 'Email updated successfully'
        ];
    } else {
        throw new Exception("Failed to update email: " . $conn->error);
    }
    
    // Send response
    header('Content-Type: application/json');
    echo json_encode($response);
}

/**
 * Handle password change request
 */
function handlePasswordChange($conn, $admin_id) {
    $current_password = $_POST['current_password'];
    $new_password = $_POST['new_password'];
    $confirm_password = $_POST['confirm_new_password'];
    
    // Validate passwords
    if (empty($current_password) || empty($new_password) || empty($confirm_password)) {
        throw new Exception("All password fields are required");
    }
    
    if ($new_password !== $confirm_password) {
        throw new Exception("New passwords do not match");
    }
    
    if (strlen($new_password) < 8) {
        throw new Exception("Password must be at least 8 characters long");
    }
    
    // Verify current password
    $pwd_stmt = $conn->prepare("SELECT password FROM User WHERE id = ?");
    $pwd_stmt->bind_param("i", $admin_id);
    $pwd_stmt->execute();
    $pwd_result = $pwd_stmt->get_result();
    
    if ($pwd_result->num_rows !== 1) {
        throw new Exception("User not found");
    }
    
    $user_data = $pwd_result->fetch_assoc();
    if (!password_verify($current_password, $user_data['password'])) {
        throw new Exception("Current password is incorrect");
    }
    
    // Hash the new password
    $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
    
    // Update password
    $update_stmt = $conn->prepare("UPDATE User SET password = ? WHERE id = ?");
    $update_stmt->bind_param("si", $hashed_password, $admin_id);
    
    if ($update_stmt->execute()) {
        writeLog("Admin (ID: $admin_id) changed their password", "admin_activity.log");
        
        $response = [
            'success' => true,
            'message' => 'Password updated successfully'
        ];
    } else {
        throw new Exception("Failed to update password: " . $conn->error);
    }
    
    // Send response
    header('Content-Type: application/json');
    echo json_encode($response);
}
?>