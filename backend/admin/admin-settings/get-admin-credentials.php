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
    
    // Check if it's a GET request
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Get the action type from the request
        $action = isset($_GET['action']) ? $_GET['action'] : '';
        
        switch ($action) {
            case 'getUsername':
                $username = getCurrentUsername($conn, $admin_id);
                $response = [
                    'success' => true,
                    'username' => $username
                ];
                break;
            
            case 'getEmail':
                $email = getCurrentEmail($conn, $admin_id);
                $response = [
                    'success' => true,
                    'email' => $email
                ];
                break;
            
            case 'getUserInfo':
                $username = getCurrentUsername($conn, $admin_id);
                $email = getCurrentEmail($conn, $admin_id);
                $response = [
                    'success' => true,
                    'username' => $username,
                    'email' => $email
                ];
                break;
            
            default:
                throw new Exception("Invalid action specified");
        }
    } else {
        throw new Exception("Invalid request method");
    }
    
    // Send response
    header('Content-Type: application/json');
    echo json_encode($response);
    
} catch (Exception $e) {
    $response = [
        'success' => false,
        'message' => $e->getMessage()
    ];
    
    writeLog("Admin credentials fetch error: " . $e->getMessage(), 'admin_credentials_fetch.log');
    
    // Send error response
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
?>
