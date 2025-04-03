<?php
    try {
        require 'open-db.php';
        include 'logger.php';

        if($_SERVER['REQUEST_METHOD'] === 'POST'){

            session_start();

            $userId = $_SESSION['user-id'];

            $sql = "SELECT * FROM ClientProfile WHERE user_id = ?";
            $stmt = mysqli_prepare($conn, $sql);
            mysqli_stmt_bind_param($stmt, "s", $userId);
            mysqli_stmt_execute($stmt);
            mysqli_stmt_store_result($stmt);

            // TODO: Check if the user has already filled out the form

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

            $sql = "INSERT INTO ClientProfile (user_id, first_name, middle_name, last_name, qualifier, sex, civil_status, birthdate, birthplace) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = mysqli_prepare($conn, $sql);
            mysqli_stmt_bind_param($stmt, "sssssssss", $userId, $first_name, $middle_name, $last_name, $qualifier, $sex, $civil_status, $dob, $birth_place);
            mysqli_stmt_execute($stmt);
            mysqli_stmt_close($stmt);


            $sql = "INSERT INTO ContactAddress (user_id, house_number_building_name, street_name, subdivision_barangay, city_municipality, province) VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = mysqli_prepare($conn, $sql);
            mysqli_stmt_bind_param($stmt, "ssssss", $userId, $house_num, $street, $barangay, $city, $province);
            mysqli_stmt_execute($stmt);
            mysqli_stmt_close($stmt);

            echo json_encode(
                [
                    'success' => true,
                    'message' => 'Personal Information Saved Successfully'
                ]
                );

        }
    } catch (\Throwable $th) {
        //throw $th;
    }
?>