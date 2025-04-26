<?php
require 'open-db.php';
include 'logger.php';

// get cookie token
try {
    session_start();
    $cookieToken = $_COOKIE['session_token'] ?? null;
    if ($cookieToken) {
        // Check if the token exists in the database
        $sql = "SELECT * FROM SessionTokens WHERE token = ?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, 's', $cookieToken);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $sessionData = mysqli_fetch_assoc($result);

        if ($sessionData) {
            // Token is valid
            $sql = "SELECT * FROM User WHERE id = ?";
            $stmt = mysqli_prepare($conn, $sql);
            mysqli_stmt_bind_param($stmt, 'i', $sessionData['user_id']);
            mysqli_stmt_execute($stmt);
            $result = mysqli_stmt_get_result($stmt);
            $userData = mysqli_fetch_assoc($result);

            if ($userData) {
                $_SESSION['user_id'] = $sessionData['user_id'];
                $_SESSION['token'] = $cookieToken;
                $_SESSION['is_verified'] = $userData['is_verified'];
                $_SESSION['role'] = $userData['role'];
                $_SESSION['email'] = $userData['email'];
                $_SESSION['username'] = $userData['username'];

                echo json_encode(
                    [
                        'status' => 'success',
                        'message' => 'Session valid',
                        'data' => $userData
                    ]
                );
            }
        } else {
            // Token is invalid
            echo json_encode(
                [
                    'status' => 'error',
                    'message' => 'Invalid session token'
                ]
            );
            exit;
        }
    } else if ($_SESSION['token']) {
        // Session token is valid but not in the database
        echo json_encode(
            [
                'status' => 'success',
                'message' => 'Session valid but token not found in database',
                'data' => $_SESSION
            ]
        );
        exit;
    } else {
        echo json_encode(
            [
                'status' => 'error',
                'message' => 'No session token found'
            ]
        );
        exit;
    }
} catch (Exception $e) {
    writeLog("Error: " . $e->getMessage(), "check-session.log");
    echo json_encode(
        [
            'status' => 'error',
            'message' => 'Database connection error',
            'error' => $e->getMessage()
        ]
    );
    exit;
} finally {
    mysqli_close($conn);
}
