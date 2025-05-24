<?php
require __DIR__ . '/../../services/open-db.php';
include __DIR__ . '/../../services/logger.php';
session_start();
$userId = $_SESSION['user_id'];


try {
    writeLog('Fetching document request details', 'info.log');
    if (!isset($userId)) {
        throw new Exception('User ID is not set in session.');
    }
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method.');
    }
    if (!isset($_POST['request_id'])) {
        throw new Exception('Request ID is not set.');
    }
    $requestId = $_POST['request_id'];

    $fetchedData = [];

    $sqlGetRequestDetails = "SELECT request.request_id, request.document_type_id, request.document_path, request.status, request.created_at, request.updated_at,
                            document_type.document_type,
                            payment.mode_of_payment, payment.amount, payment.status AS payment_status, payment.created_at AS payment_created_at
                            FROM Request request
                            JOIN Payment payment ON request.request_id = payment.request_id
                            JOIN DocumentTypes document_type ON request.document_type_id = document_type.document_type_id
                            WHERE request.request_id = ? AND request.user_id = ?
                            LIMIT 1";

    // Fetch document request details
    $stmt = $conn->prepare($sqlGetRequestDetails);
    $stmt->bind_param("ii", $requestId, $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $requestDetails = [];
    while ($row = $result->fetch_assoc()) {
        $requestDetails[] = [
            'request_id' => $row['request_id'],
            'document_type_id' => $row['document_type_id'],
            'document_type' => $row['document_type'],
            'mode_of_payment' => $row['mode_of_payment'],
            'amount' => $row['amount'],
            'payment_status' => $row['payment_status'],
            'payment_created_at' => $row['payment_created_at'],
            'status' => $row['status'],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
            'document_path' => $row['document_path']
        ];
    }
    $stmt->close();
    if ($requestDetails) {
        $fetchedData['request_details'] = $requestDetails;
    } else {
        throw new Exception('No request details found.');
    }

    $sqlGetRequestHistory = "SELECT * FROM RequestLog WHERE request_id = ? ORDER BY created_at ASC";
    // Fetch request history
    $stmt = $conn->prepare($sqlGetRequestHistory);
    $stmt->bind_param("i", $requestId);
    $stmt->execute();
    $result = $stmt->get_result();
    $requestHistory = [];
    while ($row = $result->fetch_assoc()) {
        $requestHistory[] = [
            'log_id' => $row['log_id'],
            'request_id' => $row['request_id'],
            'status' => $row['status'],
            'created_at' => $row['created_at']
        ];
    }
    $stmt->close();
    if ($requestHistory) {
        $fetchedData['request_history'] = $requestHistory;
    } else {
        throw new Exception('No request history found.');
    }

    echo json_encode(
        [
            'success' => true,
            'message' => 'Document request details fetched successfully',
            'data' => $fetchedData
        ]
    );

} catch (\Throwable $th) {
    echo json_encode(
        [
            'success' => false,
            'message' => 'Error fetching document request details',
            'error' => $th->getMessage(),
            'data' => $_POST
        ]
    );
} finally {
    $conn->close();
}

?>
