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
    
    // First, check if the user exists in the User table
    $userSql = "SELECT 
        id as user_id,
        username,
        profile_picture,
        email,
        phone,
        role,
        status,
        is_verified,
        created_at
    FROM User WHERE id = ?";
    
    $stmt = $conn->prepare($userSql);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'User not found'
        ]);
        exit;
    }
    
    // Get basic user data
    $userData = $result->fetch_assoc();
    $stmt->close();
    
    // Check if ClientProfile exists
    $checkProfileSql = "SELECT COUNT(*) as profile_exists FROM ClientProfile WHERE user_id = ?";
    $stmt = $conn->prepare($checkProfileSql);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $hasProfile = ($row['profile_exists'] > 0);
    $stmt->close();
    
    // Get profile data if it exists
    if ($hasProfile) {
        $profileSql = "SELECT 
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
            ud.occupation
        FROM 
            ClientProfile cp
        LEFT JOIN ContactAddress ca ON cp.user_id = ca.user_id
        LEFT JOIN UserDetails ud ON cp.user_id = ud.user_id
        WHERE 
            cp.user_id = ?";
        
        $stmt = $conn->prepare($profileSql);
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $profileData = $result->fetch_assoc();
            $userData = array_merge($userData, $profileData);
        }
        $stmt->close();
    }
    
    // Always get application status and verification info if available
    $verificationSql = "SELECT 
        a.status as application_status,
        a.admin_id as verified_by_id,
        a.updated_at as verification_date,
        admin.username as verified_by
    FROM 
        Application a
    LEFT JOIN User admin ON a.admin_id = admin.id
    WHERE 
        a.user_id = ?";
    
    $stmt = $conn->prepare($verificationSql);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $verificationData = $result->fetch_assoc();
        $userData = array_merge($userData, $verificationData);
    }
    $stmt->close();
    
    echo json_encode([
        'success' => true,
        'user' => $userData,
        'hasClientProfile' => $hasProfile
    ]);

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