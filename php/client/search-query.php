<?php
require __DIR__ . '/../services/open-db.php';
include __DIR__ . '/../services/logger.php';
session_start();

function searchAll($value, $userId) {
    global $conn;
    $searchValue = "%$value%";
    
    // Search Requests for this user
    $requestResults = searchRequests($value, $userId);
    
    // Return only request results
    echo json_encode([
        "success" => true,
        "message" => "Search completed successfully",
        "data" => $requestResults
    ]);
}

function searchRequests($value, $userId) {
    global $conn;
    $searchValue = "%$value%";
    
    $sql = "SELECT request_id as id, document_type_id, status, 
            created_at, updated_at
            FROM Request 
            WHERE user_id = ? AND 
            (request_id LIKE ? OR document_type_id LIKE ? OR status LIKE ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("isss", $userId, $searchValue, $searchValue, $searchValue);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $requests = [];
    while ($row = $result->fetch_assoc()) {
        $row['type'] = 'request';
        $requests[] = $row;
    }
    
    return $requests;
}

try {
    // Ensure user is logged in
    if (!isset($_SESSION['user_id'])) {
        throw new Exception("User not logged in");
    }
    
    $userId = $_SESSION['user_id'];
    $action = $_GET['action'] ?? null;
    $value = $_GET['value'] ?? null;
    
    if (!$value) {
        throw new Exception("Search value is required");
    }
    
    switch ($action) {
        case 'searchAll':
            searchAll($value, $userId);
            break;
        case 'searchRequest':
            $results = searchRequests($value, $userId);
            echo json_encode([
                "success" => true,
                "message" => "Search completed successfully",
                "data" => $results
            ]);
            break;
        default:
            throw new Exception('Invalid Action');
            break;
    }
} catch (\Throwable $th) {
    writeLog("Error: " . $th->getMessage(), "search-query-client.log");
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $th->getMessage()
    ]);
}
?>