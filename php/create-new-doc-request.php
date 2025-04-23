<?php
require 'services/open-db.php';
include 'services/logger.php';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        session_start();

        $userId = $_SESSION['user_id'];

        $doc_type = $_POST['document-type'];
        $mode_of_payment = 'credit-card';
        if ($_POST['gcash'] == true) {
            $mode_of_payment = 'gcash';
        }
        
        $amount = $_POST['amount-to-pay'];
        $status = 'pending';

        // Check Pending Requests and refuse if ther are any
        $sqlCheckPending = "SELECT COUNT(*) FROM Request WHERE user_id = ? AND document_type_id = ? AND status = 'pending'";
        $stmtCheckPending = mysqli_prepare($conn, $sqlCheckPending);
        mysqli_stmt_bind_param($stmtCheckPending, "ss", $userId, $doc_type);
        mysqli_stmt_execute($stmtCheckPending);
        mysqli_stmt_bind_result($stmtCheckPending, $pendingCount);
        mysqli_stmt_fetch($stmtCheckPending);
        mysqli_stmt_close($stmtCheckPending);
        if ($pendingCount > 0) {
            writeLog("User $userId has a pending request for document type $doc_type", "create-new-doc-request.log");
            throw new Exception("You already have a pending request for this document type.");
        }

        // Insert to requests table
        $sqlRequestInsert = "INSERT INTO Request (user_id, document_type_id, status) VALUES (?, ?, ?)";
        $stmtRequest = mysqli_prepare($conn, $sqlRequestInsert);
        mysqli_stmt_bind_param($stmtRequest, "sss", $userId, $doc_type, $status);
        mysqli_stmt_execute($stmtRequest);
        mysqli_stmt_close($stmtRequest);

        // Retrieve the last inserted request_id3
        $request_id = null;
        $sqlRequestInsertId = "SELECT request_id FROM Request WHERE user_id = ? ORDER BY request_id DESC LIMIT 1";
        $stmtRequestId = mysqli_prepare($conn, $sqlRequestInsertId);
        mysqli_stmt_bind_param($stmtRequestId, "s", $userId);
        mysqli_stmt_execute($stmtRequestId);
        mysqli_stmt_bind_result($stmtRequestId, $request_id);
        mysqli_stmt_fetch($stmtRequestId);
        mysqli_stmt_close($stmtRequestId);


        // Check if request_id is retrieved
        if ($request_id) {
            // Insert to payments table
            $sqlPaymentInsert = "INSERT INTO Payment (user_id, request_id, mode_of_payment, amount, status) VALUES (?, ?, ?, ?, ?)";
            $stmtPayment = mysqli_prepare($conn, $sqlPaymentInsert);
            mysqli_stmt_bind_param($stmtPayment, "sssss", $userId, $request_id, $mode_of_payment, $amount, $status);
            mysqli_stmt_execute($stmtPayment);
            mysqli_stmt_close($stmtPayment);
            writeLog("Payment request created successfully for user_id: $userId, request_id: $request_id", "create-new-doc-request.log");
        } else {
            writeLog("Failed to retrieve request_id for user_id: $userId and document_type: $doc_type", "create-new-doc-request.log");
            throw new Exception("Failed to retrieve request_id for user_id: $userId and document_type: $doc_type");
        }
        echo json_encode(
            [
                "status" => "success", 
                "message" => "Request created successfully.",
                "request_id" => $request_id,
                "mode_of_payment" => $mode_of_payment,
                "amount" => $amount
            ]
        );
    }
} catch (\Throwable $th) {
    writeLog($th->getMessage(), "create-new-doc-request.log");
    echo json_encode([
        "status" => "error", 
        "message" => "An error occurred while processing your request.",
        "stack_trace" => $th->getMessage()
    ]);
} finally {
    mysqli_close($conn);
    exit();
}
