<?php
include 'logger.php';


session_start();
if (!isset($_SESSION['user'])) {
    echo json_encode(
        [
            'status' => 'error',
            'message' => 'Invalid session'
        ]
    );
    exit;
}
echo json_encode(
    [
        'status' => 'success',
        'message' => 'Session valid',
        'data' => $_SESSION
    ]
);
