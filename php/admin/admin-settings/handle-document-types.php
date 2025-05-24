<?php

require __DIR__ . '/../../services/open-db.php';
include __DIR__ . '/../../services/logger.php';
session_start();

function getAllDocumentTypes() {
    global $conn;
    $sql = "SELECT * FROM DocumentTypes";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $fetched = $stmt->get_result();
    $result = [];
    while ($row = $fetched->fetch_assoc()) {
        $result[] = [
            'document_type_id' => $row['document_type_id'],
            'document_type' => $row['document_type'],
            'price' => $row['price'],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at']
        ];
    }
    return $result;
}

function addDocumentType($documentType, $price) {
    global $conn;
    $sql = "INSERT INTO DocumentTypes (document_type, price) VALUES (?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sd", $documentType, $price);
    return $stmt->execute();
}

function updateDocumentType($documentTypeId, $documentType, $price) {
    global $conn;
    $sql = "UPDATE DocumentTypes SET document_type = ?, price = ? WHERE document_type_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sdi", $documentType, $price, $documentTypeId);
    return $stmt->execute();
}

function deleteDocumentType($documentTypeId) {
    global $conn;
    $sql = "DELETE FROM DocumentTypes WHERE document_type_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $documentTypeId);
    return $stmt->execute();
}

try {
    $userId = $_SESSION['user_id'];
    $role = $_SESSION['role'];
    $action = $_POST['action'];

    if ($userId == null || $role == null) {
        throw new Exception('User not logged in');
    }
    if ($role != 'admin') {
        throw new Exception('User not authorized');
    }

    switch ($action) {
        case 'getAllDocumentTypes':
            $documentTypes = getAllDocumentTypes();
            echo json_encode([
                'status' => true,
                'document_types' => $documentTypes
            ]);
            break;

        case 'addDocumentType':
            $documentType = $_POST['document_type'];
            $price = $_POST['price'];
            if (addDocumentType($documentType, $price)) {
                echo json_encode([
                    'status' => true,
                    'message' => 'Document type added successfully'
                ]);
            } else {
                throw new Exception('Failed to add document type');
            }
            break;

        case 'updateDocumentType':
            $documentTypeId = $_POST['document_type_id'];
            $documentType = $_POST['document_type'];
            $price = $_POST['price'];
            if (updateDocumentType($documentTypeId, $documentType, $price)) {
                echo json_encode([
                    'status' => true,
                    'message' => 'Document type updated successfully'
                ]);
            } else {
                throw new Exception('Failed to update document type');
            }
            break;

        case 'deleteDocumentType':
            $documentTypeId = $_POST['document_type_id'];
            if (deleteDocumentType($documentTypeId)) {
                echo json_encode([
                    'status' => true,
                    'message' => 'Document type deleted successfully'
                ]);
            } else {
                throw new Exception('Failed to delete document type');
            }
            break;

        default:
            throw new Exception('Invalid action');
    }


} catch (\Throwable $th) {
    writeLog('Error: ' . $th->getMessage(), 'handle-document-types.log');
    echo json_encode([
        'status' => 'error',
        'message' => $th->getMessage()
    ]);
} finally {
    mysqli_close($conn);
}


?>