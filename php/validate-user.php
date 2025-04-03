<?php

try {
    require 'open-db.php';
    include 'logger.php';

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $email = trim($_POST['email']);
        $password = trim($_POST['password']);
        if (empty($email) || empty($password)) {
            echo json_encode([
                'success' => false,
                'message' => 'Username and password are required',
                'data' => $_POST
            ]);
            exit;
        }
        
        $sql = "SELECT * FROM User WHERE email = ?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, 's', $email);
        mysqli_stmt_execute($stmt); 
        $result = mysqli_stmt_get_result($stmt);
        $user = mysqli_fetch_assoc($result);

        if ($user && password_verify($password, $user['password'])) {
            writeLog("Successful login attempt for $email", "sign-in.log");

            // Start a session
            session_start();
            
            $userId = $user['id'];
            $token = bin2hex(random_bytes(32));

            // Update the session token
            $_SESSION['user'] = $userId;
            $_SESSION['token'] = $token;
            $_SESSION['is_verified'] = $user['is_verified'];
            $_SESSION['is_admin'] = $user['is_admin'];

            writeLog("Session token for $email: $token", "sign-in.log");

            echo json_encode([
                'success' => true,
                'message' => 'Login successful redirecting...',
                'data' => $user
            ]);
        } else {
            writeLog("Failed login attempt for $email", "sign-in.log");
            echo json_encode([
                'success' => false,
                'message' => 'Invalid username or password',
                'data' => $_POST
            ]);
        }
    } else {
        echo json_encode(['error' => 'Invalid request method']);
    }

    if (isset($conn)) {
        mysqli_close($conn);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred',
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
?>