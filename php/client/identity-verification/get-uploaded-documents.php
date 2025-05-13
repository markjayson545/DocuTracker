<?php
require __DIR__ . '/../../services/open-db.php';
session_start();

try {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'User not authenticated']);
        exit;
    }
    $userId = $_SESSION['user_id'];
    // Get application id
    $stmt = $conn->prepare("SELECT application_id FROM Application WHERE user_id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        echo json_encode(['status' => 'success', 'documents' => []]);
        exit;
    }
    $applicationId = $result->fetch_assoc()['application_id'];
    $stmt->close();
    // Fetch all documents for this application
    $stmt = $conn->prepare("SELECT document_id, document_type, document_path, created_at FROM ApplicationDocuments WHERE application_id = ? ORDER BY created_at DESC");
    $stmt->bind_param("i", $applicationId);
    $stmt->execute();
    $result = $stmt->get_result();
    $documents = [];
    while ($row = $result->fetch_assoc()) {
        $documents[] = $row;
    }
    $stmt->close();
    echo json_encode(['status' => 'success', 'documents' => $documents]);
} catch (Throwable $th) {
    echo json_encode(['status' => 'error', 'message' => $th->getMessage()]);
}