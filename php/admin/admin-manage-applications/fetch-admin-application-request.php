<?php
require __DIR__ . '/../../services/open-db.php';
include __DIR__ . '/../../services/logger.php';
session_start();


try {
    $totalApplication = 0;
    $totalPendingApplication = 0;
    $totalUnderReviewApplication = 0;
    $totalApprovedApplication = 0;
    $totalRejectedApplication = 0;

    $applications = [];

    $userId = $_SESSION['user_id'];
    $role = $_SESSION['role'];
    if ($role !== 'admin') {
        writeLog("Unauthorized access attempt by user ID: $userId", "admin-dashboard.log");
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

    $sqlGetTotalApplication = "SELECT COUNT(*) as total FROM Application";
    $sqlGetTotalPendingApplication = "SELECT COUNT(*) as total FROM Application WHERE status = 'pending'";
    $sqlGetTotalUnderReviewApplication = "SELECT COUNT(*) as total FROM Application WHERE status = 'under-review'";
    $sqlGetTotalApprovedApplication = "SELECT COUNT(*) as total FROM Application WHERE status = 'approved'";
    $sqlGetTotalRejectedApplication = "SELECT COUNT(*) as total FROM Application WHERE status = 'rejected'";

    // Base SQL for fetching applications with search parameters
    $sqlGetApplications = "SELECT application.*, client_profile.first_name, client_profile.last_name, 
                        (SELECT document_type FROM ApplicationDocuments WHERE application_id = application.application_id ORDER BY created_at DESC LIMIT 1) as document_type
                        FROM Application application
                        JOIN ClientProfile client_profile ON application.user_id = client_profile.user_id";
    
    // Count SQL for pagination with search parameters
    $sqlCountApplications = "SELECT COUNT(DISTINCT application.application_id) as total
                            FROM Application application
                            JOIN ClientProfile client_profile ON application.user_id = client_profile.user_id";
    
    // Add search conditions if search term exists
    if ($hasSearch) {
        $searchCondition = " WHERE (client_profile.first_name LIKE ? OR 
                                client_profile.last_name LIKE ? OR 
                                CONCAT(client_profile.first_name, ' ', client_profile.last_name) LIKE ? OR
                                application.application_id LIKE ?)";
        $sqlGetApplications .= $searchCondition;
        $sqlCountApplications .= $searchCondition;
    }
    
    // Add order by and pagination
    $sqlGetApplications .= " ORDER BY application.updated_at DESC LIMIT ? OFFSET ?";

    // Fetch total application
    $stmt = mysqli_prepare($conn, $sqlGetTotalApplication);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    $totalApplication = $row['total'];
    mysqli_stmt_close($stmt);

    // Fetch total pending application
    $stmt = mysqli_prepare($conn, $sqlGetTotalPendingApplication);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    $totalPendingApplication = $row['total'];
    mysqli_stmt_close($stmt);

    // Fetch total under review application
    $stmt = mysqli_prepare($conn, $sqlGetTotalUnderReviewApplication);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    $totalUnderReviewApplication = $row['total'];
    mysqli_stmt_close($stmt);

    // Fetch total approved application
    $stmt = mysqli_prepare($conn, $sqlGetTotalApprovedApplication);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    $totalApprovedApplication = $row['total'];
    mysqli_stmt_close($stmt);

    // Fetch total rejected application
    $stmt = mysqli_prepare($conn, $sqlGetTotalRejectedApplication);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    $totalRejectedApplication = $row['total'];
    mysqli_stmt_close($stmt);

    // Get total count of filtered applications for pagination
    $stmtCount = mysqli_prepare($conn, $sqlCountApplications);
    if ($hasSearch) {
        $searchParam = "%$search%";
        mysqli_stmt_bind_param($stmtCount, "ssss", $searchParam, $searchParam, $searchParam, $searchParam);
    }
    mysqli_stmt_execute($stmtCount);
    $resultCount = mysqli_stmt_get_result($stmtCount);
    $rowCount = mysqli_fetch_assoc($resultCount);
    $totalFilteredApplications = $rowCount['total'];
    mysqli_stmt_close($stmtCount);

    // Calculate total pages for pagination
    $totalPages = ceil($totalFilteredApplications / $limit);
    
    // Fetch applications with pagination and search
    $stmt = mysqli_prepare($conn, $sqlGetApplications);
    if ($hasSearch) {
        $searchParam = "%$search%";
        mysqli_stmt_bind_param($stmt, "ssssii", $searchParam, $searchParam, $searchParam, $searchParam, $limit, $offset);
    } else {
        mysqli_stmt_bind_param($stmt, "ii", $limit, $offset);
    }
    
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    while ($row = mysqli_fetch_assoc($result)) {
        $applications[] = [
            'application_id' => $row['application_id'],
            'user_id' => $row['user_id'],
            'first_name' => $row['first_name'],
            'last_name' => $row['last_name'],
            'document_type'=> $row['document_type'],
            'status' => $row['status'],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at']
        ];
    }
    mysqli_stmt_close($stmt);
    
    writeLog("Applications fetched: " . count($applications) . ", Page: $page, Search: $search", "admin-application-request.log");

    echo json_encode([
        'success' => true,
        'total_application' => $totalApplication,
        'total_pending_application' => $totalPendingApplication,
        'total_under_review_application' => $totalUnderReviewApplication,
        'total_approved_application' => $totalApprovedApplication,
        'total_rejected_application' => $totalRejectedApplication,
        'applications' => $applications,
        'pagination' => [
            'current_page' => $page,
            'total_pages' => $totalPages,
            'total_results' => $totalFilteredApplications,
            'limit' => $limit
        ]
    ]);

} catch (\Throwable $th) {
    writeLog("Error fetching application request data: " . $th->getMessage(), "admin-application-request.log");
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching application request data',
        'error' => $th->getMessage()
    ]);
} finally {
    $conn->close();
    writeLog("Database connection closed", "admin-application-request.log");
    writeLog("End of application request data fetching", "admin-application-request.log");
}
