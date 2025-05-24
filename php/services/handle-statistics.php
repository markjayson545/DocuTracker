<?php
require 'open-db.php';
include 'logger.php';
session_start();

// User Growth Over Time
function getUserGrowthOverTime($interval = 'month')
{
    global $conn;

    $sql = "";
    switch ($interval) {
        case 'day':
            $sql = "SELECT DATE(created_at) AS date, COUNT(*) AS count 
                   FROM User 
                   GROUP BY DATE(created_at) 
                   ORDER BY DATE(created_at)";
            break;
        case 'week':
            $sql = "SELECT YEARWEEK(created_at) AS week, COUNT(*) AS count 
                   FROM User 
                   GROUP BY YEARWEEK(created_at) 
                   ORDER BY YEARWEEK(created_at)";
            break;
        case 'month':
        default:
            $sql = "SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS count 
                   FROM User 
                   GROUP BY DATE_FORMAT(created_at, '%Y-%m') 
                   ORDER BY DATE_FORMAT(created_at, '%Y-%m')";
            break;
    }

    $result = $conn->query($sql);
    $data = [];

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
    }

    return $data;
}

// User Status Distribution
function getUserStatusDistribution()
{
    global $conn;

    $sql = "SELECT status, COUNT(*) AS count 
           FROM User 
           GROUP BY status";

    $result = $conn->query($sql);
    $data = [];

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
    }

    return $data;
}

// Verification Rate
function getVerificationRate()
{
    global $conn;

    $sql = "SELECT 
           SUM(CASE WHEN is_verified = 1 THEN 1 ELSE 0 END) AS verified,
           SUM(CASE WHEN is_verified = 0 THEN 1 ELSE 0 END) AS not_verified,
           COUNT(*) AS total
           FROM User";

    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        return $result->fetch_assoc();
    }

    return [
        'verified' => 0,
        'not_verified' => 0,
        'total' => 0
    ];
}

// Request Status Distribution
function getRequestStatusDistribution()
{
    global $conn;

    $sql = "SELECT status, COUNT(*) AS count 
           FROM Request 
           GROUP BY status";

    $result = $conn->query($sql);
    $data = [];

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
    }

    return $data;
}

// Request Volume Over Time
function getRequestVolumeOverTime($interval = 'month')
{
    global $conn;

    $sql = "";
    switch ($interval) {
        case 'day':
            $sql = "SELECT DATE(created_at) AS date, COUNT(*) AS count 
                   FROM Request 
                   GROUP BY DATE(created_at) 
                   ORDER BY DATE(created_at)";
            break;
        case 'week':
            $sql = "SELECT YEARWEEK(created_at) AS week, COUNT(*) AS count 
                   FROM Request 
                   GROUP BY YEARWEEK(created_at) 
                   ORDER BY YEARWEEK(created_at)";
            break;
        case 'month':
        default:
            $sql = "SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS count 
                   FROM Request 
                   GROUP BY DATE_FORMAT(created_at, '%Y-%m') 
                   ORDER BY DATE_FORMAT(created_at, '%Y-%m')";
            break;
    }

    $result = $conn->query($sql);
    $data = [];

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
    }

    return $data;
}

// Most Requested Document Types
function getMostRequestedDocumentTypes()
{
    global $conn;

    $sql = "SELECT dt.document_type, COUNT(r.request_id) AS count 
           FROM Request r
           JOIN DocumentTypes dt ON r.document_type_id = dt.document_type_id
           GROUP BY dt.document_type
           ORDER BY count DESC";

    $result = $conn->query($sql);
    $data = [];

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
    }

    return $data;
}

// Revenue by Document Type
function getRevenueByDocumentType()
{
    global $conn;

    $sql = "SELECT dt.document_type, SUM(p.amount) AS total_revenue
           FROM Payment p
           JOIN Request r ON p.request_id = r.request_id
           JOIN DocumentTypes dt ON r.document_type_id = dt.document_type_id
           WHERE p.status = 'completed'
           GROUP BY dt.document_type
           ORDER BY total_revenue DESC";

    $result = $conn->query($sql);
    $data = [];

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
    }

    return $data;
}

// Payment Method Distribution
function getPaymentMethodDistribution()
{
    global $conn;

    $sql = "SELECT mode_of_payment, COUNT(*) AS count 
           FROM Payment 
           GROUP BY mode_of_payment";

    $result = $conn->query($sql);
    $data = [];

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
    }

    return $data;
}

