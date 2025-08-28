<?php
require __DIR__ . '/../../services/open-db.php';
session_start();

try {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'User not authenticated']);
        exit;
    }
    $userId = $_SESSION['user_id'];
    $documentId = $_POST['document_id'] ?? null;
    if (!$documentId) {
        echo json_encode(['status' => 'error', 'message' => 'No document specified']);
        exit;
    }
    // Check ownership
    $stmt = $conn->prepare("SELECT ad.document_path FROM ApplicationDocuments ad JOIN Application a ON ad.application_id = a.application_id WHERE ad.document_id = ? AND a.user_id = ?");
    $stmt->bind_param("ii", $documentId, $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        echo json_encode(['status' => 'error', 'message' => 'Document not found or not owned by user']);
        exit;
    }
    $filePath = $result->fetch_assoc()['document_path'];
    $stmt->close();
    // Delete from DB
    $stmt = $conn->prepare("DELETE FROM ApplicationDocuments WHERE document_id = ?");
    $stmt->bind_param("i", $documentId);
    $stmt->execute();
    $stmt->close();
    // Delete file
    if (file_exists($filePath)) {
        unlink($filePath);
    }
    echo json_encode(['status' => 'success', 'message' => 'Document deleted']);
} catch (Throwable $th) {
    echo json_encode(['status' => 'error', 'message' => $th->getMessage()]);
}
