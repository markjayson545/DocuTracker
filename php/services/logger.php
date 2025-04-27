<?php
$logPath = __DIR__ . '/../../logs/';
function writeLog($message, $where)
{
    try {
        global $logFile, $logPath;
        $logFile = $logPath . $where;
        $timestamp = date('Y-m-d H:i:s');
        $logMessage = "[$timestamp] $message" . PHP_EOL;
        file_put_contents($logFile, $logMessage, FILE_APPEND);
    } catch (\Throwable $th) {
        error_log("Failed to write to log file: " . $th->getMessage());
    } finally {
        writeGlobalLog("Log written to $logFile: $message");
    }
}

function writeGlobalLog($message)
{
    try {
        global $logPath;
        // Ensure the logs directory exists
        if (!is_dir($logPath) && !mkdir($logPath, 0755, true)) {
            throw new \Exception("Cannot create logs directory: $logPath");
        }
        
        $logFile = $logPath . 'global.log';
        $timestamp = date('Y-m-d H:i:s');
        $logMessage = "[$timestamp] $message" . PHP_EOL;
        file_put_contents($logFile, $logMessage, FILE_APPEND);
    } catch (\Throwable $th) {
        error_log("Failed to write to global log file: " . $th->getMessage());
    }
}
