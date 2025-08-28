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

    // Pagination parameters
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = 10; // Fixed limit of 10 results per page
    $offset = ($page - 1) * $limit;

    // Search parameter
    $search = isset($_GET['search']) ? mysqli_real_escape_string($conn, $_GET['search']) : '';
    $hasSearch = !empty($search);

    $sqlTotalRequest = "SELECT COUNT(*) as total FROM Request";
    $sqlTotalApprovedRequests = "SELECT COUNT(*) as total FROM Request WHERE status = 'approved'";
    $sqlTotalPendingRequests = "SELECT COUNT(*) as total FROM Request WHERE status = 'pending'";
    $sqlTotalRejectedRequests = "SELECT COUNT(*) as total FROM Request WHERE status = 'rejected'";

    // Base SQL for fetching requests
    $sqlGetRequests = "SELECT request.request_id, request.user_id, request.document_type_id, request.status, request.updated_at, request.created_at, 
                        client_profile.first_name, client_profile.last_name, 
                        document_type.document_type AS document_type_name,
                        payment.amount AS payment_amount, payment.status AS payment_status
                        FROM Request request
                        JOIN ClientProfile client_profile ON request.user_id = client_profile.user_id
                        JOIN DocumentTypes document_type ON request.document_type_id = document_type.document_type_id
                        JOIN Payment payment ON request.request_id = payment.request_id";
    
    // Count SQL for pagination with search parameters
    $sqlCountRequests = "SELECT COUNT(*) as total
                        FROM Request request
                        JOIN ClientProfile client_profile ON request.user_id = client_profile.user_id
                        JOIN DocumentTypes document_type ON request.document_type_id = document_type.document_type_id";
    
    // Add search conditions if search term exists
    if ($hasSearch) {
        // Check if search is likely a request ID (numeric only or starts with REQ-)
        if (is_numeric($search) || preg_match('/^REQ-(\d+)$/i', $search, $matches)) {
            // Extract numeric part if it starts with REQ-
            $searchId = is_numeric($search) ? $search : $matches[1];
            
            $searchCondition = " WHERE (request.request_id = ? OR 
                                      client_profile.first_name LIKE ? OR 
                                      client_profile.last_name LIKE ? OR 
                                      CONCAT(client_profile.first_name, ' ', client_profile.last_name) LIKE ? OR
                                      document_type.document_type LIKE ?)";
            $sqlGetRequests .= $searchCondition;
            $sqlCountRequests .= $searchCondition;
        } else {
            $searchCondition = " WHERE (client_profile.first_name LIKE ? OR 
                                      client_profile.last_name LIKE ? OR 
                                      CONCAT(client_profile.first_name, ' ', client_profile.last_name) LIKE ? OR
                                      document_type.document_type LIKE ? OR
                                      CAST(request.request_id AS CHAR) LIKE ?)";
            $sqlGetRequests .= $searchCondition;
            $sqlCountRequests .= $searchCondition;
        }
    }
    
    // Add order by and pagination
    $sqlGetRequests .= " ORDER BY request.updated_at DESC LIMIT ? OFFSET ?";

    // Fetch total requests
    $stmt = mysqli_prepare($conn, $sqlTotalRequest);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    $totalRequest = $row['total'];
    mysqli_stmt_close($stmt);

    // Fetch total approved requests
    $stmt = mysqli_prepare($conn, $sqlTotalApprovedRequests);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    $totalApprovedRequests = $row['total'];
    mysqli_stmt_close($stmt);

    // Fetch total pending requests
    $stmt = mysqli_prepare($conn, $sqlTotalPendingRequests);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    $totalPendingRequests = $row['total'];
    mysqli_stmt_close($stmt);

    // Fetch total rejected requests
    $stmt = mysqli_prepare($conn, $sqlTotalRejectedRequests);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    $totalRejectedRequests = $row['total'];
    mysqli_stmt_close($stmt);

    // Get total count of filtered requests for pagination
    $stmtCount = mysqli_prepare($conn, $sqlCountRequests);
    if ($hasSearch) {
        if (is_numeric($search) || preg_match('/^REQ-(\d+)$/i', $search, $matches)) {
            $searchId = is_numeric($search) ? $search : $matches[1];
            $fuzzySearch = "%$search%";
            mysqli_stmt_bind_param($stmtCount, "issss", $searchId, $fuzzySearch, $fuzzySearch, $fuzzySearch, $fuzzySearch);
        } else {
            $searchParam = "%$search%";
            mysqli_stmt_bind_param($stmtCount, "sssss", $searchParam, $searchParam, $searchParam, $searchParam, $searchParam);
        }
    }
    mysqli_stmt_execute($stmtCount);
    $resultCount = mysqli_stmt_get_result($stmtCount);
    $rowCount = mysqli_fetch_assoc($resultCount);
    $totalFilteredRequests = $rowCount['total'];
    mysqli_stmt_close($stmtCount);

    // Calculate total pages for pagination
    $totalPages = ceil($totalFilteredRequests / $limit);
    
    // Fetch requests with pagination and search
    $stmt = mysqli_prepare($conn, $sqlGetRequests);
    if ($hasSearch) {
        if (is_numeric($search) || preg_match('/^REQ-(\d+)$/i', $search, $matches)) {
            $searchId = is_numeric($search) ? $search : $matches[1];
            $fuzzySearch = "%$search%";
            mysqli_stmt_bind_param($stmt, "issssii", $searchId, $fuzzySearch, $fuzzySearch, $fuzzySearch, $fuzzySearch, $limit, $offset);
        } else {
            $searchParam = "%$search%";
            mysqli_stmt_bind_param($stmt, "sssssii", $searchParam, $searchParam, $searchParam, $searchParam, $searchParam, $limit, $offset);
        }
    } else {
        mysqli_stmt_bind_param($stmt, "ii", $limit, $offset);
    }
    
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
    
    writeLog("Requests fetched: " . count($requests) . ", Page: $page, Search: $search", "manage-request.log");

    echo json_encode([
        'success' => true,
        'total_requests' => $totalRequest,
        'total_approved_requests' => $totalApprovedRequests,
        'total_pending_requests' => $totalPendingRequests,
        'total_rejected_requests' => $totalRejectedRequests,
        'requests' => $requests,
        'pagination' => [
            'current_page' => $page,
            'total_pages' => $totalPages,
            'total_results' => $totalFilteredRequests,
            'limit' => $limit
        ]
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