<?php
require 'open-db.php';
include 'logger.php';
session_start();

function getAllUserInfo($userId)
{
    global $conn;
    $sql = "SELECT 
        u.id as user_id, u.username, u.email, u.phone, u.role, u.status, u.is_verified, u.created_at, 
        cp.first_name, cp.middle_name, cp.last_name, cp.qualifier, cp.sex, cp.civil_status, cp.birthdate as date_of_birth, cp.birthplace as birth_place, 
        ca.house_number_building_name as house_number, ca.street_name as street, ca.subdivision_barangay as barangay, ca.city_municipality as city, ca.province, 
        ud.height, ud.weight, ud.complexion, ud.blood_type, ud.religion, ud.nationality, ud.educational_attainment as education, ud.occupation, 
        a.status as application_status, a.admin_id as verified_by_id, a.updated_at as verification_date, 
        admin.username as verified_by 
        FROM User u 
        LEFT JOIN ClientProfile cp ON u.id = cp.user_id 
        LEFT JOIN ContactAddress ca ON u.id = ca.user_id 
        LEFT JOIN UserDetails ud ON u.id = ud.user_id 
        LEFT JOIN Application a ON u.id = a.user_id 
        LEFT JOIN User admin ON a.admin_id = admin.id 
        WHERE u.id = ?";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $userInfo = $result->fetch_assoc();
    return $userInfo;
}

function getApplication($applicationId)
{
    global $conn;
    $sql = "SELECT * FROM Application WHERE application_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $applicationId);
    $stmt->execute();
    $result = $stmt->get_result();
    $application = $result->fetch_assoc();
    return $application;
}

function getApplicationDocuments($applicationId)
{
    global $conn;
    $sql = "SELECT * FROM ApplicationDocuments WHERE application_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $applicationId);
    $stmt->execute();
    $result = $stmt->get_result();
    $documents = [];
    while ($row = $result->fetch_assoc()) {
        $documents[] = $row;
    }
    return $documents;
}



try {

    $loggedInUserId = $_SESSION['user_id'] ?? null;
    $loggedInUserRole = $_SESSION['role'] ?? null;
    $userId = $_POST['user_id'] ?? null;
    $action = $_POST['action'] ?? null;


    // Prevent user accessing other users' data
    // Only admin can access other users' data
    if ($loggedInUserRole !== 'admin' && $loggedInUserId !== $userId) {
        throw new Exception('Unauthorized access');
    }

    if (!$userId) {
        echo json_encode([
            'success' => false,
            'message' => 'User ID not provided'
        ]);
        exit();
    }

    switch ($action) {
        case 'getUserInfo':
            $userInfo = getAllUserInfo($userId);
            if ($userInfo) {
                echo json_encode([
                    'success' => true,
                    'user' => $userInfo
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'User not found'
                ]);
            }
            break;
        case 'getApplication':
            $applicationId = $_POST['application_id'] ?? null;
            if (!$applicationId) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Application ID not provided'
                ]);
                exit();
            }
            $application = getApplication($applicationId);
            if ($application) {
                echo json_encode([
                    'success' => true,
                    'application' => $application
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Application not found'
                ]);
            }
            break;
        case 'getApplicationDocuments':
            $applicationId = $_POST['application_id'] ?? null;
            if (!$applicationId) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Application ID not provided'
                ]);
                exit();
            }
            $documents = getApplicationDocuments($applicationId);
            if ($documents) {
                echo json_encode([
                    'success' => true,
                    'documents' => $documents
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'No documents found for this application'
                ]);
            }
            break;



        default:
            throw new Exception('Invalid action');
            break;
    }
    
} catch (Exception $e) {
    writeLog("Error in get-user-info.php: " . $e->getMessage(), 'get-user-info.log');
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} finally {
    if (isset($conn)) {
        mysqli_close($conn);
    }
}
