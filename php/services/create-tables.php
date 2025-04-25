<?php

require 'open-db.php';
include 'logger.php';

writeLog("Creating tables...", "create-tables.log");
// Complete the createTable function
function createTable($conn, $sql)
{
    // Extract table name from SQL for better logging
    preg_match('/CREATE TABLE IF NOT EXISTS ([^\(]+)/i', $sql, $matches);
    $tableName = trim($matches[1] ?? 'Unknown');

    if ($conn->query($sql) === TRUE) {
        $message = "Table '$tableName' created or already exists";
        writeLog($message, "create-tables.log");
    } else {
        $message = "Error creating table '$tableName': " . $conn->error;
        writeLog($message, "create-tables.log");
    }
}

// User Credentials
$userSql = "CREATE TABLE IF NOT EXISTS User(
            id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(30) NOT NULL UNIQUE,
            phone VARCHAR(15) NOT NULL UNIQUE,
            email VARCHAR(50) NOT NULL UNIQUE,
            role VARCHAR(255) DEFAULT 'client',
            is_verified BOOLEAN DEFAULT FALSE,
            status VARCHAR(50) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            password VARCHAR(255) NOT NULL
        )";

// Applicant Verification Table
$applicationSql = "CREATE TABLE IF NOT EXISTS Application(
            application_id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id INT(6) UNSIGNED UNIQUE NOT NULL,
            FOREIGN KEY (user_id) REFERENCES User(id),
            document_type VARCHAR(50) NOT NULL,
            document_path TEXT,
            status VARCHAR(50) DEFAULT 'pending',
            admin_notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )";


// Client Profile Table
$clientProfileSql = "CREATE TABLE IF NOT EXISTS ClientProfile(
            client_id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id INT(6) UNSIGNED UNIQUE NOT NULL,
            FOREIGN KEY (user_id) REFERENCES User(id),
            first_name VARCHAR(30) NOT NULL,
            middle_name VARCHAR(30),
            last_name VARCHAR(30) NOT NULL,
            qualifier VARCHAR(30),
            sex VARCHAR(10) NOT NULL,
            civil_status VARCHAR(20) NOT NULL,
            birthdate DATE NOT NULL,
            birthplace VARCHAR(50) NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";

// Contact Address Table
$contactAddressSql = "CREATE TABLE IF NOT EXISTS ContactAddress(
            contact_id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id INT(6) UNSIGNED UNIQUE NOT NULL,
            FOREIGN KEY (user_id) REFERENCES User(id),
            house_number_building_name VARCHAR(50),
            street_name VARCHAR(50) NOT NULL,
            subdivision_barangay VARCHAR(50) NOT NULL,
            city_municipality VARCHAR(50) NOT NULL,
            province VARCHAR(50) NOT NULL
            )";

// Contact Address Table
$userDetailsSql = "CREATE TABLE IF NOT EXISTS UserDetails(
            details_id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id INT(6) UNSIGNED UNIQUE NOT NULL,
            FOREIGN KEY (user_id) REFERENCES User(id),
            height DECIMAL(15) NOT NULL,
            weight DECIMAL(15) NOT NULL,
            complexion VARCHAR(20) NOT NULL,
            blood_type VARCHAR(10) NOT NULL,
            religion VARCHAR(20) NOT NULL,
            educational_attainment VARCHAR(50) NOT NULL,
            occupation VARCHAR(50) NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";

// Document Request Table
$requestSql = "CREATE TABLE IF NOT EXISTS Request(
            request_id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id INT(6) UNSIGNED NOT NULL,
            FOREIGN KEY (user_id) REFERENCES User(id),
            document_type_id INT(6) UNSIGNED NOT NULL,
            FOREIGN KEY (document_type_id) REFERENCES DocumentTypes(document_type_id),
            document_path TEXT,
            status VARCHAR(50) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )";


// Payments Table
$paymentSql = "CREATE TABLE IF NOT EXISTS Payment(
            payment_id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id INT(6) UNSIGNED NOT NULL,
            FOREIGN KEY (user_id) REFERENCES User(id),
            request_id INT(6) UNSIGNED,
            FOREIGN KEY (request_id) REFERENCES Request(request_id),
            mode_of_payment VARCHAR(50) NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            status VARCHAR(50) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )";

// Audit Log Table
$auditLogSql = "CREATE TABLE IF NOT EXISTS AuditLog(
            log_id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id INT(6) UNSIGNED NOT NULL,
            FOREIGN KEY (user_id) REFERENCES User(id),
            title VARCHAR(255) NOT NULL,
            action VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )";

// Notifications Table
$notificationSql = "CREATE TABLE IF NOT EXISTS Notification(
            notification_id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id INT(6) UNSIGNED NOT NULL,
            FOREIGN KEY (user_id) REFERENCES User(id),
            message TEXT NOT NULL,
            status VARCHAR(50) DEFAULT 'unread',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )";

// System Notifications Table
$systemNotificationSql = "CREATE TABLE IF NOT EXISTS SystemNotification(
            system_notification_id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            type VARCHAR(50) NOT NULL,
            status VARCHAR(50) DEFAULT 'unread',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )";

// Session Tokens Table
$sessionTokensSql = "CREATE TABLE IF NOT EXISTS SessionTokens(
            token_id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id INT(6) UNSIGNED NOT NULL,
            FOREIGN KEY (user_id) REFERENCES User(id),
            token VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at DATETIME NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )";

// Document Types Table
$documentTypesSql = "CREATE TABLE IF NOT EXISTS DocumentTypes(
            document_type_id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            document_type VARCHAR(50) NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )";

try {
    createTable($conn, $userSql);
    createTable($conn, $applicationSql);
    createTable($conn, $clientProfileSql);
    createTable($conn, $contactAddressSql);
    createTable($conn, $userDetailsSql);
    createTable($conn, $documentTypesSql);
    createTable($conn, $requestSql);
    createTable($conn, $paymentSql);
    createTable($conn, $auditLogSql);
    createTable($conn, $notificationSql);
    createTable($conn, $systemNotificationSql);
    createTable($conn, $sessionTokensSql);

    writeLog("Tables created successfully", "create-tables.log");
    echo json_encode(
        [
            "status" => "success",
            "message" => "Tables created successfully."
        ]
    );
    mysqli_close($conn);
} catch (\Throwable $th) {
    writeLog("Error creating tables: " . $th->getMessage(), "create-tables.log");
}
