<?php
require __DIR__ . '/../../services/open-db.php';
include __DIR__ . '/../../services/logger.php';
session_start();

try {
    $totalUsers = 0;
    $totalActiveUsers = 0;
    $totalPendingVerificationUsers = 0;
    $totalSuspendedUsers = 0;
    $totalVerifiedUsers = 0;

    $users = [];

    $userId = $_SESSION['user_id'];
    $role = $_SESSION['role'];

    // Get page number and search term from request
    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
    $pageSize = 10; // Fixed page size of 10
    $searchTerm = isset($_GET['search']) ? $_GET['search'] : '';
    $offset = ($page - 1) * $pageSize;

    if ($role !== 'admin') {
        writeLog("Unauthorized access attempt by user ID: $userId", "manage-users.log");
        echo json_encode([
            'success' => false,
            'message' => 'Unauthorized access',
            'isAdmin' => false
        ]);
        throw new Exception("Unauthorized access");
    }

    $sqlTotalUsers = "SELECT COUNT(*) as total FROM User";
    $sqlTotalActiveUsers = "SELECT COUNT(*) as total FROM User WHERE status = 'active'";
    $sqlTotalPendingVerificationUsers = "SELECT COUNT(*) as total FROM User WHERE status = 'pending'";
    $sqlTotalSuspendedUsers = "SELECT COUNT(*) as total FROM User WHERE status = 'suspended'";
    $sqlTotalVerifiedUsers = "SELECT COUNT(*) as total FROM User WHERE status = 'active' AND is_verified = 1";

    // Base query for users
    $sqlGetUsers = "SELECT user.id AS user_id, user.email, user.username, user.role, user.is_verified, user.status, user.created_at
                    FROM User user";
                    
    // Add search condition if search term is provided
    $searchCondition = "";
    if (!empty($searchTerm)) {
        $searchCondition = " WHERE user.username LIKE ? OR user.email LIKE ? OR user.role LIKE ? OR user.status LIKE ?";
    }
    
    // Count total matching records for pagination
    $sqlCountUsers = "SELECT COUNT(*) as total FROM User user" . $searchCondition;
    
    // Complete the query with order by and pagination
    $sqlGetUsers .= $searchCondition . " ORDER BY user.created_at DESC LIMIT ? OFFSET ?";

    // Fetch total users
    $stmt = mysqli_prepare($conn, $sqlTotalUsers);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    $totalUsers = $row['total'];
    mysqli_stmt_close($stmt);
    writeLog("Total users fetched: $totalUsers", "manage-users.log");

    // Fetch total active users
    $stmt = mysqli_prepare($conn, $sqlTotalActiveUsers);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    $totalActiveUsers = $row['total'];
    mysqli_stmt_close($stmt);
    writeLog("Total active users fetched: $totalActiveUsers", "manage-users.log");

    // Fetch total pending verification users
    $stmt = mysqli_prepare($conn, $sqlTotalPendingVerificationUsers);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    $totalPendingVerificationUsers = $row['total'];
    mysqli_stmt_close($stmt);
    writeLog("Total pending verification users fetched: $totalPendingVerificationUsers", "manage-users.log");
    
    // Fetch total suspended users
    $stmt = mysqli_prepare($conn, $sqlTotalSuspendedUsers);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    $totalSuspendedUsers = $row['total'];
    mysqli_stmt_close($stmt);
    writeLog("Total suspended users fetched: $totalSuspendedUsers", "manage-users.log");

    // Fetch total verified users
    $stmt = mysqli_prepare($conn, $sqlTotalVerifiedUsers);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    $totalVerifiedUsers = $row['total'];
    mysqli_stmt_close($stmt);
    writeLog("Total verified users fetched: $totalVerifiedUsers", "manage-users.log");

    // Count total users matching search criteria for pagination
    $totalMatchingUsers = 0;
    $stmt = mysqli_prepare($conn, $sqlCountUsers);
    if (!empty($searchTerm)) {
        $searchParam = "%$searchTerm%";
        mysqli_stmt_bind_param($stmt, "ssss", $searchParam, $searchParam, $searchParam, $searchParam);
    }
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    $totalMatchingUsers = $row['total'];
    mysqli_stmt_close($stmt);
    
    // Calculate total pages
    $totalPages = ceil($totalMatchingUsers / $pageSize);
    
    // Fetch users with pagination and search
    $stmt = mysqli_prepare($conn, $sqlGetUsers);
    if (!empty($searchTerm)) {
        $searchParam = "%$searchTerm%";
        mysqli_stmt_bind_param($stmt, "ssssii", $searchParam, $searchParam, $searchParam, $searchParam, $pageSize, $offset);
    } else {
        mysqli_stmt_bind_param($stmt, "ii", $pageSize, $offset);
    }
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    while ($row = mysqli_fetch_assoc($result)) {
        $users[] = [
            'user_id' => $row['user_id'],
            'email' => $row['email'],
            'username' => $row['username'],
            'role' => $row['role'],
            'is_verified' => $row['is_verified'],
            'status' => $row['status'],
            'created_at' => $row['created_at']
        ];
    }
    mysqli_stmt_close($stmt);
    writeLog("Users fetched successfully with pagination", "manage-users.log");

    echo json_encode([
        'success' => true,
        'totalUsers' => $totalUsers,
        'totalActiveUsers' => $totalActiveUsers,
        'totalPendingVerificationUsers' => $totalPendingVerificationUsers,
        'totalSuspendedUsers' => $totalSuspendedUsers,
        'totalVerifiedUsers' => $totalVerifiedUsers,
        'users' => $users,
        'isAdmin' => true,
        'pagination' => [
            'currentPage' => $page,
            'totalPages' => $totalPages,
            'pageSize' => $pageSize,
            'totalMatchingUsers' => $totalMatchingUsers
        ]
    ]);

} catch (\Throwable $th) {
    writeLog("Error: " . $th->getMessage(), "manage-users.log");
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while processing your request.',
        'error' => $th->getMessage(),
        'isAdmin' => false
    ]);
} finally{
    mysqli_close($conn);
}
?>