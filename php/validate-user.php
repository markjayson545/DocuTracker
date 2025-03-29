<?php

try {
    $servername = "localhost";
    $username = "root";
    $password = "";
    $dbname = "docutracker";

    $conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    $email = $_POST['email'];
    $userPassword = $_POST['password'];

    // Use prepared statement to prevent SQL injection
    $sql = "SELECT * FROM User WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        
        // Verify password - assuming passwords are stored with password_hash()
        // If passwords are stored in plaintext, you should consider updating your system
        if (password_verify($userPassword, $user['password']) || $userPassword === $user['password']) {
            // Remove password from data sent to client
            unset($user['password']);
            
            echo json_encode([
                'status' => 'success',
                'message' => 'User found',
                'data' => $user
            ]);
        } else {
            echo json_encode([
                'status' => 'error',
                'message' => 'Invalid password',
                'data' => null
            ]);
        }
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Email not found',
            'data' => null
        ]);
    }

    $stmt->close();
    $conn->close();

} catch (\Throwable $th) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Database connection failed: ' . $th->getMessage(),
        'data' => null
    ]);
    exit();
}
