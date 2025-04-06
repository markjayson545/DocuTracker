<?php
$logPath = '/home/mark/apache-xampp-hosting/docutracker/logs/';
function writeLog($message, $where) {
    global $logFile, $logPath;
    $logFile = $logPath . $where;
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message" . PHP_EOL;
    file_put_contents($logFile, $logMessage, FILE_APPEND);
}
?>