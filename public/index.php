<?php
/**
 * Hostinger PHP Entry Point Wrapper
 * Platform: Yaswant Code - Engineering LMS
 *
 * Ensures that if Apache/LiteSpeed looks for index.php first,
 * the compiled Single Page Application (index.html) is served seamlessly with optimal headers.
 */

// If requested via API path directly
$requestUri = $_SERVER['REQUEST_URI'] ?? '';
if (strpos($requestUri, '/api/') !== false) {
    http_response_code(404);
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => 'API endpoint not found']);
    exit();
}

$htmlFile = __DIR__ . '/index.html';
if (file_exists($htmlFile)) {
    // Send appropriate content headers
    header('Content-Type: text/html; charset=UTF-8');
    header('X-Content-Type-Options: nosniff');
    readfile($htmlFile);
    exit();
}

// Fallback message if index.html is missing
echo "<!DOCTYPE html><html><head><title>Yaswant Code LMS</title><style>body{font-family:system-ui,-apple-system,sans-serif;padding:3rem;max-width:600px;margin:auto;line-height:1.6;background:#090d16;color:#f8fafc;}h2{color:#38bdf8;}code{background:#1e293b;padding:0.2rem 0.4rem;border-radius:4px;color:#34d399;}</style></head><body><h2>Yaswant Code LMS - Build Required</h2><p>Please run <code>npm run build</code> and ensure all files inside <code>dist/</code> are uploaded directly to Hostinger's <code>public_html/</code> directory.</p></body></html>";
