<?php
/**
 * IndexNow API Endpoint — Instant Search Engine Indexing (Bing, Yandex, Seznam)
 * Endpoint: /api/indexnow.php
 */

header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');

$host = 'yaswant.co.in';
$key = '495b30ababbd4d1cbcf4ea4d0c7fa3e4';
$keyLocation = 'https://' . $host . '/' . $key . '.txt';

// Default URLs to submit if none passed
$defaultUrls = [
    "https://{$host}/",
    "https://{$host}/courses",
    "https://{$host}/blog",
    "https://{$host}/roadmaps",
    "https://{$host}/projects",
    "https://{$host}/tools",
    "https://{$host}/resources",
    "https://{$host}/community"
];

// Try reading sitemap if present
$sitemapPath = __DIR__ . '/../sitemap.xml';
if (file_exists($sitemapPath)) {
    $xmlContent = file_get_contents($sitemapPath);
    if ($xmlContent && preg_match_all('/<loc>(https?:\/\/[^<]+)<\/loc>/', $xmlContent, $matches)) {
        if (!empty($matches[1])) {
            $defaultUrls = array_values(array_unique($matches[1]));
        }
    }
}

$rawInput = file_get_contents('php://input');
$inputData = json_decode($rawInput, true);

$urlList = $defaultUrls;
if ($inputData && !empty($inputData['urls']) && is_array($inputData['urls'])) {
    $urlList = array_values(array_unique($inputData['urls']));
}

$payload = [
    'host' => $host,
    'key' => $key,
    'keyLocation' => $keyLocation,
    'urlList' => $urlList
];

$endpoints = [
    'bing' => 'https://www.bing.com/indexnow',
    'indexnow' => 'https://api.indexnow.org/indexnow'
];

$results = [];

foreach ($endpoints as $name => $endpoint) {
    $ch = curl_init($endpoint);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_HTTPHEADER => ['Content-Type: application/json; charset=utf-8'],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_SSL_VERIFYPEER => true
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    $results[$name] = [
        'endpoint' => $endpoint,
        'httpCode' => $httpCode,
        'success' => ($httpCode === 200 || $httpCode === 202),
        'error' => $error ?: null
    ];
}

echo json_encode([
    'success' => true,
    'host' => $host,
    'key' => $key,
    'urlCount' => count($urlList),
    'urls' => $urlList,
    'results' => $results
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
exit;
