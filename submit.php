<?php
ob_start();
ini_set('display_errors', 0);
error_reporting(0);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Check if PHPMailer files exist
$has_phpmailer = true;
if (!file_exists('PHPMailer/src/Exception.php') || !file_exists('PHPMailer/src/PHPMailer.php') || !file_exists('PHPMailer/src/SMTP.php')) {
    error_log("PHPMailer files not found in the root directory.");
    $has_phpmailer = false;
} else {
    require 'PHPMailer/src/Exception.php';
    require 'PHPMailer/src/PHPMailer.php';
    require 'PHPMailer/src/SMTP.php';
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $name  = trim(strip_tags($_POST['name']  ?? ''));
    $email = trim(strip_tags($_POST['email'] ?? ''));
    $phone = trim(strip_tags($_POST['phone'] ?? $_POST['mobile'] ?? ''));
    $country_code = trim(strip_tags($_POST['country_code'] ?? '+91'));
    $time_to_call = trim(strip_tags($_POST['time_to_call'] ?? 'Not Specified'));
    $message_body = trim(strip_tags($_POST['message'] ?? 'None'));

    $name  = substr($name,  0, 100);
    $email = substr($email, 0, 100);
    $phone = substr($phone, 0, 20);

    $phone_digits = preg_replace('/\D/', '', $phone);
    if (strlen($phone_digits) < 7 || strlen($phone_digits) > 15) {
        http_response_code(400);
        echo "Invalid phone number.";
        exit();
    }

    $full_phone = $country_code . " " . $phone_digits;

    $spam_patterns = [
        '/https?:\/\//i',
        '/yandex\./i',
        '/t\.me\//i',
        '/bit\.ly\//i',
        '/wa\.me\//i',
        '/poll\//i',
        '/sex/i',
        '/dating/i',
        '/casino/i',
        '/loan.*whatsapp/i',
    ];
    foreach ($spam_patterns as $pattern) {
        if (preg_match($pattern, $name) || preg_match($pattern, $email)) {
            header("Location: thankyou.html");
            exit();
        }
    }

    file_put_contents('debug-log.txt', "DEBUG email raw: '" . ($_POST['email'] ?? 'NOT SET') . "' | after trim: '$email'\n", FILE_APPEND);

    if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo "Invalid email address.";
        exit();
    }

    if (!preg_match('/^[\p{L}\s.\-\']{2,100}$/u', $name)) {
        http_response_code(400);
        echo "Invalid name.";
        exit();
    }

    $safe_name  = htmlspecialchars($name,  ENT_QUOTES, 'UTF-8');
    $safe_email = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
    $safe_phone = htmlspecialchars($full_phone, ENT_QUOTES, 'UTF-8');
    $safe_time  = htmlspecialchars($time_to_call, ENT_QUOTES, 'UTF-8');
    $safe_message = htmlspecialchars($message_body, ENT_QUOTES, 'UTF-8');

    // 1. Log to local file as backup
    $log_data = "=== " . date("Y-m-d H:i:s") . " ===\nName: $safe_name | Email: $safe_email | Phone: $safe_phone\n";
    file_put_contents('debug-log.txt', $log_data, FILE_APPEND);

    // 2. Send to Google Sheets FIRST
    $webhook_url = "https://script.google.com/macros/s/AKfycbxV-JrUsNd5dBfF_S5zFRlW4Vdf9vPmM_rNFeP5FK5bJNy5DJUDp-vWPLzYfjON8yZI/exec";
    $payload = json_encode([
        "name"         => $safe_name,
        "email"        => $safe_email,
        "phone"        => "'" . $safe_phone,
        "source"       => "Not Specified",
        "project"      => "Hiranandani Versova Website",
        "time_to_call" => $safe_time,
        "message"      => $safe_message,
        "submitted_at" => date("Y-m-d H:i:s")
    ]);

    $ch = curl_init($webhook_url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    $webhook_response = curl_exec($ch);
    $webhook_error = curl_error($ch);
    curl_close($ch);
    if ($webhook_error) {
        file_put_contents('debug-log.txt', "WEBHOOK FAILED: $webhook_error\n", FILE_APPEND);
    }

    // 3. Try to send email
    $email_sent = false;

    if ($has_phpmailer) {
        $mail = new PHPMailer(true);

        try {
            $mail->SMTPDebug = 2;
            $mail->Debugoutput = function($str, $level) {
                file_put_contents('debug-log.txt', "SMTP: $str", FILE_APPEND);
            };

            $mail->isSMTP();
            $mail->Host       = 'smtp.gmail.com';
            $mail->SMTPAuth   = true;
            $mail->Username   = 'rock83694@gmail.com';
            $mail->Password   = 'eigvmkokcvihyboz';
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = 587;

            $mail->setFrom('rock83694@gmail.com', 'Website Lead');
        $mail->addAddress('Leads.kaashniproptec@gmail.com');
        $mail->addAddress('thegrowthmonks@gmail.com');

            $mail->isHTML(true);
            $mail->Subject = 'New Lead - Hiranandani Versova';
            $mail->Body = "
                <h2>New Lead Submission</h2>
                <p><strong>Name:</strong> {$safe_name}</p>
                <p><strong>Email:</strong> {$safe_email}</p>
                <p><strong>Phone:</strong> {$safe_phone}</p>
                <p><strong>Best Time To Call:</strong> {$safe_time}</p>
                <p><strong>Message:</strong> {$safe_message}</p>
                <p><strong>Source:</strong> Hiranandani Versova Website</p>
            ";

            $mail->send();
            $email_sent = true;

        } catch (Exception $e) {
            $pm_error = "PHPMailer Error: " . $mail->ErrorInfo;
            error_log($pm_error);
            file_put_contents('debug-log.txt', "EMAIL FAILED: $pm_error\n", FILE_APPEND);
        }
    }

    if (!$email_sent) {
        // Fallback to standard PHP mail()
        $to = "Leads.kaashniproptec@gmail.com, thegrowthmonks@gmail.com, tgmshravan@gmail.com";
        $subject = "New Lead - Hiranandani Versova";
        $message = "
            <h2>New Lead Submission</h2>
            <p><strong>Name:</strong> {$safe_name}</p>
            <p><strong>Email:</strong> {$safe_email}</p>
            <p><strong>Phone:</strong> {$safe_phone}</p>
            <p><strong>Best Time To Call:</strong> {$safe_time}</p>
            <p><strong>Message:</strong> {$safe_message}</p>
            <p><strong>Source:</strong> Hiranandani Versova Website</p>
        ";
        $headers = "MIME-Version: 1.0\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8\r\n";
        $headers .= "From: Website Lead <noreply@" . $_SERVER['HTTP_HOST'] . ">\r\n";
        
        $mail_sent = mail($to, $subject, $message, $headers);
        if (!$mail_sent) {
            file_put_contents('debug-log.txt', "MAIL() FALLBACK FAILED\n", FILE_APPEND);
        } else {
            file_put_contents('debug-log.txt', "MAIL() FALLBACK SENT OK\n", FILE_APPEND);
        }
    }

    // Finally redirect
    header("Location: thankyou.html");
    exit();

} else {
    http_response_code(405);
    header("Location: index.html");
    exit();
}
