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
    $documentType = $_POST['document_type'] ?? null;
    $file = $_FILES['verification-document'] ?? null;
    if (!$file) {
        echo json_encode(['status' => 'error', 'message' => 'No file uploaded']);
        exit;
    }
    $fileExt = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'pdf'];
    if (!in_array($fileExt, $allowed)) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid file type.']);
        exit;
    }
    $directory = '/home/mark/apache-xampp-hosting/docutracker/userfiles/' . $userId . '/verification/' . $documentType . '/';
    if (!is_dir($directory)) {
        mkdir($directory, 0777, true);
    }
    $fileNameNew = date('YmdTHis') . "." . $fileExt;
    $fileDestination = $directory . $fileNameNew;
    if (!move_uploaded_file($file['tmp_name'], $fileDestination)) {
        echo json_encode(['status' => 'error', 'message' => 'Failed to save the uploaded file.']);
        exit;
    }
    // Update DB
    $stmt = $conn->prepare("UPDATE ApplicationDocuments SET document_type = ?, document_path = ?, updated_at = NOW() WHERE document_id = ?");
    $stmt->bind_param("ssi", $documentType, $fileDestination, $documentId);
    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Document updated successfully.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to update document.']);
    }
    $stmt->close();
} catch (Throwable $th) {
    echo json_encode(['status' => 'error', 'message' => $th->getMessage()]);
}
