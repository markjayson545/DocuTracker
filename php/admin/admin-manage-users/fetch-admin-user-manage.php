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

    $sqlGetUsers = "SELECT user.id AS user_id, user.email, user.role, user.is_verified, user.status, user.created_at,
                    client_profile.first_name, client_profile.last_name
                    FROM User user
                    JOIN ClientProfile client_profile ON user.id = client_profile.user_id
                    ORDER BY user.created_at DESC";
    // TODO fetch even client profile for user_id does not exists

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

    // Fetch users
    $stmt = mysqli_prepare($conn, $sqlGetUsers);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    while ($row = mysqli_fetch_assoc($result)) {
        $users[] = [
            'user_id' => $row['user_id'],
            'email' => $row['email'],
            'role' => $row['role'],
            'is_verified' => $row['is_verified'],
            'status' => $row['status'],
            'created_at' => $row['created_at'],
            'first_name' => $row['first_name'],
            'last_name' => $row['last_name']
        ];
    }
    mysqli_stmt_close($stmt);
    writeLog("Users fetched successfully", "manage-users.log");

    echo json_encode([
        'success' => true,
        'totalUsers' => $totalUsers,
        'totalActiveUsers' => $totalActiveUsers,
        'totalPendingVerificationUsers' => $totalPendingVerificationUsers,
        'totalSuspendedUsers' => $totalSuspendedUsers,
        'totalVerifiedUsers' => $totalVerifiedUsers,
        'users' => $users,
        'isAdmin' => true
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