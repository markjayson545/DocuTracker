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

    $sqlGetTotalApplication = "SELECT COUNT(*) as total FROM Application";
    $sqlGetTotalPendingApplication = "SELECT COUNT(*) as total FROM Application WHERE status = 'pending'";
    $sqlGetTotalUnderReviewApplication = "SELECT COUNT(*) as total FROM Application WHERE status = 'Under Review'";
    $sqlGetTotalApprovedApplication = "SELECT COUNT(*) as total FROM Application WHERE status = 'approved'";
    $sqlGetTotalRejectedApplication = "SELECT COUNT(*) as total FROM Application WHERE status = 'rejected'";

    $sqlGetApplications = "SELECT application.*, client_profile.first_name, client_profile.last_name
                            FROM Application application
                            JOIN ClientProfile client_profile ON application.user_id = client_profile.user_id
                            ORDER BY application.updated_at DESC LIMIT 5";

    // Fetch total application
    $stmt = mysqli_prepare($conn, $sqlGetTotalApplication);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    $totalApplication = $row['total'];
    mysqli_stmt_close($stmt);
    writeLog("Total applications fetched: $totalApplication", "admin-application-request.log");

    // Fetch total pending application
    $stmt = mysqli_prepare($conn, $sqlGetTotalPendingApplication);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    $totalPendingApplication = $row['total'];
    mysqli_stmt_close($stmt);
    writeLog("Total pending applications fetched: $totalPendingApplication", "admin-application-request.log");

    // Fetch total under review application
    $stmt = mysqli_prepare($conn, $sqlGetTotalUnderReviewApplication);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    $totalUnderReviewApplication = $row['total'];
    mysqli_stmt_close($stmt);
    writeLog("Total under review applications fetched: $totalUnderReviewApplication", "admin-application-request.log");

    // Fetch total approved application
    $stmt = mysqli_prepare($conn, $sqlGetTotalApprovedApplication);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    $totalApprovedApplication = $row['total'];
    mysqli_stmt_close($stmt);
    writeLog("Total approved applications fetched: $totalApprovedApplication", "admin-application-request.log");

    // Fetch total rejected application
    $stmt = mysqli_prepare($conn, $sqlGetTotalRejectedApplication);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    $totalRejectedApplication = $row['total'];
    mysqli_stmt_close($stmt);
    writeLog("Total rejected applications fetched: $totalRejectedApplication", "admin-application-request.log");

    // Fetch applications
    $stmt = mysqli_prepare($conn, $sqlGetApplications);
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
    writeLog("Applications fetched: " . json_encode($applications), "admin-application-request.log");

    echo json_encode([
        'success' => true,
        'total_application' => $totalApplication,
        'total_pending_application' => $totalPendingApplication,
        'total_under_review_application' => $totalUnderReviewApplication,
        'total_approved_application' => $totalApprovedApplication,
        'total_rejected_application' => $totalRejectedApplication,
        'applications' => $applications
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
