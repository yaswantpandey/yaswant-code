<?php
/**
 * Yaswant Code LMS — Authentication API
 * Hostinger Shared Hosting Compatible
 *
 * Endpoints:
 *   POST   ?action=register       — Register new user
 *   POST   ?action=login          — Login, returns token
 *   POST   ?action=logout         — Invalidate token
 *   GET    ?action=profile        — Get current user (Bearer required)
 *   PUT    ?action=profile        — Update profile (Bearer required)
 *   POST   ?action=change_password — Change password (Bearer required)
 */

declare(strict_types=1);
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = strtolower(trim($_GET['action'] ?? 'login'));

// ─── GET /api/auth.php?action=profile ──────────────────────────────────────
if ($method === 'GET' && $action === 'profile') {
    $user = require_auth();
    ok($user, 'Profile loaded');
}

// ─── POST Actions ──────────────────────────────────────────────────────────
if ($method === 'POST') {
    $input = get_json_input();

    // ── Register ─────────────────────────────────────────────────────────
    if ($action === 'register') {
        check_rate_limit('register', 5, 3600);

        $name     = str_input($input, 'name');
        $email    = strtolower(str_input($input, 'email'));
        $password = str_input($input, 'password');
        $role     = 'student'; // Public registration is strictly restricted to students

        if (!$name)                              fail('Name is required.', 422);
        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) fail('Valid email is required.', 422);
        if (strlen($password) < 8)               fail('Password must be at least 8 characters.', 422);

        $pdo = require_db();

        $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            fail('An account with this email already exists.', 409);
        }

        $userId = generate_id('user');
        $hash   = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
        $avatar = 'https://ui-avatars.com/api/?name=' . urlencode($name) . '&background=6366f1&color=fff&size=200';

        $pdo->prepare(
            'INSERT INTO users (id, name, email, password_hash, role, avatar) VALUES (?, ?, ?, ?, ?, ?)'
        )->execute([$userId, $name, $email, $hash, $role, $avatar]);

        $userData = [
            'id'     => $userId,
            'name'   => $name,
            'email'  => $email,
            'role'   => $role,
            'avatar' => $avatar,
        ];

        ok($userData, 'Account created successfully!', 201);
    }

    // ── Login ─────────────────────────────────────────────────────────────
    if ($action === 'login') {
        check_rate_limit('login', 10, 900); // 10 attempts per 15 min

        $email    = strtolower(str_input($input, 'email'));
        $password = str_input($input, 'password');

        if (!$email || !$password) fail('Email and password are required.', 422);

        $pdo = require_db();

        $stmt = $pdo->prepare(
            'SELECT id, name, email, password_hash, role, avatar, title, is_active
             FROM users WHERE email = ?'
        );
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            fail('Invalid email or password.', 401);
        }

        if (!(bool)$user['is_active']) {
            fail('Your account has been deactivated. Contact support.', 403);
        }

        // Create session token
        $token   = generate_token();
        $expires = date('Y-m-d H:i:s', time() + TOKEN_TTL);
        $pdo->prepare(
            'INSERT INTO user_sessions (token, user_id, expires_at) VALUES (?, ?, ?)'
        )->execute([$token, $user['id'], $expires]);

        unset($user['password_hash'], $user['is_active']);

        ok([
            'user'       => $user,
            'token'      => $token,
            'expires_at' => $expires,
        ], 'Login successful');
    }

    // ── Logout ────────────────────────────────────────────────────────────
    if ($action === 'logout') {
        $token = get_bearer_token();
        if ($token) {
            $pdo = get_db();
            if ($pdo) {
                $pdo->prepare('DELETE FROM user_sessions WHERE token = ?')->execute([$token]);
            }
        }
        ok(null, 'Logged out successfully');
    }

    // ── Change Password ───────────────────────────────────────────────────
    if ($action === 'change_password') {
        $user        = require_auth();
        $current_pw  = str_input($input, 'current_password');
        $new_pw      = str_input($input, 'new_password');

        if (!$current_pw || !$new_pw) fail('Both current_password and new_password are required.', 422);
        if (strlen($new_pw) < 8)      fail('New password must be at least 8 characters.', 422);

        $pdo  = require_db();
        $stmt = $pdo->prepare('SELECT password_hash FROM users WHERE id = ?');
        $stmt->execute([$user['id']]);
        $row  = $stmt->fetch();

        if (!$row || !password_verify($current_pw, $row['password_hash'])) {
            fail('Current password is incorrect.', 401);
        }

        $newHash = password_hash($new_pw, PASSWORD_BCRYPT, ['cost' => 12]);
        $pdo->prepare('UPDATE users SET password_hash = ? WHERE id = ?')
            ->execute([$newHash, $user['id']]);

        // Invalidate all other sessions
        $pdo->prepare('DELETE FROM user_sessions WHERE user_id = ? AND token != ?')
            ->execute([$user['id'], get_bearer_token()]);

        ok(null, 'Password changed successfully');
    }
}

// ─── PUT /api/auth.php?action=profile ──────────────────────────────────────
if ($method === 'PUT' && $action === 'profile') {
    $user  = require_auth();
    $input = get_json_input();
    $pdo   = require_db();

    $allowed = ['name','bio','title','avatar','github_url','twitter_url','linkedin_url'];
    $sets    = [];
    $vals    = [];

    foreach ($allowed as $field) {
        if (isset($input[$field])) {
            $sets[] = "{$field} = ?";
            $vals[] = sanitize((string)$input[$field]);
        }
    }

    if (empty($sets)) {
        fail('No valid fields provided for update.', 422);
    }

    $vals[] = $user['id'];
    $pdo->prepare('UPDATE users SET ' . implode(', ', $sets) . ' WHERE id = ?')
        ->execute($vals);

    // Return updated user
    $stmt = $pdo->prepare(
        'SELECT id, name, email, role, avatar, title, bio, github_url, twitter_url, linkedin_url
         FROM users WHERE id = ?'
    );
    $stmt->execute([$user['id']]);
    ok($stmt->fetch(), 'Profile updated');
}

fail('Invalid action or method.', 405);
