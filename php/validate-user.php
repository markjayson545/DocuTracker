<?php 
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

    // GET POST DATA
    $email = $_POST['email'];
    $password = $_POST['password'];

    // Check if email exists
    $checkEmail = "SELECT * FROM users WHERE email = '$email'";
    $result = $conn->query($checkEmail);
    if($result->num_rows == 0) {
        echo json_encode(["success" => false, "message" => "Email not found"]);
        exit;
    }
    // Fetch user data
    $user = $result->fetch_assoc();
    // Verify password
    if(!password_verify($password, $user['password'])) {
        echo json_encode(["success" => false, "message" => "Invalid password"]);
        exit;
    }
    // Check if user is verified
    if(!$user['is_verified']) {
        echo json_encode(["success" => false, "message" => "User not verified"]);
        exit;
    }
    

?>