// Revenue Trends Over Time
function getRevenueTrends($interval = 'month')
{
    global $conn;

    $sql = "";
    switch ($interval) {
        case 'day':
            $sql = "SELECT DATE(created_at) AS date, SUM(amount) AS revenue 
                   FROM Payment 
                   WHERE status = 'completed'
                   GROUP BY DATE(created_at) 
                   ORDER BY DATE(created_at)";
            break;
        case 'week':
            $sql = "SELECT YEARWEEK(created_at) AS week, SUM(amount) AS revenue 
                   FROM Payment 
                   WHERE status = 'completed'
                   GROUP BY YEARWEEK(created_at) 
                   ORDER BY YEARWEEK(created_at)";
            break;
        case 'month':
        default:
            $sql = "SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, SUM(amount) AS revenue 
                   FROM Payment 
                   WHERE status = 'completed'
                   GROUP BY DATE_FORMAT(created_at, '%Y-%m') 
                   ORDER BY DATE_FORMAT(created_at, '%Y-%m')";
            break;
    }

    $result = $conn->query($sql);
    $data = [];

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
    }

    return $data;
}

// Application Status Distribution
function getApplicationStatusDistribution()
{
    global $conn;

    $sql = "SELECT status, COUNT(*) AS count 
           FROM Application 
           GROUP BY status";

    $result = $conn->query($sql);
    $data = [];

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
    }

    return $data;
}

// Application Processing Time
function getApplicationProcessingTime()
{
    global $conn;

    $sql = "SELECT 
           a.application_id,
           TIMESTAMPDIFF(HOUR, a.created_at, a.updated_at) AS processing_hours
           FROM Application a
           WHERE a.status IN ('approved', 'rejected')";

    $result = $conn->query($sql);
    $data = [
        'average_hours' => 0,
        'details' => []
    ];

    $totalHours = 0;
    $count = 0;

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $data['details'][] = $row;
            $totalHours += $row['processing_hours'];
            $count++;
        }

        if ($count > 0) {
            $data['average_hours'] = $totalHours / $count;
        }
    }

    return $data;
}

try {
    $userId = $_SESSION['user_id'] ?? null;
    $action = $_POST['action'] ?? null;
    $interval = $_POST['interval'] ?? 'month';

    // Check if user is authorized (admin or staff only)
    if (!isset($userId)) {
        throw new Exception('You must be logged in to access statistics');
    }

    // Verify user has admin or staff role (you may need to adjust this based on your role system)
    $user_role_sql = "SELECT role FROM User WHERE id = ?";
    $stmt = $conn->prepare($user_role_sql);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $stmt->bind_result($userRole);
    $stmt->fetch();
    $stmt->close();

    if (!in_array($userRole, ['admin', 'staff'])) {
        throw new Exception('You do not have permission to access statistics');
    }

    if (!isset($action)) {
        throw new Exception('Invalid request: action parameter is required');
    }

    switch ($action) {
        case 'userGrowth':
            $data = getUserGrowthOverTime($interval);
            echo json_encode([
                'success' => true,
                'data' => $data
            ]);
            break;

        case 'userStatusDistribution':
            $data = getUserStatusDistribution();
            echo json_encode([
                'success' => true,
                'data' => $data
            ]);
            break;

        case 'verificationRate':
            $data = getVerificationRate();
            echo json_encode([
                'success' => true,
                'data' => $data
            ]);
            break;

        case 'requestStatusDistribution':
            $data = getRequestStatusDistribution();
            echo json_encode([
                'success' => true,
                'data' => $data
            ]);
            break;

        case 'requestVolume':
            $data = getRequestVolumeOverTime($interval);
            echo json_encode([
                'success' => true,
                'data' => $data
            ]);
            break;

        case 'mostRequestedDocuments':
            $data = getMostRequestedDocumentTypes();
            echo json_encode([
                'success' => true,
                'data' => $data
            ]);
            break;

        case 'revenueByDocumentType':
            $data = getRevenueByDocumentType();
            echo json_encode([
                'success' => true,
                'data' => $data
            ]);
            break;

        case 'paymentMethodDistribution':
            $data = getPaymentMethodDistribution();
            echo json_encode([
                'success' => true,
                'data' => $data
            ]);
            break;

        case 'revenueTrends':
            $data = getRevenueTrends($interval);
            echo json_encode([
                'success' => true,
                'data' => $data
            ]);
            break;

        case 'applicationStatusDistribution':
            $data = getApplicationStatusDistribution();
            echo json_encode([
                'success' => true,
                'data' => $data
            ]);
            break;

        case 'applicationProcessingTime':
            $data = getApplicationProcessingTime();
            echo json_encode([
                'success' => true,
                'data' => $data
            ]);
            break;

        default:
            echo json_encode([
                'success' => false,
                'message' => 'Invalid action'
            ]);
            break;
    }
} catch (Exception $e) {
    writeLog($e->getMessage(), "statistics.log");
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
