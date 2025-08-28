<?php

require __DIR__ . '/../../services/open-db.php';
include __DIR__ . '/../../services/logger.php';

session_start();
$userId = $_SESSION['user_id'];

try {
    if (!isset($userId)) {
        throw new Exception('User ID is not set in session.');
    }

    $fetchedData = [];

    $getAllRequestsSql = "SELECT request.request_id, request.document_type_id, request.document_path, request.status, request.created_at, request.updated_at, 
                            payment.mode_of_payment, payment.amount, payment.status AS payment_status, 
                            document_type.document_type
                            FROM Request request
                            JOIN Payment payment ON request.request_id = payment.request_id
                            JOIN DocumentTypes document_type ON request.document_type_id = document_type.document_type_id
                            WHERE request.user_id = ?
                            ORDER BY request.created_at DESC";

    $getTotalRequestSql = "SELECT COUNT(user_id) AS total_requests FROM Request WHERE user_id = ?";
    $getTotalPendingRequestsSql = "SELECT COUNT(*) AS total_pending_requests FROM Request WHERE user_id = ? AND status = 'pending'";
    $getTotalApprovedRequestsSql = "SELECT COUNT(*) AS total_approved_requests FROM Request WHERE user_id = ? AND status = 'approved'";
    $getTotalRejectedRequestsSql = "SELECT COUNT(*) AS total_rejected_requests FROM Request WHERE user_id = ? AND status = 'rejected'";


    // Fetch total document requests of the user
    $stmt = $conn->prepare($getAllRequestsSql);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $requests = [];
    while ($row = $result->fetch_assoc()) {
        $requests[] = [
            'request_id' => $row['request_id'],
            'document_type_id' => $row['document_type_id'],
            'document_type' => $row['document_type'],
            'mode_of_payment' => $row['mode_of_payment'],
            'amount' => $row['amount'],
            'payment_status' => $row['payment_status'],
            'status' => $row['status'],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
            'document_path' => $row['document_path']
        ];
    }
    $stmt->close();
    if ($requests) {
        $fetchedData['requests'] = $requests;
    }

    // Fetch total document requests of the user
    $stmt = $conn->prepare($getTotalRequestSql);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $totalRequest = $result->fetch_assoc();
    $stmt->close();
    if ($totalRequest) {
        $fetchedData['total_requests'] = $totalRequest['total_requests'];
    }

    // Fetch total pending requests
    $stmt = $conn->prepare($getTotalPendingRequestsSql);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $totalPendingRequests = $result->fetch_assoc();
    $stmt->close();
    if ($totalPendingRequests) {
        $fetchedData['total_pending_requests'] = $totalPendingRequests['total_pending_requests'];
    }

    // Fetch total approved requests
    $stmt = $conn->prepare($getTotalApprovedRequestsSql);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $totalApprovedRequests = $result->fetch_assoc();
    $stmt->close();
    if ($totalApprovedRequests) {
        $fetchedData['total_approved_requests'] = $totalApprovedRequests['total_approved_requests'];
    }

    // Fetch total rejected requests
    $stmt = $conn->prepare($getTotalRejectedRequestsSql);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $totalRejectedRequests = $result->fetch_assoc();
    $stmt->close();
    if ($totalRejectedRequests) {
        $fetchedData['total_rejected_requests'] = $totalRejectedRequests['total_rejected_requests'];
    }

    echo json_encode(
        [
            'success' => true,
            'data' => $fetchedData
        ]
    );

} catch (\Throwable $th) {
    writeLog("Error fetching user request history: " . $th->getMessage(), "user-request-history.log");
    $fetchedData['error'] = "An error occurred while fetching the request history.";
    echo json_encode(
        [
            'success' => false,
            'message' => 'Error fetching user request history',
            'error' => $th->getMessage()
        ]
    );
} finally {
    $conn->close();
    writeLog("User request history fetched successfully", "user-request-history.log");
}
