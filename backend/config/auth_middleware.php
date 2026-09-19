<?php
/**
 * Token Authentication Middleware Helper
 * Yaswant Code LMS Backend
 *
 * Include this file in any endpoint that requires authentication.
 * Usage: $userId = requireAuth();   // aborts with 401 if not authenticated
 *        $userId = getAuthUserId();  // returns null if not authenticated
 */

function getAuthUserId(): ?string
{
    $header = $_SERVER['HTTP_AUTHORIZATION']
           ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
           ?? getallheaders()['Authorization']
           ?? '';

    if (!$header) {
        return null;
    }

    // Strip "Bearer " prefix
    $token = preg_replace('/^Bearer\s+/i', '', trim($header));
    if (!$token) {
        return null;
    }

    // Token format: base64(userId:timestamp)
    $decoded = base64_decode($token, true);
    if ($decoded === false) {
        return null;
    }

    $parts = explode(':', $decoded, 2);
    if (count($parts) !== 2) {
        return null;
    }

    [$userId, $issuedAt] = $parts;

    // Token is valid for 30 days
    $ttl = 30 * 24 * 60 * 60;
    if (!is_numeric($issuedAt) || (time() - (int)$issuedAt) > $ttl) {
        return null;
    }

    return $userId ?: null;
}

function requireAuth(): string
{
    $userId = getAuthUserId();
    if (!$userId) {
        jsonResponse(false, null, 'Unauthorized — valid Bearer token required', 401);
    }
    return $userId;
}
