<?php

require_once 'open-db.php'; // Use require_once to prevent multiple inclusions
include_once 'logger.php';

// Check if database connection is established
if (!isset($GLOBALS['conn']) || $GLOBALS['conn']->connect_error) {
    writeLog("Database connection failed: " . ($GLOBALS['conn']->connect_error ?? "Connection not established"), "audit-log.log");
    // You may want to throw an exception or handle this differently
}

function writeAuditLog($userId, $title, $action)
{
    try {
        // Validate required parameters
        if (empty($userId) || empty($action)) {
            writeLog("Missing required parameters for audit log", "audit-log.log");
            return false;
        }
        
        $sql = "INSERT INTO AuditLog (user_id, title, action, created_at) VALUES (?, ?, ?, NOW())";
        $stmt = $GLOBALS['conn']->prepare($sql);
        if (!$stmt) {
            writeLog("Prepare statement failed: " . $GLOBALS['conn']->error, "audit-log.log");
            return false;
        }
        $stmt->bind_param("iss", $userId, $title, $action);
        $result = $stmt->execute();
        $stmt->close();
        
        if (!$result) {
            writeLog("Execute failed: Possible database structure issue", "audit-log.log");
            return false;
        }
        
        return true;
    } catch (\Throwable $th) {
        writeLog("Error writing to AuditLog: " . $th->getMessage(), "audit-log.log");
        return false;
    }
}

function getAuditLog($userId)
{
    try {
        // Validate input
        if (empty($userId) || !is_numeric($userId)) {
            writeLog("Invalid user ID for audit log retrieval", "audit-log.log");
            return json_encode(['error' => 'Invalid user ID']);
        }
        
        $sql = "SELECT id, user_id, title, action, created_at FROM AuditLog WHERE user_id = ? ORDER BY created_at DESC";
        $stmt = $GLOBALS['conn']->prepare($sql);
        if (!$stmt) {
            writeLog("Prepare statement failed: " . $GLOBALS['conn']->error, "audit-log.log");
            return json_encode(['error' => 'Database error']);
        }
        
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        $logs = [];
        while ($row = $result->fetch_assoc()) {
            $logs[] = $row;
        }
        $stmt->close();
        return json_encode($logs);
    } catch (\Throwable $th) {
        writeLog("Error fetching from AuditLog: " . $th->getMessage(), "audit-log.log");
        return json_encode(['error' => $th->getMessage()]);
    }
}

function getAllAuditLogs($limit = 1000, $offset = 0)
{
    try {
        $sql = "SELECT id, user_id, title, action, created_at FROM AuditLog ORDER BY created_at DESC LIMIT ? OFFSET ?";
        $stmt = $GLOBALS['conn']->prepare($sql);
        if (!$stmt) {
            writeLog("Prepare statement failed: " . $GLOBALS['conn']->error, "audit-log.log");
            return json_encode(['error' => 'Database error']);
        }
        
        $stmt->bind_param("ii", $limit, $offset);
        $stmt->execute();
        $result = $stmt->get_result();
        $logs = [];
        while ($row = $result->fetch_assoc()) {
            $logs[] = $row;
        }
        $stmt->close();
        return json_encode($logs);
    } catch (\Throwable $th) {
        writeLog("Error fetching from AuditLog: " . $th->getMessage(), "audit-log.log");
        return json_encode(['error' => $th->getMessage()]);
    }
}

// New function to filter logs by date range
function getAuditLogsByDateRange($startDate, $endDate, $userId = null)
{
    try {
        if ($userId !== null) {
            $sql = "SELECT * FROM AuditLog WHERE created_at BETWEEN ? AND ? AND user_id = ? ORDER BY created_at DESC";
            $stmt = $GLOBALS['conn']->prepare($sql);
            $stmt->bind_param("ssi", $startDate, $endDate, $userId);
        } else {
            $sql = "SELECT * FROM AuditLog WHERE created_at BETWEEN ? AND ? ORDER BY created_at DESC";
            $stmt = $GLOBALS['conn']->prepare($sql);
            $stmt->bind_param("ss", $startDate, $endDate);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        $logs = [];
        while ($row = $result->fetch_assoc()) {
            $logs[] = $row;
        }
        $stmt->close();
        return json_encode($logs);
    } catch (\Throwable $th) {
        writeLog("Error fetching logs by date range: " . $th->getMessage(), "audit-log.log");
        return json_encode(['error' => $th->getMessage()]);
    }
}
