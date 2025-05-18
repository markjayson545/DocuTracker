<?php
require __DIR__ . '/../services/open-db.php';
include __DIR__ . '/../services/logger.php';
session_start();

// Set no-cache headers for security
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");
header("Expires: 0");

// Check for token in either session or cookie
$token = null;
if (isset($_SESSION['token'])) {
    $token = $_SESSION['token'];
} elseif (isset($_COOKIE['session_token'])) {
    $token = $_COOKIE['session_token'];
}

if ($token) {
    // Check if the token exists in the database
    $sql = "SELECT * FROM SessionTokens WHERE token = ?";
    $stmt = mysqli_prepare($conn, $sql);
    
    if ($stmt) {
        mysqli_stmt_bind_param($stmt, 's', $token);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        if (mysqli_num_rows($result) > 0) {
            mysqli_stmt_close($stmt);
            
            // Delete the token from database
            $sql = "DELETE FROM SessionTokens WHERE token = ?";
            $stmt = mysqli_prepare($conn, $sql);
            
            if ($stmt) {
                mysqli_stmt_bind_param($stmt, 's', $token);
                mysqli_stmt_execute($stmt);
                mysqli_stmt_close($stmt);
            }
        } else {
            mysqli_stmt_close($stmt);
        }
    }
    
    // Clear the session
    session_unset();
    session_destroy();
    
    // Clear the cookie
    setcookie('session_token', '', time() - 3600, "/", "", true, true); // Secure and HttpOnly flags
    
    // Log with masked token for security
    $maskedToken = substr($token, 0, 4) . '...' . substr($token, -4);
    writeLog("User with token: '" . $maskedToken . "' logged out successfully", "sign-out.log");
    
    echo json_encode([
        'success' => true,
        'message' => 'Logout successful'
    ]);
} else {
    // If we reach here, try to clear any session/cookies anyway
    session_unset();
    session_destroy();
    setcookie('session_token', '', time() - 3600, "/", "", true, true);
    
    echo json_encode([
        'success' => true, // Change to true since we're still performing logout actions
        'message' => 'Logout completed'
    ]);
}

// Close database connection
mysqli_close($conn);
exit;
