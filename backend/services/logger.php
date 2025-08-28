<?php
$logPath = __DIR__ . '/../../logs/'; // Path to the logs directory
umask(0); // Reset PHP umask so mkdir permissions are not restricted
function writeLog($message, $where)
{
    global $logPath;
    // Ensure the logs directory exists
    if (!is_dir($logPath) && !mkdir($logPath, 0777, true)) {
        error_log("Cannot create logs directory: $logPath");
        return;
    }

    $logFile    = $logPath . $where;
    $timestamp  = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message" . PHP_EOL;
    if (false === file_put_contents($logFile, $logMessage, FILE_APPEND)) {
        error_log("Failed to write to log file: $logFile");
    }

    // Write structured global log entry
    writeGlobalLog($where, $message, 'INFO');
}

function writeGlobalLog($source, $message, $level = 'INFO')
{
    try {
        global $logPath;
        // Ensure the logs directory exists
        if (!is_dir($logPath) && !mkdir($logPath, 0777, true)) {
            throw new \Exception("Cannot create logs directory: $logPath");
        }
        
        $logFile = $logPath . 'global.log';
        $timestamp = date('Y-m-d H:i:s');
        // Build pretty log block
        $sep = str_repeat('=', 60) . PHP_EOL;
        $logMessage = $sep;
        $logMessage .= "Date   : $timestamp" . PHP_EOL;
        $logMessage .= "Level  : $level" . PHP_EOL;
        $logMessage .= "Source : $source" . PHP_EOL;
        $logMessage .= "Message: $message" . PHP_EOL;
        $logMessage .= $sep;
        file_put_contents($logFile, $logMessage, FILE_APPEND);
    } catch (\Throwable $th) {
        error_log("Failed to write to global log file: " . $th->getMessage());
    }
}
