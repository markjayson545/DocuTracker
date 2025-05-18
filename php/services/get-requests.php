<?php
require 'open-db.php';
include 'logger.php';
session_start();

function getRequest($requestId){
    global $conn;
    $sql = "SELECT req.*, req.document_path, doc.document_type AS document_name, 
    pay.status AS payment_status, pay.amount AS payment_amount, 
    pay.created_at AS payment_date, pay.mode_of_payment AS payment_method
    FROM Request req
    LEFT JOIN DocumentTypes doc ON req.document_type_id = doc.document_type_id
    LEFT JOIN Payment pay ON req.request_id = pay.request_id
    WHERE req.request_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $requestId);
    $stmt->execute();
    $result = $stmt->get_result();
    $request = $result->fetch_assoc();
    return $request;
}

try {
    
    $action = $_GET['action'] ?? null;
    $requestId = $_GET['request_id'] ?? null;

    switch ($action) {
        case 'getRequest':
            if (!$requestId) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Request ID not provided'
                ]);
                exit();
            }
            $request = getRequest($requestId);
            if ($request) {
                echo json_encode([
                    'success' => true,
                    'data' => $request
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Request not found'
                ]);
            }
            break;
        default:
            echo json_encode([
                'success' => false,
                'message' => 'Invalid action'
            ]);
    }
    

} catch (Exception $e) {
    writeLog("Error: " . $e->getMessage(), "get-requests.log");
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while processing your request' . $e->getMessage()
    ]);
} finally {
    $conn->close();
}

?>