<?php
// Make sure output buffering is on to prevent headers already sent errors
require 'services/open-db.php';
include 'services/logger.php';

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
        }

        $errormsg;
        $isError = false;

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
            mysqli_stmt_execute($stmt);
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
