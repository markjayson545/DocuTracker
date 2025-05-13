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

    $applicationId = $_POST['application_id'] ?? null;
    $fetchedData = [];

    if (!$applicationId) {
        throw new Exception('Application ID not provided');
    }

    $sqlGetApplicationDetails = "SELECT application.status AS application_status, 
                                    application.admin_notes, application.created_at AS application_created_at, application.updated_at AS application_updated_at,
                                    user.id AS user_user_id, user.username, user.phone, user.email, user.role, user.is_verified, user.status AS user_status, user.created_at AS user_created_at,
                                    client_profile.first_name, client_profile.middle_name, client_profile.last_name, client_profile.qualifier, client_profile.sex, client_profile.civil_status, client_profile.birthdate, client_profile.birthplace, 
                                    contact_address.house_number_building_name, contact_address.street_name, contact_address.subdivision_barangay, contact_address.city_municipality, contact_address.province,
                                    user_details.height, user_details.weight, user_details.complexion, user_details.blood_type, user_details.religion, user_details.educational_attainment, user_details.occupation, user_details.nationality
                                    FROM Application application
                                    JOIN User user ON application.user_id = user.id
                                    JOIN UserDetails user_details ON application.user_id = user_details.user_id
                                    JOIN ClientProfile client_profile ON application.user_id = client_profile.user_id
                                    JOIN ContactAddress contact_address ON application.user_id = contact_address.user_id
                                    WHERE application.application_id = ?
                                    LIMIT 1";

    $stmt = mysqli_prepare($conn, $sqlGetApplicationDetails);
    mysqli_stmt_bind_param($stmt, 'i', $applicationId);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $applicationDetail = [];
    if ($row = mysqli_fetch_assoc($result)) {
        // Store data directly in $applicationDetail (no need for array within array since LIMIT 1)
        $applicationDetail = [
            // Application Table
            'application_id' => $applicationId,
            'application_status' => $row['application_status'],
            'application_admin_notes' => $row['admin_notes'],
            'application_created_at' => $row['application_created_at'],
            'application_updated_at' => $row['application_updated_at'],
            
            // User Table
            'user_id' => $row['user_user_id'],
            'username' => $row['username'],
            'phone' => $row['phone'],
            'email' => $row['email'],
            'role' => $row['role'],
            'is_verified' => $row['is_verified'],
            'user_status' => $row['user_status'],
            'user_created_at' => $row['user_created_at'],
            
            // Client Profile Table
            'first_name' => $row['first_name'],
            'middle_name' => $row['middle_name'],
            'last_name' => $row['last_name'],
            'qualifier' => $row['qualifier'],
            'sex' => $row['sex'],
            'civil_status' => $row['civil_status'],
            'birthdate' => $row['birthdate'],
            'birthplace' => $row['birthplace'],
            
            // Contact Address Table
            'house_number_building_name' => $row['house_number_building_name'],
            'street_name' => $row['street_name'],
            'subdivision_barangay' => $row['subdivision_barangay'],
            'city_municipality' => $row['city_municipality'],
            'province' => $row['province'],
            
            // User Details Table
            'height' => $row['height'],
            'weight' => $row['weight'],
            'complexion' => $row['complexion'],
            'blood_type' => $row['blood_type'],
            'religion' => $row['religion'],
            'educational_attainment' => $row['educational_attainment'],
            'occupation' => $row['occupation'],
            'nationality' => $row['nationality']
        ];
        // Fetch all documents for this application
        $docsStmt = $conn->prepare("SELECT document_id, document_type, document_path, created_at FROM ApplicationDocuments WHERE application_id = ? ORDER BY created_at DESC");
        $docsStmt->bind_param("i", $applicationId);
        $docsStmt->execute();
        $docsResult = $docsStmt->get_result();
        $documents = [];
        while ($docRow = $docsResult->fetch_assoc()) {
            $documents[] = $docRow;
        }
        $docsStmt->close();
        $applicationDetail['documents'] = $documents;
    } else {
        $applicationDetail = [];
    }
    if($applicationDetail > 0) {
        $fetchedData = $applicationDetail;
    }
    writeLog("Fetched application details for application ID: $applicationId", "fetch-admin-application-details.log");
    echo json_encode([
        'status' => 'success',
        'message' => 'Application details fetched successfully',
        'data' => $fetchedData
    ]);

} catch (\Throwable $th) {
    writeLog('Error: ' . $th->getMessage(), 'fetch-admin-application-details.php');
    echo json_encode([
        'status' => 'error',
        'message' => $th->getMessage()
    ]);
} finally {
    $conn->close();
}
