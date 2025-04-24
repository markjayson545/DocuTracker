<?php

require 'services/open-db.php';
include 'services/logger.php';

try {
    $totalRequest = 0;
    $totalApprovedRequests = 0;
    $totalPendingRequests = 0;
    $totalRevenue = 0;
    $totalUsers = 0;
    $totalPendingApplications = 0;
    $totalVerifiedUsers = 0;

    $systemNotifications = [];
    $recentRequests = [];

    session_start();
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

    $sqlTotalRequest = "SELECT COUNT(*) as total FROM Request";
    $sqlTotalApprovedRequests = "SELECT COUNT(*) as total FROM Request WHERE status = 'approved'";
    $sqlTotalPendingRequests = "SELECT COUNT(*) as total FROM Request WHERE status = 'pending'";
    $sqlTotalRevenu = "SELECT SUM(amount) as total FROM Payment";
    $sqlTotalUsers = "SELECT COUNT(*) as total FROM User";
    $sqlTotalPendingApplications = "SELECT COUNT(*) as total FROM Application WHERE status = 'pending'";
    $sqlTotalVerifiedUsers = "SELECT COUNT(*) as total FROM User WHERE is_verified = 1";
    $sqlSystemNotifications = "SELECT * FROM SystemNotification ORDER BY created_at DESC LIMIT 5";

    $sqlRecentRequests = "SELECT request.request_id, request.user_id, request.document_type_id, request.status, request.updated_at, request.created_at, client_profile.first_name, client_profile.last_name, document_type.document_type AS document_type_name
                            FROM Request request
                            JOIN ClientProfile client_profile ON request.user_id = client_profile.user_id
                            JOIN DocumentTypes document_type ON request.document_type_id = document_type.document_type_id
                            ORDER BY request.updated_at DESC LIMIT 5";

    // Fetch total approved requests
    $stmt = mysqli_prepare($conn, $sqlTotalRequest);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    $totalRequest = $row['total'];
    mysqli_stmt_close($stmt);
    writeLog("Total requests fetched: $totalRequest", "admin-dashboard.log");

    // Fetch total approved requests
    $stmt = mysqli_prepare($conn, $sqlTotalApprovedRequests);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    $totalApprovedRequests = $row['total'];
    mysqli_stmt_close($stmt);
    writeLog("Total approved requests fetched: $totalApprovedRequests", "admin-dashboard.log");

    // Fetch total pending requests
    $stmt = mysqli_prepare($conn, $sqlTotalPendingRequests);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    $totalPendingRequests = $row['total'];
    mysqli_stmt_close($stmt);
    writeLog("Total pending requests fetched: $totalPendingRequests", "admin-dashboard.log");

    // Fetch total revenue
    $stmt = mysqli_prepare($conn, $sqlTotalRevenu);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    $totalRevenue = $row['total'];
    mysqli_stmt_close($stmt);
    writeLog("Total revenue fetched: $totalRevenue", "admin-dashboard.log");

    // Fetch total users
    $stmt = mysqli_prepare($conn, $sqlTotalUsers);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    $totalUsers = $row['total'];
    mysqli_stmt_close($stmt);
    writeLog("Total users fetched: $totalUsers", "admin-dashboard.log");

    // Fetch total pending applications
    $stmt = mysqli_prepare($conn, $sqlTotalPendingApplications);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    $totalPendingApplications = $row['total'];
    mysqli_stmt_close($stmt);
    writeLog("Total pending applications fetched: $totalPendingApplications", "admin-dashboard.log");

    // Fetch total verified users
    $stmt = mysqli_prepare($conn, $sqlTotalVerifiedUsers);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    $totalVerifiedUsers = $row['total'];
    mysqli_stmt_close($stmt);
    writeLog("Total verified users fetched: $totalVerifiedUsers", "admin-dashboard.log");

    // Fetch system notifications
    $stmt = mysqli_prepare($conn, $sqlSystemNotifications);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    while ($row = mysqli_fetch_assoc($result)) {
        $systemNotifications[] = $row;
    }

    // Fetch recent requests
    $stmt = mysqli_prepare($conn, $sqlRecentRequests);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    while ($row = mysqli_fetch_assoc($result)) {
        $recentRequests[] = $row;
    }

    mysqli_stmt_close($stmt);
    writeLog("System notifications fetched: " . json_encode($systemNotifications), "admin-dashboard.log");

    mysqli_close($conn);

    writeLog("Admin dashboard data fetched successfully", "admin-dashboard.log");
    echo json_encode([
        'success' => true,
        'isAdmin' => true,
        'message' => 'Admin dashboard data fetched successfully',
        'data' => [
            'totalRequest' => $totalRequest,
            'totalApprovedRequests' => $totalApprovedRequests,
            'totalPendingRequests' => $totalPendingRequests,
            'totalRevenue' => $totalRevenue,
            'totalUsers' => $totalUsers,
            'totalPendingApplications' => $totalPendingApplications,
            'totalVerifiedUsers' => $totalVerifiedUsers,
            'systemNotifications' => $systemNotifications,
            'recentRequests' => $recentRequests
        ]
    ]);
} catch (\Throwable $th) {
    writeLog("Error fetching admin dashboard data: " . $th->getMessage(), "admin-dashboard.log");
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching admin dashboard data',
        'error' => $th->getMessage()
    ]);
}
