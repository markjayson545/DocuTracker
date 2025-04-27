<?php
require __DIR__ . '/../../services/open-db.php';
include __DIR__ . '/../../services/logger.php';
session_start();

try {
    $totalRequest = 0;
    $totalApprovedRequests = 0;
    $totalPendingRequests = 0;
    $totalRejectedRequests = 0;

    $requests = [];

    $userId = $_SESSION['user_id'];
    $role = $_SESSION['role'];

    if ($role !== 'admin') {
        writeLog("Unauthorized access attempt by user ID: $userId", "manage-request.log");
        echo json_encode([
            'success' => false,
            'message' => 'Unauthorized access',
            'isAdmin' => false
        ]);
        throw new Exception("Unauthorized access");
    }

    $sqlTotalRequest = "SELECT COUNT(*) as total FROM Request";
    $sqlTotalApprovedRequests = "SELECT COUNT(*) as total FROM Request WHERE status = 'approved'";
    $sqlTotalPendingRequests = "SELECT COUNT(*) as total FROM Request WHERE status = 'pending'";
    $sqlTotalRejectedRequests = "SELECT COUNT(*) as total FROM Request WHERE status = 'rejected'";

    $sqlGetRequests = "SELECT request.request_id, request.user_id, request.document_type_id, request.status, request.updated_at, request.created_at, 
                        client_profile.first_name, client_profile.last_name, 
                        document_type.document_type AS document_type_name,
                        payment.amount AS payment_amount, payment.status AS payment_status
                        FROM Request request
                        JOIN ClientProfile client_profile ON request.user_id = client_profile.user_id
                        JOIN DocumentTypes document_type ON request.document_type_id = document_type.document_type_id
                        JOIN Payment payment ON request.request_id = payment.request_id
                        ORDER BY request.updated_at DESC";

    // Fetch total requests
    $stmt = mysqli_prepare($conn, $sqlTotalRequest);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    $totalRequest = $row['total'];
    mysqli_stmt_close($stmt);
    writeLog("Total requests fetched: $totalRequest", "manage-request.log");

    // Fetch total approved requests
    $stmt = mysqli_prepare($conn, $sqlTotalApprovedRequests);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    $totalApprovedRequests = $row['total'];
    mysqli_stmt_close($stmt);
    writeLog("Total approved requests fetched: $totalApprovedRequests", "manage-request.log");

    // Fetch total pending requests
    $stmt = mysqli_prepare($conn, $sqlTotalPendingRequests);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    $totalPendingRequests = $row['total'];
    mysqli_stmt_close($stmt);
    writeLog("Total pending requests fetched: $totalPendingRequests", "manage-request.log");

    // Fetch total rejected requests
    $stmt = mysqli_prepare($conn, $sqlTotalRejectedRequests);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    $totalRejectedRequests = $row['total'];
    mysqli_stmt_close($stmt);
    writeLog("Total rejected requests fetched: $totalRejectedRequests", "manage-request.log");
    
    // Fetch requests
    $stmt = mysqli_prepare($conn, $sqlGetRequests);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    while ($row = mysqli_fetch_assoc($result)) {
        $requests[] = [
            'request_id' => $row['request_id'],
            'user_id' => $row['user_id'],
            'document_type_id' => $row['document_type_id'],
            'status' => $row['status'],
            'payment_amount' => $row['payment_amount'],
            'payment_status' => $row['payment_status'],
            'updated_at' => $row['updated_at'],
            'created_at' => $row['created_at'],
            'first_name' => $row['first_name'],
            'last_name' => $row['last_name'],
            'document_type_name' => $row['document_type_name']
        ];
    }
    mysqli_stmt_close($stmt);
    writeLog("Requests fetched successfully", "manage-request.log");

    echo json_encode([
        'success' => true,
        'total_requests' => $totalRequest,
        'total_approved_requests' => $totalApprovedRequests,
        'total_pending_requests' => $totalPendingRequests,
        'total_rejected_requests' => $totalRejectedRequests,
        'requests' => $requests
    ]);

} catch (\Throwable $th) {
    writeLog("Error: " . $th->getMessage(), "manage-request.log");
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while processing your request.',
        'error' => $th->getMessage()
    ]);
    exit;
} finally {
    $conn->close();
}


?>