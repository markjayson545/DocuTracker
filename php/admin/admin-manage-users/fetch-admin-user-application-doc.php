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

    $sql = "SELECT application_id FROM Application WHERE user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows === 1) {
        $applicationId = $result->fetch_assoc()['application_id'];
    } else {
        throw new Exception('Expected exactly one application ID, but found none or multiple');
    }
    $sql = "SELECT * FROM ApplicationDocuments WHERE application_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $applicationId);
    $stmt->execute();
    $result = $stmt->get_result();
    $documents = [];
    while ($row = $result->fetch_assoc()) {
        $documents[] = [
            'document_id' => $row['document_id'],
            'document_type' => $row['document_type'],
            'document_path' => $row['document_path'],
            'uploaded_at' => $row['updated_at'],
        ];
    }

    if (!empty($documents)) {
        echo json_encode([
            'success' => true,
            'documents' => $documents
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'No documents found'
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
