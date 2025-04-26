<?php

try {
    require __DIR__ . '/../services/open-db.php';
    include __DIR__ . '/../services/logger.php';

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $email = trim($_POST['email']);
        $password = trim($_POST['password']);
        $remember = $_POST['remember-me'] ?? false;
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
            $_SESSION['user_id'] = $userId;
            $_SESSION['token'] = $token;
            $_SESSION['is_verified'] = $user['is_verified'];
            $_SESSION['role'] = $user['role'];
            $_SESSION['email'] = $user['email'];
            $_SESSION['username'] = $user['username'];

            writeLog("Session token for $email: $token", "sign-in.log");

            // Insert the session token into the database
            if ($remember) {
                $sql = "INSERT INTO SessionTokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))";
                $stmt = mysqli_prepare($conn, $sql);
                mysqli_stmt_bind_param($stmt, 'is', $userId, $token);
                mysqli_stmt_execute($stmt);
                mysqli_stmt_close($stmt);
                writeLog("Session token stored in database for $email", "sign-in.log");
                // Set the session token as a cookie
                setcookie('session_token', $token, time() + (86400 * 30), "/"); // 30 days expiration
                writeLog("Session token cookie set for $email", "sign-in.log");
            }

            echo json_encode([
                'success' => true,
                'message' => 'Login successful redirecting...',
                'data' => $user,
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
    writeLog("Error: " . $e->getMessage(), "error.log");
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred',
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
