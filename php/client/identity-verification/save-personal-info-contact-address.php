<?php
try {
    require __DIR__ . '/../../services/open-db.php';
    include __DIR__ . '/../../services/logger.php';

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {

        session_start();

        $userId = $_SESSION['user_id'];

        // Persanal Details Fieldset
        $first_name = $_POST['first-name'];
        $last_name = $_POST['last-name'];
        $middle_name = $_POST['middle-name'];
        $qualifier = $_POST['qualifier'];

        // Contact Address Fieldset
        $house_num = $_POST['house-num'];
        $street = $_POST['street'];
        $barangay = $_POST['barangay'];
        $city = $_POST['city'];
        $province = $_POST['province'];

        // More Information Fieldset
        $sex = $_POST['sex'];
        $civil_status = $_POST['civil-status'];
        $dob = $_POST['dob'];
        $birth_place = $_POST['birth-place'];
        $height = $_POST['height'];
        $weight = $_POST['weight'];
        $nationality = $_POST['nationality'];
        $complexion = $_POST['complexion'];
        $blood_type = $_POST['blood-type'];
        $religion = $_POST['religion'];
        $education = $_POST['education'];
        $occupation = $_POST['occupation'];

        $sql = "INSERT INTO ClientProfile (user_id, first_name, middle_name, last_name, qualifier, sex, civil_status, birthdate, birthplace) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        first_name = VALUES(first_name),
        middle_name = VALUES(middle_name),
        last_name = VALUES(last_name),
        qualifier = VALUES(qualifier),
        sex = VALUES(sex),
        civil_status = VALUES(civil_status),
        birthdate = VALUES(birthdate),
        birthplace = VALUES(birthplace)";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "sssssssss", $userId, $first_name, $middle_name, $last_name, $qualifier, $sex, $civil_status, $dob, $birth_place);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);

        $sql = "INSERT INTO ContactAddress (user_id, house_number_building_name, street_name, subdivision_barangay, city_municipality, province) 
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        house_number_building_name = VALUES(house_number_building_name),
        street_name = VALUES(street_name),
        subdivision_barangay = VALUES(subdivision_barangay),
        city_municipality = VALUES(city_municipality),
        province = VALUES(province)";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "ssssss", $userId, $house_num, $street, $barangay, $city, $province);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);

        $sql = "INSERT INTO UserDetails (user_id, height, weight, complexion, blood_type, religion, educational_attainment, occupation) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        height = VALUES(height),
        weight = VALUES(weight),
        complexion = VALUES(complexion),
        blood_type = VALUES(blood_type),
        religion = VALUES(religion),
        educational_attainment = VALUES(educational_attainment),
        occupation = VALUES(occupation)";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "ssssssss", $userId, $height, $weight, $complexion, $blood_type, $religion, $education, $occupation);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);

        writeLog("User with ID $userId has successfully saved their personal information.", "save-personal-info-contact-address.log");

        // Return success message
        echo json_encode(
            [
                'success' => true,
                'message' => 'Personal Information Saved Successfully'
            ]
        );
    } else {
        // Return error message
        echo json_encode(
            [
                'success' => false,
                'message' => 'Invalid Request Method'
            ]
        );
    }
} catch (\Throwable $th) {
    //throw $th;
    writeLog($th, "save-personal-info-contact-address.log");
    echo json_encode(
        [
            'success' => false,
            'message' => 'Error Saving Personal Information'
        ]
    );
} finally {
    mysqli_close($conn);
    exit;
}
