<?php
/**
 * auth.php — Authentication & User Profile API
 * Yaswant Code LMS Backend
 *
 * POST ?action=register       Register a new student account
 * POST ?action=login          Authenticate and receive a bearer token
 * POST ?action=logout         Invalidate session (client-side token drop)
 * GET  ?action=profile        Get authenticated user profile
 * PUT  ?action=profile        Update name / avatar / bio / title
 * POST ?action=change_password Change password (requires current_password)
 */

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth_middleware.php';

$pdo    = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'login';

// ─────────────────────────────────────────────────────────────────────────────
// POST — Register / Login / Logout / Change Password
// ─────────────────────────────────────────────────────────────────────────────
if ($method === 'POST') {

    // ── Register ─────────────────────────────────────────────────────────────
    if ($action === 'register') {
        $input    = getJsonInput();
        $name     = trim($input['name'] ?? '');
        $email    = filter_var(trim($input['email'] ?? ''), FILTER_VALIDATE_EMAIL);
        $password = $input['password'] ?? '';
        $role     = in_array($input['role'] ?? '', ['student', 'instructor'], true)
                    ? $input['role'] : 'student';

        if (!$name || !$email) {
            jsonResponse(false, null, 'A valid name and email address are required', 422);
        }
        if (strlen($password) < 8) {
            jsonResponse(false, null, 'Password must be at least 8 characters', 422);
        }

        $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            jsonResponse(false, null, 'This email address is already registered', 409);
        }

        $userId  = 'user-' . bin2hex(random_bytes(8));
        $hash    = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
        $avatar  = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80';

        $ins = $pdo->prepare('
            INSERT INTO users (id, name, email, password_hash, role, avatar)
            VALUES (?, ?, ?, ?, ?, ?)
        ');
        $ins->execute([$userId, $name, $email, $hash, $role, $avatar]);

        jsonResponse(true, [
            'id'     => $userId,
            'name'   => $name,
            'email'  => $email,
            'role'   => $role,
            'avatar' => $avatar,
        ], 'Registration successful', 201);
    }

    // ── Login ─────────────────────────────────────────────────────────────────
    if ($action === 'login') {
        $input    = getJsonInput();
        $email    = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';

        if (!$email || !$password) {
            jsonResponse(false, null, 'Email and password are required', 422);
        }

        $stmt = $pdo->prepare('
            SELECT id, name, email, password_hash, role, avatar, title
            FROM users WHERE email = ? AND is_active = 1
        ');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            // Use identical message to prevent user enumeration
            jsonResponse(false, null, 'Invalid email or password', 401);
        }

        // Upgrade hash if bcrypt cost changed
        if (password_needs_rehash($user['password_hash'], PASSWORD_BCRYPT, ['cost' => 12])) {
            $newHash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
            $pdo->prepare('UPDATE users SET password_hash = ? WHERE id = ?')
                ->execute([$newHash, $user['id']]);
        }

        unset($user['password_hash']);
        $token      = base64_encode($user['id'] . ':' . time());
        $expiresAt  = date('c', strtotime('+30 days'));

        jsonResponse(true, [
            'user'       => $user,
            'token'      => $token,
            'expires_at' => $expiresAt,
        ], 'Authentication successful');
    }

    // ── Logout ────────────────────────────────────────────────────────────────
    if ($action === 'logout') {
        // Stateless token: just tell client to drop it
        jsonResponse(true, null, 'Logged out successfully');
    }

    // ── Change Password ───────────────────────────────────────────────────────
    if ($action === 'change_password') {
        $userId          = requireAuth();
        $input           = getJsonInput();
        $currentPassword = $input['current_password'] ?? '';
        $newPassword     = $input['new_password'] ?? '';

        if (!$currentPassword || !$newPassword) {
            jsonResponse(false, null, 'current_password and new_password are required', 422);
        }
        if (strlen($newPassword) < 8) {
            jsonResponse(false, null, 'New password must be at least 8 characters', 422);
        }

        $stmt = $pdo->prepare('SELECT password_hash FROM users WHERE id = ?');
        $stmt->execute([$userId]);
        $row = $stmt->fetch();

        if (!$row || !password_verify($currentPassword, $row['password_hash'])) {
            jsonResponse(false, null, 'Current password is incorrect', 401);
        }

        $newHash = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);
        $pdo->prepare('UPDATE users SET password_hash = ? WHERE id = ?')
            ->execute([$newHash, $userId]);

        jsonResponse(true, null, 'Password changed successfully');
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET — Profile
// ─────────────────────────────────────────────────────────────────────────────
if ($method === 'GET' && $action === 'profile') {
    $userId = requireAuth();

    $stmt = $pdo->prepare('
        SELECT id, name, email, role, avatar, bio, title,
               github_url, twitter_url, linkedin_url,
               rating, reviews_count, students_count,
               created_at
        FROM users WHERE id = ? AND is_active = 1
    ');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user) {
        jsonResponse(false, null, 'User not found', 404);
    }

    jsonResponse(true, $user);
}

// ─────────────────────────────────────────────────────────────────────────────
// PUT — Update Profile
// ─────────────────────────────────────────────────────────────────────────────
if ($method === 'PUT' && $action === 'profile') {
    $userId = requireAuth();
    $input  = getJsonInput();

    $allowed = ['name', 'avatar', 'bio', 'title', 'github_url', 'twitter_url', 'linkedin_url'];
    $sets    = [];
    $params  = [];

    foreach ($allowed as $field) {
        if (array_key_exists($field, $input)) {
            $sets[]   = "`{$field}` = ?";
            $params[] = $input[$field];
        }
    }

    if (empty($sets)) {
        jsonResponse(false, null, 'No updatable fields provided', 422);
    }

    $params[] = $userId;
    $pdo->prepare('UPDATE users SET ' . implode(', ', $sets) . ' WHERE id = ?')
        ->execute($params);

    // Return updated profile
    $stmt = $pdo->prepare('
        SELECT id, name, email, role, avatar, bio, title,
               github_url, twitter_url, linkedin_url, created_at
        FROM users WHERE id = ?
    ');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    jsonResponse(true, $user, 'Profile updated successfully');
}
