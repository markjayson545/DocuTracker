<?php
$logPath = '/home/mark/apache-xampp-hosting/docutracker/logs/';
function writeLog($message, $where)
{
    try {
        global $logFile, $logPath;
        $logFile = $logPath . $where;
        $timestamp = date('Y-m-d H:i:s');
        $logMessage = "[$timestamp] $message" . PHP_EOL;
        file_put_contents($logFile, $logMessage, FILE_APPEND);
    } catch (\Throwable $th) {
        // Handle any errors that occur while writing to the log file
        error_log("Failed to write to log file: " . $th->getMessage());
    }
}
