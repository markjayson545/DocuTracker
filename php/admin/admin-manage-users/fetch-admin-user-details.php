<?php
require __DIR__ . '/../../services/open-db.php';
include __DIR__ . '/../../services/logger.php';
session_start();

try {
    $user_id = $_SESSION['user_id'] ?? null;
    $role = $_SESSION['role'] ?? null;
    if ($role !== 'admin') {
        writeLog("Unauthorized access attempt by user ID: $user_id", "admin-dashboard.log");
        echo json_encode([
            'success' => false,
            'message' => 'Unauthorized access',
            'isAdmin' => false
        ]);
        throw new Exception("Unauthorized access");
    }
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('User not logged in');
    }

    $userId = $_POST['user_id'] ?? null;
    
    if (!$userId) {
        throw new Exception('User ID not provided');
    }
    
    // Comprehensive query to join all relevant tables
    $sql = "SELECT 
        u.id as user_id,
        u.username,
        u.email,
        u.phone,
        u.role,
        u.status,
        u.is_verified,
        u.created_at,
        cp.first_name,
        cp.middle_name,
        cp.last_name,
        cp.qualifier,
        cp.sex,
        cp.civil_status,
        cp.birthdate as date_of_birth,
        cp.birthplace as birth_place,
        ca.house_number_building_name as house_number,
        ca.street_name as street,
        ca.subdivision_barangay as barangay,
        ca.city_municipality as city,
        ca.province,
        ud.height,
        ud.weight,
        ud.complexion,
        ud.blood_type,
        ud.religion,
        ud.nationality,
        ud.educational_attainment as education,
        ud.occupation,
        a.status as application_status,
        a.admin_id as verified_by_id,
        a.updated_at as verification_date,
        admin.username as verified_by
    FROM 
        User u
    LEFT JOIN ClientProfile cp ON u.id = cp.user_id
    LEFT JOIN ContactAddress ca ON u.id = ca.user_id
    LEFT JOIN UserDetails ud ON u.id = ud.user_id
    LEFT JOIN Application a ON u.id = a.user_id
    LEFT JOIN User admin ON a.admin_id = admin.id
    WHERE 
        u.id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $userData = $result->fetch_assoc();
        echo json_encode([
            'success' => true,
            'user' => $userData
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'User not found'
        ]);
    }

} catch (\Throwable $th) {
    writeLog("Error: " . $th->getMessage(), "admin-manage-users.log");
    echo json_encode([
        'success' => false,
        'message' => $th->getMessage()
    ]);
} finally {
    if (isset($conn)) {
        mysqli_close($conn);
    }
}
?>