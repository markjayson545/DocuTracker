<?php
require __DIR__ . '/../../services/open-db.php';
include __DIR__ . '/../../services/logger.php';
session_start();

// Get user ID from session
$userId = $_SESSION['user_id'];

// Check if the user has already filled out the profile or contact form

try {
    $hasProfile = false;
    $hasContact = false;
    $hasDetails = false;

    // Check ClientProfile
    $sql = "SELECT * FROM ClientProfile WHERE user_id = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "s", $userId);
    mysqli_stmt_execute($stmt);
    $result = $stmt->get_result();
    $profileData = $result->fetch_assoc();
    $hasProfile = ($result->num_rows > 0);
    mysqli_stmt_close($stmt);

    // Check ContactAddress
    $sql = "SELECT * FROM ContactAddress WHERE user_id = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "s", $userId);
    mysqli_stmt_execute($stmt);
    $result = $stmt->get_result();
    $contactData = $result->fetch_assoc();
    $hasContact = ($result->num_rows > 0);
    mysqli_stmt_close($stmt);

    // Check UserDetails - fixed to follow the same pattern as other queries
    $sql = "SELECT * FROM UserDetails WHERE user_id = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "s", $userId);
    mysqli_stmt_execute($stmt);
    $result = $stmt->get_result();
    $detailsData = $result->fetch_assoc();
    $hasDetails = ($result->num_rows > 0);
    mysqli_stmt_close($stmt);

    // If user has filled out either form, return error message and stop execution
    if ($hasProfile || $hasContact) {
        $stackData = "Stack trace: \n Profile Data: " . json_encode($profileData). "\n Contact Data: " . json_encode($contactData) . "\n Details Data: " . json_encode($detailsData);
        writeLog("User with ID $userId has already filled out the form. \n  " . $stackData, "get-personal-information.log");
        echo json_encode([
            'exists' => true,
            'message' => 'You have already filled out the form',

            'has_profile' => $hasProfile,
            'has_contact' => $hasContact,
            'has_details' => $hasDetails,

            'profile_data' => $profileData,
            'contact_data' => $contactData,
            'details_data' => $detailsData
        ]);
        mysqli_close($conn);
        exit;
    } else {
        writeLog("User with ID $userId has not filled out the form yet.", "get-personal-information.log");
        echo json_encode([
            'exists' => false,
            'message' => 'You have not filled out the form yet',

            'has_profile' => $hasProfile,
            'has_contact' => $hasContact,
            'has_details' => $hasDetails,

            'profile_data' => $profileData,
            'contact_data' => $contactData,
            'details_data' => $detailsData
        ]);
        mysqli_close($conn);
        exit;
    }
} catch (\Throwable $th) {
    writeLog($th, "get-personal-information.log");
    echo json_encode([
        'success' => false,
        'message' => 'Error retrieving personal information',
        'error' => $th->getMessage(),
    ]);
} finally {
    mysqli_close($conn);
    exit;
}
