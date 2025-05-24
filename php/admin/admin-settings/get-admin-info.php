<?php
require __DIR__ . '/../../services/open-db.php';
session_start();

$response = ['success' => false];

try {
    // Check if user is logged in
    if (!isset($_SESSION['user_id']) || !isset($_SESSION['is_admin']) || $_SESSION['is_admin'] != 1) {
        throw new Exception("Unauthorized access");
    }
    
    $admin_id = $_SESSION['user_id'];
    
    // Get current admin info
    $stmt = $conn->prepare("SELECT username, email FROM users WHERE id = ? AND is_admin = 1");
    $stmt->bind_param("i", $admin_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 1) {
        $admin_data = $result->fetch_assoc();
        
        $response = [
            'success' => true,
            'username' => $admin_data['username'],
            'email' => $admin_data['email']
        ];
    } else {
        throw new Exception("Admin not found");
    }
    
} catch (Exception $e) {
    $response = [
        'success' => false,
        'message' => $e->getMessage()
    ];
}

// Send response
header('Content-Type: application/json');
echo json_encode($response);
?>
