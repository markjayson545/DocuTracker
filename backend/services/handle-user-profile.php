<?php
require 'open-db.php';
include 'logger.php';
session_start();

function updateUserProfile($path, $userId){
    global $conn;
    $sql = "UPDATE User SET profile_picture = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("si", $path, $userId);
    if ($stmt->execute()) {
        return true;
    } else {
        return false;
    }
}

function uploadProfilePicture($file, $userId){
    $targetDir = __DIR__ . "/../../userfiles/" . $userId . "/profile_pictures/";
    $targetFile = $targetDir . basename($file["name"]);
    $check = getimagesize($file["tmp_name"]);
    if ($check === false) {
        return false;
    }
    if (move_uploaded_file($file["tmp_name"], $targetFile)) {
        return updateUserProfile($targetFile, $userId);
    } else {
        return false;
    }
}

function getPicturePath($userId){
    global $conn;
    $sql = "SELECT profile_picture FROM User WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $stmt->bind_result($path);
    $stmt->fetch();
    return $path;
}

try {
    $userId = $_SESSION['user_id'] ?? null;
    $action = $_POST['action'] ?? null;
    if (!isset($userId) || !isset($action)) {
        throw new Exception('Invalid request');
    }

    switch ($action) {
        case 'updateProfile':
            $profilePicture = $_FILES['profile_picture'] ?? null;
            if ($profilePicture){
                if(uploadProfilePicture($profilePicture, $userId)){
                    echo json_encode([
                        'success' => true,
                        'message' => 'Profile picture updated successfully',
                    ]);
                } else {
                    throw new Exception('Failed to update profile picture');
                }
            } else {
                throw new Exception('No file uploaded');
            }
            break;
            case 'getProfilePicture':
            $profilePicturePath = getPicturePath($userId);
            if ($profilePicturePath) {
                echo json_encode([
                    'success' => true,
                    'profile_picture' => $profilePicturePath
                ]);
            } else {
                throw new Exception('Failed to retrieve profile picture');
            }
            break;
        default:
            echo json_encode([
                'status' => 'error',
                'message' => 'Invalid action'
            ]);
            break;
    }
} catch (Exception $e) {
    writeLog($e->getMessage(), "user-settings.log");
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}

?>