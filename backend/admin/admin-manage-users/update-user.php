<?php
require __DIR__ . '/../../services/open-db.php';
include __DIR__ . '/../../services/logger.php';
session_start();

header('Content-Type: application/json');

try {
    // Check if user is logged in and is admin
    $admin_id = $_SESSION['user_id'] ?? null;
    $role = $_SESSION['role'] ?? null;
    
    if (!$admin_id || $role !== 'admin') {
        writeLog("Unauthorized access attempt to update user data", "admin-manage-users.log");
        echo json_encode([
            'success' => false,
            'message' => 'Unauthorized access'
        ]);
        exit;
    }

    // Get user ID and form data
    $user_id = $_POST['user_id'] ?? null;
    
    if (!$user_id) {
        throw new Exception('User ID not provided');
    }

    // Begin transaction
    $conn->begin_transaction();

    // Update User table
    $updateUser = $conn->prepare("UPDATE User SET email = ?, phone = ? WHERE id = ?");
    $updateUser->bind_param("ssi", 
        $_POST['email'],
        $_POST['phone'],
        $user_id
    );
    $updateUser->execute();

    // Update or insert into ClientProfile
    $checkProfile = $conn->prepare("SELECT user_id FROM ClientProfile WHERE user_id = ?");
    $checkProfile->bind_param("i", $user_id);
    $checkProfile->execute();
    $profileResult = $checkProfile->get_result();

    if ($profileResult->num_rows > 0) {
        $updateProfile = $conn->prepare("UPDATE ClientProfile SET 
            first_name = ?, 
            middle_name = ?, 
            last_name = ?, 
            sex = ?, 
            civil_status = ?,
            birthdate = ?,
            birthplace = ?
            WHERE user_id = ?");
        
        $updateProfile->bind_param("sssssssi", 
            $_POST['first-name'],
            $_POST['middle-name'],
            $_POST['last-name'],
            $_POST['sex'],
            $_POST['civil-status'],
            $_POST['dob'],
            $_POST['birth-place'],
            $user_id
        );
        $updateProfile->execute();
    } else {
        $insertProfile = $conn->prepare("INSERT INTO ClientProfile 
            (user_id, first_name, middle_name, last_name, sex, civil_status, birthdate, birthplace)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        
        $insertProfile->bind_param("isssssss", 
            $user_id,
            $_POST['first-name'],
            $_POST['middle-name'],
            $_POST['last-name'],
            $_POST['sex'],
            $_POST['civil-status'],
            $_POST['dob'],
            $_POST['birth-place']
        );
        $insertProfile->execute();
    }

    // Update or insert into ContactAddress
    $checkAddress = $conn->prepare("SELECT user_id FROM ContactAddress WHERE user_id = ?");
    $checkAddress->bind_param("i", $user_id);
    $checkAddress->execute();
    $addressResult = $checkAddress->get_result();

    if ($addressResult->num_rows > 0) {
        $updateAddress = $conn->prepare("UPDATE ContactAddress SET 
            house_number_building_name = ?,
            street_name = ?,
            subdivision_barangay = ?,
            city_municipality = ?,
            province = ?
            WHERE user_id = ?");
        
        $updateAddress->bind_param("sssssi", 
            $_POST['house-num'],
            $_POST['street'],
            $_POST['barangay'],
            $_POST['city'],
            $_POST['province'],
            $user_id
        );
        $updateAddress->execute();
    } else {
        $insertAddress = $conn->prepare("INSERT INTO ContactAddress 
            (user_id, house_number_building_name, street_name, subdivision_barangay, city_municipality, province)
            VALUES (?, ?, ?, ?, ?, ?)");
        
        $insertAddress->bind_param("isssss", 
            $user_id,
            $_POST['house-num'],
            $_POST['street'],
            $_POST['barangay'],
            $_POST['city'],
            $_POST['province']
        );
        $insertAddress->execute();
    }

    // Update or insert into UserDetails
    $checkDetails = $conn->prepare("SELECT user_id FROM UserDetails WHERE user_id = ?");
    $checkDetails->bind_param("i", $user_id);
    $checkDetails->execute();
    $detailsResult = $checkDetails->get_result();

    if ($detailsResult->num_rows > 0) {
        $updateDetails = $conn->prepare("UPDATE UserDetails SET 
            height = ?,
            weight = ?,
            complexion = ?,
            blood_type = ?,
            religion = ?,
            nationality = ?,
            educational_attainment = ?,
            occupation = ?
            WHERE user_id = ?");
        
        $updateDetails->bind_param("ssssssssi", 
            $_POST['height'],
            $_POST['weight'],
            $_POST['complexion'],
            $_POST['blood-type'],
            $_POST['religion'],
            $_POST['nationality'],
            $_POST['education'],
            $_POST['occupation'],
            $user_id
        );
        $updateDetails->execute();
    } else {
        $insertDetails = $conn->prepare("INSERT INTO UserDetails 
            (user_id, height, weight, complexion, blood_type, religion, nationality, educational_attainment, occupation)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        $insertDetails->bind_param("issssssss", 
            $user_id,
            $_POST['height'],
            $_POST['weight'],
            $_POST['complexion'],
            $_POST['blood-type'],
            $_POST['religion'],
            $_POST['nationality'],
            $_POST['education'],
            $_POST['occupation']
        );
        $insertDetails->execute();
    }

    // Log the update action
    writeLog("Admin (ID: $admin_id) updated user (ID: $user_id) information", "admin-manage-users.log");
    
    // Commit transaction
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'User information updated successfully'
    ]);

} catch (\Throwable $th) {
    // Rollback transaction in case of error
    if (isset($conn)) {
        try {
            $conn->rollback();
        } catch (\Throwable $e) {
            writeLog("Error during rollback: " . $e->getMessage(), "admin-manage-users.log");
        }
    }
    
    writeLog("Error updating user: " . $th->getMessage(), "admin-manage-users.log");
    echo json_encode([
        'success' => false,
        'message' => 'Error updating user information: ' . $th->getMessage()
    ]);
} finally {
    if (isset($conn)) {
        mysqli_close($conn);
    }
}
?>
