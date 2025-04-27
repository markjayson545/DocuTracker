<?php

require __DIR__ . '/../../services/open-db.php';
include __DIR__ . '/../../services/logger.php';
session_start();

$userId = $_SESSION['user_id'];

try {

    if (!isset($userId)) {
        throw new Exception('User ID is not set in session.');
    }

    $fetchedData = [];

    $sql = "SELECT document_type_id, document_type, price FROM DocumentTypes";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $result = $stmt->get_result();
    $documentTypes = [];
    while ($row = $result->fetch_assoc()) {
        $documentTypes[] = [
            'document_type_id' => $row['document_type_id'],
            'document_type' => $row['document_type'],
            'price' => $row['price']
        ];
    }
    $stmt->close();

    if ($documentTypes) {
        $fetchedData['document_types'] = $documentTypes;
    }

    // Fetch User Data
    $sql = "SELECT first_name, last_name, qualifier FROM ClientProfile WHERE user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $userData = $result->fetch_assoc();
    $stmt->close();

    if ($userData) {
        $fetchedData['user'] = [
            'first_name' => $userData['first_name'],
            'last_name' => $userData['last_name'],
            'qualifier' => $userData['qualifier']
        ];
    }

    // Fetch total document requests of the user
    $totalRequestSql = "SELECT COUNT(user_id) AS total_requests FROM Request WHERE user_id = ?";
    $stmt = $conn->prepare($totalRequestSql);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $totalRequestData = $result->fetch_assoc();
    $stmt->close();

    if ($totalRequestData) {
        $fetchedData['total_requests'] = $totalRequestData['total_requests'];
    }

    // Fetch pending document requests of the user
    $pendingRequestSql = "SELECT COUNT(user_id) AS pending_requests FROM Request WHERE user_id = ? AND status = 'pending'";
    $stmt = $conn->prepare($pendingRequestSql);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $pendingRequestData = $result->fetch_assoc();
    $stmt->close();

    if ($pendingRequestData) {
        $fetchedData['pending_requests'] = $pendingRequestData['pending_requests'];
    }

    // Fetch completed document requests of the user
    $completedRequestSql = "SELECT COUNT(user_id) AS completed_requests FROM Request WHERE user_id = ? AND status = 'completed'";
    $stmt = $conn->prepare($completedRequestSql);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $completedRequestData = $result->fetch_assoc();
    $stmt->close();

    if ($completedRequestData) {
        $fetchedData['completed_requests'] = $completedRequestData['completed_requests'];
    }

    // Recent Payments
    $recentPaymentsSql = "SELECT SUM(amount) AS recent_payments FROM Payment WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)";
    $stmt = $conn->prepare($recentPaymentsSql);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $recentPaymentsData = $result->fetch_assoc();
    $stmt->close();

    if ($recentPaymentsData) {
        $fetchedData['recent_payments'] = $recentPaymentsData['recent_payments'];
    }

    // Recent User Activities
    $recentActivitiesSql = "SELECT title, action, created_at FROM AuditLog WHERE user_id = ? ORDER BY created_at DESC LIMIT 5";
    $stmt = $conn->prepare($recentActivitiesSql);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $recentActivities = [];
    while ($row = $result->fetch_assoc()) {
        $recentActivities[] = [
            'title' => $row['title'],
            'action' => $row['action'],
            'created_at' => $row['created_at']
        ];
    }
    $stmt->close();

    if ($recentActivities) {
        $fetchedData['recent_activities'] = $recentActivities;
        writeLog('Recent activities fetched successfully.', 'dashboard.log');
    } else {
        writeLog('No recent activities found.', 'dashboard.log');
    }

    writeLog('Dashboard data fetched successfully.', 'dashboard.log');
    echo json_encode($fetchedData);
    exit;
}
catch (Exception $e) {
    writeLog($e->getMessage(), 'dashboard.log');
    echo json_encode(['error' => 'An error occurred while fetching data.']);
    exit;
}


?>gmail