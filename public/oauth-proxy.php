<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// OAuth proxy for 42 API
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the request body
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (isset($data['action'])) {
        if ($data['action'] === 'token') {
            // Proxy token exchange request
            $tokenUrl = 'https://api.intra.42.fr/oauth/token';
            
            $postData = http_build_query([
                'grant_type' => $data['grant_type'],
                'client_id' => $data['client_id'],
                'client_secret' => $data['client_secret'],
                'code' => $data['code'],
                'redirect_uri' => $data['redirect_uri']
            ]);
            
            $context = stream_context_create([
                'http' => [
                    'method' => 'POST',
                    'header' => 'Content-Type: application/x-www-form-urlencoded',
                    'content' => $postData
                ]
            ]);
            
            $result = file_get_contents($tokenUrl, false, $context);
            
            if ($result === FALSE) {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to exchange token']);
                exit();
            }
            
            echo $result;
            
        } elseif ($data['action'] === 'user' && isset($data['access_token'])) {
            // Proxy user info request
            $userUrl = 'https://api.intra.42.fr/v2/me';
            
            $context = stream_context_create([
                'http' => [
                    'method' => 'GET',
                    'header' => 'Authorization: Bearer ' . $data['access_token']
                ]
            ]);
            
            $result = file_get_contents($userUrl, false, $context);
            
            if ($result === FALSE) {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to fetch user data']);
                exit();
            }
            
            echo $result;
        }
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>
