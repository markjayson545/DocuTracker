<?php
// Make sure output buffering is on to prevent headers already sent errors

ob_start();

// Enable error reporting for development
ini_set('display_errors', 0); // Set to 0 for production
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

// Always set Content-Type header for JSON
header('Content-Type: application/json');

include 'create-tables.php';

// Function to safely write logs
function safeLogError($message)
{
    $logLocations = [
        "../logs/error_log.txt",
        "./logs/error_log.txt",
        "error_log.txt",
        sys_get_temp_dir() . "/docutracker_error_log.txt"
    ];

    foreach ($logLocations as $location) {
        try {
            // Try to create directory if it doesn't exist
            $dir = dirname($location);
            if (!empty($dir) && $dir != "." && !file_exists($dir)) {
                @mkdir($dir, 0755, true); // Use @ to suppress warnings
            }

            // Try to write to log file
            if (@error_log($message . "\n", 3, $location)) {
                return true;
            }
        } catch (Exception $e) {
            // Just try the next location
            continue;
        }
    }

    // If all fail, try the default PHP error log
    @error_log($message);
    return false;
}

// Capture PHP errors
function handleError($errno, $errstr, $errfile, $errline)
{
    $errorDump = [
        "success" => false,
        "message" => "PHP Error Occurred",
        "timestamp" => date("Y-m-d H:i:s"),
        "error_details" => [
            "type" => $errno,
            "message" => $errstr,
            "file" => $errfile,
            "line" => $errline
        ]
    ];

    safeLogError(json_encode($errorDump));
    echo json_encode($errorDump);
    exit;
}
set_error_handler("handleError");

// Catch fatal errors
register_shutdown_function(function () {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        header('Content-Type: application/json');
        echo json_encode([
            "success" => false,
            "message" => "Fatal PHP Error",
            "timestamp" => date("Y-m-d H:i:s"),
            "error_details" => $error
        ]);
    }
});

