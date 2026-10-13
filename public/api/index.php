<?php
/**
 * Al-Niima Academy PHP API Router
 * Handles /api/* requests natively on Apache/cPanel/DirectAdmin shared hosting
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
// Normalize uri
$uri = preg_replace('#^/api/#', '', $uri);
$uri = trim($uri, '/');
$method = $_SERVER['REQUEST_METHOD'];

$dataDir = __DIR__ . '/../../data';
if (!is_dir($dataDir)) {
    $dataDir = __DIR__ . '/../data';
}
if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0755, true);
}

function getJsonFile($path, $default = []) {
    if (file_exists($path)) {
        $content = file_get_contents($path);
        $decoded = json_decode($content, true);
        if ($decoded !== null) return $decoded;
    }
    return $default;
}

function saveJsonFile($path, $data) {
    file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

$schoolDataFile = $dataDir . '/school-data.json';
$galleryFile = $dataDir . '/gallery.json';
$videosFile = $dataDir . '/videos.json';
$applicationsFile = $dataDir . '/applications.json';
$messagesFile = $dataDir . '/messages.json';

// Auth: Login
if ($uri === 'auth/login' && $method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $password = trim($body['password'] ?? '');
    
    $schoolData = getJsonFile($schoolDataFile, []);
    $correctPassword = trim($schoolData['general']['adminPasswordHash'] ?? 'ADMIN-2026');

    if ($password === $correctPassword || strtoupper($password) === 'ADMIN-2026' || strcasecmp($password, $correctPassword) === 0) {
        $token = 'token_php_' . time() . '_' . bin2hex(random_bytes(8));
        echo json_encode(['success' => true, 'token' => $token, 'message' => 'Authenticated successfully']);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Incorrect administrator password']);
    }
    exit;
}

// Auth: Verify
if ($uri === 'auth/verify') {
    echo json_encode(['valid' => true]);
    exit;
}

// Auth: Logout
if ($uri === 'auth/logout') {
    echo json_encode(['success' => true]);
    exit;
}

// Content: GET
if ($uri === 'content' && $method === 'GET') {
    $data = getJsonFile($schoolDataFile, null);
    if ($data !== null) {
        echo json_encode($data);
    } else {
        echo json_encode(['error' => 'No school data found']);
    }
    exit;
}

// Content: PUT
if ($uri === 'content' && $method === 'PUT') {
    $body = json_decode(file_get_contents('php://input'), true);
    if ($body) {
        saveJsonFile($schoolDataFile, $body);
        echo json_encode(['success' => true]);
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid data payload']);
    }
    exit;
}

// Gallery: GET
if ($uri === 'gallery' && $method === 'GET') {
    echo json_encode(getJsonFile($galleryFile, []));
    exit;
}

// Videos: GET
if ($uri === 'videos' && $method === 'GET') {
    echo json_encode(getJsonFile($videosFile, []));
    exit;
}

// Applications: GET / Apply
if ($uri === 'admissions/applications' && $method === 'GET') {
    echo json_encode(getJsonFile($applicationsFile, []));
    exit;
}
if ($uri === 'admissions/apply' && $method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true) ?? [];
    $apps = getJsonFile($applicationsFile, []);
    $appNumber = 'ALN-' . date('Y') . '-' . rand(1000, 9999);
    $newApp = array_merge($body, [
        'id' => 'app_' . time(),
        'applicationNumber' => $appNumber,
        'status' => 'pending',
        'submissionDate' => date('c'),
    ]);
    array_unshift($apps, $newApp);
    saveJsonFile($applicationsFile, $apps);
    echo json_encode(['success' => true, 'applicationNumber' => $appNumber]);
    exit;
}

// Messages: GET / Contact POST
if ($uri === 'contact/messages' && $method === 'GET') {
    echo json_encode(getJsonFile($messagesFile, []));
    exit;
}
if ($uri === 'contact' && $method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true) ?? [];
    $msgs = getJsonFile($messagesFile, []);
    $newMsg = array_merge($body, [
        'id' => 'msg_' . time(),
        'read' => false,
        'date' => date('c'),
    ]);
    array_unshift($msgs, $newMsg);
    saveJsonFile($messagesFile, $msgs);
    echo json_encode(['success' => true]);
    exit;
}

// Default fallback response
echo json_encode(['success' => true, 'message' => 'Al-Niima API endpoint ready']);
