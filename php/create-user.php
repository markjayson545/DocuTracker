<?php
    // Set header to return JSON
    header('Content-Type: application/json');

    // Database Credentials
    $servername = "localhost";
    $username = "root";
    $password = "";
    $dbname = "docutracker";

    $conn = new mysqli($servername, $username, $password, $dbname);

    // Check connection
    if($conn->connect_error){
        echo json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]);
        exit;
    }

    // Create Table
    $createTable = "CREATE TABLE IF NOT EXISTS users(
        id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(30) NOT NULL UNIQUE,
        phone VARCHAR(15) NOT NULL UNIQUE,
        email VARCHAR(50) NOT NULL UNIQUE,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        password VARCHAR(50) NOT NULL
    )";

    // Get POST Data
    $username = $_POST['username'];
    $phone = $_POST['phone'];
    $email = $_POST['email'];
    $password = $_POST['password'];
    $confirmpassword = $_POST['confirm-password'];

    // Validate passwords match
    if ($password !== $confirmpassword) {
        echo json_encode(["success" => false, "message" => "Passwords do not match"]);
        exit;
    }

    // Insert Data
    if ($conn->query($createTable) === TRUE) {
        // Check if username already exists
        $checkUsername = "SELECT * FROM users WHERE username = '$username'";
        $result = $conn->query($checkUsername);
        if($result->num_rows > 0) {
            echo json_encode(["success" => false, "message" => "Username already exists"]);
            exit;
        }
        
        // Check if email already exists
        $checkEmail = "SELECT * FROM users WHERE email = '$email'";
        $result = $conn->query($checkEmail);
        if($result->num_rows > 0) {
            echo json_encode(["success" => false, "message" => "Email already exists"]);
            exit;
        }
        
        // Check if phone already exists
        $checkPhone = "SELECT * FROM users WHERE phone = '$phone'";
        $result = $conn->query($checkPhone);
        if($result->num_rows > 0) {
            echo json_encode(["success" => false, "message" => "Phone number already exists"]);
            exit;
        }
        
        $sql = "INSERT INTO users (username, phone, email, password) VALUES ('$username', '$phone', '$email', '$password')";

        if ($conn->query($sql) === TRUE) {
            echo json_encode(["success" => true, "message" => "User created successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error: " . $sql . "<br>" . $conn->error]);
        }

    } else {
        echo json_encode(["success" => false, "message" => "Error creating table: " . $conn->error]);
    }

    // Close connection
    $conn->close();
?>