try {
    // Function to create error dump
    function createErrorDump($message, $errorDetails = null)
    {
        $errorDump = [
            "success" => false,
            "message" => $message,
            "timestamp" => date("Y-m-d H:i:s"),
            "error_details" => $errorDetails
        ];

        // Log error to file safely
        safeLogError(json_encode($errorDump));

        return $errorDump;
    }

    // Database Credentials
    $servername = "localhost";
    $username = "root";
    $password = "";
    $dbname = "docutracker";

    // Don't try to create logs directory automatically anymore
    // Instead use the safeLogError function which tries multiple locations

    $conn = new mysqli($servername, $username, $password, $dbname);

    // Check connection
    if ($conn->connect_error) {
        echo json_encode(createErrorDump("Connection failed", $conn->connect_error));
        exit;
    }

    // Create Table with proper password column size
    $createTable = "CREATE TABLE IF NOT EXISTS User(
            id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(30) NOT NULL UNIQUE,
            phone VARCHAR(15) NOT NULL UNIQUE,
            email VARCHAR(50) NOT NULL UNIQUE,
            role VARCHAR(255) DEFAULT 'client',
            is_verified BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            password VARCHAR(255) NOT NULL
        )";

    if ($conn->query($createTable) !== TRUE) {
        echo json_encode(createErrorDump("Error creating table", $conn->error));
        exit;
    }

    // Check if we need to alter the password column
    $checkPasswordColumn = "SELECT CHARACTER_MAXIMUM_LENGTH 
                                FROM INFORMATION_SCHEMA.COLUMNS 
                                WHERE TABLE_SCHEMA = '$dbname' 
                                AND TABLE_NAME = 'User' 
                                AND COLUMN_NAME = 'password'";

    $result = $conn->query($checkPasswordColumn);
    if ($result && $row = $result->fetch_assoc()) {
        $maxLength = (int) $row['CHARACTER_MAXIMUM_LENGTH'];
        if ($maxLength < 255) {
            // Alter the table to increase password column size
            $alterTable = "ALTER TABLE User MODIFY password VARCHAR(255) NOT NULL";
            if (!$conn->query($alterTable)) {
                echo json_encode(createErrorDump("Error altering password column", $conn->error));
                exit;
            }
            safeLogError("Password column size increased from $maxLength to 255");
        }
    }

    // Get POST Data
    $username = isset($_POST['username']) ? trim($_POST['username']) : '';
    $phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';
    $confirmpassword = isset($_POST['confirm-password']) ? $_POST['confirm-password'] : '';

    // Dump received data for debugging (remove in production)
    $requestDump = [
        "post_data" => $_POST,
        "sanitized_data" => [
            "username" => $username,
            "phone" => $phone,
            "email" => $email,
            "password" => "REDACTED",
            "confirm_password" => "REDACTED"
        ]
    ];
    safeLogError(json_encode($requestDump));

    // Sanitize and validate inputs
    $username = htmlspecialchars($username);
    $phone = htmlspecialchars($phone);
    $email = filter_var($email, FILTER_SANITIZE_EMAIL);

    // Basic server-side validation
    if (empty($username) || strlen($username) < 3) {
        echo json_encode(["success" => false, "message" => "Username must be at least 3 characters"]);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["success" => false, "message" => "Please enter a valid email address"]);
        exit;
    }

    if (empty($phone)) {
        echo json_encode(["success" => false, "message" => "Phone number is required"]);
        exit;
    }

    // Validate passwords match
    if ($password !== $confirmpassword) {
        echo json_encode(["success" => false, "message" => "Passwords do not match"]);
        exit;
    }

    if (strlen($password) < 6) {
        echo json_encode(["success" => false, "message" => "Password must be at least 6 characters"]);
        exit;
    }

    // Check if username already exists
    $checkUsername = "SELECT * FROM User WHERE username = ?";
    $stmt = $conn->prepare($checkUsername);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows > 0) {
        echo json_encode(["success" => false, "message" => "Username already exists"]);
        exit;
    }

    // Check if email already exists
    $checkEmail = "SELECT * FROM User WHERE email = ?";
    $stmt = $conn->prepare($checkEmail);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows > 0) {
        echo json_encode(["success" => false, "message" => "Email already exists"]);
        exit;
    }

    // Check if phone already exists
    $checkPhone = "SELECT * FROM User WHERE phone = ?";
    $stmt = $conn->prepare($checkPhone);
    $stmt->bind_param("s", $phone);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows > 0) {
        echo json_encode(["success" => false, "message" => "Phone number already exists"]);
        exit;
    }

    // Hash the password with controlled length
    // Using PASSWORD_DEFAULT which is currently bcrypt (produces ~60 char hash)
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Check hash length as a safeguard
    if (strlen($hashed_password) > 255) {
        echo json_encode(createErrorDump("Password hash too long", [
            "hash_length" => strlen($hashed_password),
            "max_column_length" => 255
        ]));
        exit;
    }

    // Log hash length for debugging
    safeLogError("Password hash length: " . strlen($hashed_password));

    // Insert user with prepared statement
    $sql = "INSERT INTO User (username, phone, email, password) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        echo json_encode(createErrorDump("Prepare statement failed", $conn->error));
        exit;
    }

    $stmt->bind_param("ssss", $username, $phone, $email, $hashed_password);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "User created successfully! Redirecting to login..."]);
    } else {
        // Special handling for data too long error
        if ($stmt->errno == 1406) {
            echo json_encode(createErrorDump("Password hash too long for database column", [
                "error_code" => $stmt->errno,
                "error_message" => $stmt->error,
                "hash_length" => strlen($hashed_password),
                "solution" => "The database column needs to be altered to VARCHAR(255)"
            ]));
        } else {
            echo json_encode(createErrorDump("Error creating account", $stmt->error));
        }
        exit;
    }

    // Close connection
    $stmt->close();
    $conn->close();
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Server error occurred",
        "timestamp" => date("Y-m-d H:i:s"),
        "error_details" => [
            "message" => $e->getMessage(),
            "code" => $e->getCode(),
            "file" => $e->getFile(),
            "line" => $e->getLine()
        ]
    ]);
}

// Make sure to flush the output buffer
ob_end_flush();
