<?php
$logPath = __DIR__ . '/../../logs/';
function writeLog($message, $where)
{
    try {
        global $logFile, $logPath;
        $logFile = $logPath . $where;
        $globalLogFile = $logPath . 'global.log';
        $timestamp = date('Y-m-d H:i:s');
        $logMessage = "[$timestamp] $message" . PHP_EOL;
        file_put_contents($logFile, $logMessage, FILE_APPEND);
        file_put_contents($globalLogFile, $logMessage, FILE_APPEND);
    } catch (\Throwable $th) {
        error_log("Failed to write to log file: " . $th->getMessage());
    }
}
