<?php
require __DIR__ . '/../services/open-db.php';
include __DIR__ . '/../services/logger.php';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $username = trim($_POST['username']);
        $phone = trim($_POST['phone']);
        $email = trim($_POST['email']);
        $password = trim($_POST['password']);
        $confirmPassword = trim($_POST['confirm-password']);

        if (empty($username) || empty($password)) {
            echo json_encode(
                [
                    'success' => false,
                    'message' => 'All fields are required',
                    'data' => $_POST
                ]
            );
            exit;
        }

        $errormsg;
        $isError = false;

        // Begin transaction
        mysqli_begin_transaction($conn);

        // Username Validation
        $sql = "SELECT id FROM User WHERE username = ?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "s", $username);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_store_result($stmt);

        if (mysqli_stmt_num_rows($stmt) > 0) {
            $isError = true;
            $errormsg = 'Username already exists';
        }

        // Phone Number Validation
        $sql = "SELECT id FROM User WHERE phone = ?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "s", $phone);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_store_result($stmt);

        if (mysqli_stmt_num_rows($stmt) > 0) {
            $isError = true;
            $errormsg = 'Phone Number already exists';
        }

        // Email Address Validation
        $sql = "SELECT id FROM User WHERE email = ?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "s", $email);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_store_result($stmt);

        if (mysqli_stmt_num_rows($stmt) > 0) {
            $isError = true;
            $errormsg = 'Email Address already exists';
        }

        if ($isError === false) {
            // Hash the password
            $passwordHash = password_hash($password, PASSWORD_BCRYPT);

            // Prepare Statement
            $sql = "INSERT INTO User (username, phone, email, password) VALUES (?, ?, ?, ?)";
            $stmt = mysqli_prepare($conn, $sql);
            mysqli_stmt_bind_param($stmt, "ssss", $username, $phone, $email, $passwordHash);
            
            if (mysqli_stmt_execute($stmt)) {
                mysqli_commit($conn);
                mysqli_stmt_close($stmt);
                writeLog("User $username created successfully", 'sign-up.log');
                echo json_encode(
                    [
                        'success' => true,
                        'message' => 'User created successfully',
                        'data' => $_POST
                    ]
                );
            } else {
                throw new Exception("Failed to create user: " . mysqli_error($conn));
            }
        } else {
            mysqli_rollback($conn);
            echo json_encode(
                [
                    'success' => false,
                    'message' => $errormsg,
                    'data' => $_POST
                ]
            );
        }
    } else {
        writeLog('Invalid request method', 'sign-up.log');
        echo json_encode(['error' => 'Invalid request method']);
    }
} catch (\Throwable $th) {
    mysqli_rollback($conn);
    writeLog($th->getMessage(), 'sign-up.log');
    echo json_encode(
        [
            'success' => false,
            'message' => $th->getMessage(),
            'data' => $_POST
        ]
    );
}

mysqli_close($conn);
