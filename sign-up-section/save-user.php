<?php

    // Database Credentials
    $servername = "localhost";
    $username = "root";
    $password = "";
    $dbname = "usercredentials";

    $conn = new mysqli($servername, $username, $password, $dbname);

    // Check connection
    if($conn->connect_error){
        die("Connection failed: " . $conn->connect_error);
    }

    // Create Table
    $createTable = "CREATE TABLE IF NOT EXISTS users(
        id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(30) NOT NULL,
        email VARCHAR(50) NOT NULL,
        password VARCHAR(50) NOT NULL
    )";

    // Get POST Data
    $username = $_POST['username'];
    $email = $_POST['email'];
    $password = $_POST['password'];
    $confirmpassword = $_POST['confirm-password'];

    

    // Insert Data
    if ($conn->query($createTable) === TRUE) {
        $sql = "INSERT INTO users (username, email, password) VALUES ('$username', '$email', '$password')";

        if ($conn->query($sql) === TRUE && $password == $confirmpassword) {
            echo "User created successfully";
        } else {
            echo "Error: " . $sql . "<br>" . $conn->error;
        }

    } else {
        echo "Error creating table: " . $conn->error;
    }

?>