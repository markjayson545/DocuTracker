<?php

require 'open-db.php';

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $username = trim($_POST['username']);
        $password = trim($_POST['password']);
        if (empty($username) || empty($password)) {
            echo json_encode(
                [
                    'sucess' => false,
                    'message' => 'Username and password are required',
                    'data' => $_POST
            ]);
            exit;
        }

        $sql = "SELECT * FROM User WHERE username = ?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, 's', $username);
        mysqli_stmt_execute($stmt); 
        $result = mysqli_stmt_get_result($stmt);
        $user = mysqli_fetch_assoc($result);

        if ($user && password_verify($password, $user['password'])) {
            echo json_encode(
                [
                    'success' => true,
                    'message' => 'User authenticated successfully',
                    'data' => $user
                ]
            );
        } else {
            echo json_encode(
                [
                    'success' => false,
                    'message' => 'Invalid username or password',
                    'data' => $_POST
                ]
            );
        }

    } else {
        echo json_encode(['error' => 'Invalid request method']);
    }



    mysqli_close($conn);
?>