<?php
require __DIR__ . '/../services/open-db.php';
include __DIR__ . '/../services/logger.php';
session_start();

function searchAll($value) {
    global $conn;
    $searchValue = "%$value%";
    
    // Search Users
    $userResults = [];
    $sql = "SELECT id as user_id, username, email, phone FROM User 
            WHERE username LIKE ? OR email LIKE ? OR phone LIKE ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sss", $searchValue, $searchValue, $searchValue);
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $row['type'] = 'user';
        $userResults[] = $row;
    }
    
    // Search Requests
    $requestResults = [];
    $sql = "SELECT request_id as id, user_id, document_type_id, status FROM Request 
            WHERE request_id LIKE ? OR user_id LIKE ? OR document_type_id LIKE ? OR status LIKE ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssss", $searchValue, $searchValue, $searchValue, $searchValue);
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $row['type'] = 'request';
        $requestResults[] = $row;
    }
    
    // Search Applications
    $applicationResults = [];
    $sql = "SELECT application_id as id, status, user_id 
            FROM Application
            WHERE application_id LIKE ? OR status LIKE ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $searchValue, $searchValue);
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $row['type'] = 'application';
        $applicationResults[] = $row;
    }
    
    // Combine results
    $combinedResults = array_merge($userResults, $requestResults, $applicationResults);
    
    echo json_encode([
        "success" => true,
        "message" => "Search completed successfully",
        "data" => $combinedResults
    ]);
}

function searchApplication($value) {
    global $conn;
    $searchValue = "%$value%";
    
    $sql = "SELECT a.application_id as id, a.request_id, a.status, r.document_type_id, u.username, r.user_id 
            FROM Application a
            LEFT JOIN Request r ON a.request_id = r.request_id
            LEFT JOIN User u ON r.user_id = u.id
            WHERE a.application_id LIKE ? 
            OR a.request_id LIKE ? 
            OR a.status LIKE ? 
            OR r.document_type_id LIKE ?
            OR u.username LIKE ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssss", $searchValue, $searchValue, $searchValue, $searchValue, $searchValue);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $applications = [];
    while ($row = $result->fetch_assoc()) {
        $applications[] = $row;
    }
    
    echo json_encode([
        "success" => true,
        "message" => "Search completed successfully",
        "data" => $applications
    ]);
}

function searchUser($value) {
    global $conn;
    $searchValue = "%$value%";
    
    $sql = "SELECT user_id as id, username, email, phone, role FROM User 
            WHERE username LIKE ? 
            OR email LIKE ? 
            OR phone LIKE ?
            OR role LIKE ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssss", $searchValue, $searchValue, $searchValue, $searchValue);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $users = [];
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
    
    echo json_encode([
        "success" => true,
        "message" => "Search completed successfully",
        "data" => $users
    ]);
}

function searchRequest($value) {
    global $conn;
    $searchValue = "%$value%";
    
    $sql = "SELECT r.request_id as id, r.user_id, r.document_type_id, r.status, 
            u.username, dt.name as document_type_name
            FROM Request r
            LEFT JOIN User u ON r.user_id = u.user_id
            LEFT JOIN DocumentType dt ON r.document_type_id = dt.document_type_id
            WHERE r.request_id LIKE ?
            OR r.user_id LIKE ?
            OR r.document_type_id LIKE ?
            OR r.status LIKE ?
            OR u.username LIKE ?
            OR dt.name LIKE ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssssss", $searchValue, $searchValue, $searchValue, $searchValue, $searchValue, $searchValue);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $requests = [];
    while ($row = $result->fetch_assoc()) {
        $requests[] = $row;
    }
    
    echo json_encode([
        "success" => true,
        "message" => "Search completed successfully",
        "data" => $requests
    ]);
}

try {
    $userId = $_SESSION['user_id'];

    if (!isset($_SESSION['user_id'])) {
        throw new Exception("User not logged in");
    }
    if ($_SESSION['role'] !== 'admin') {
        throw new Exception("Unauthorized access");
    }

    $action = $_GET['action'] ?? null;
    $value = $_GET['value'] ?? null;
    switch ($action) {
        case 'searchAll':
            searchAll($value);
            break;
        case 'searchApplication':
            searchApplication($value);
            break;
        case 'searchUser':
            searchUser($value);
            break;
        case 'searchRequest':
            searchRequest($value);
            break;
        default:
            throw new Exception('Invalid Action');
            break;
    }
} catch (\Throwable $th) {
    writeLog("Error: " . $th->getMessage(), "search-query-admin.log");
    echo json_encode(
        [
            "success" => false,
            "message" => "Error: " . $th->getMessage()
        ]
        );
}
