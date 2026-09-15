<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../config/cors.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $action = $_GET['action'] ?? 'login';
    $input = getJsonInput();

    if ($action === 'register') {
        $name = trim($input['name'] ?? '');
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';
        $role = $input['role'] ?? 'student';

        if (!$name || !$email || !$password) {
            jsonResponse(false, null, 'Name, email and password are required', 422);
        }

        // Check if email already registered
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            jsonResponse(false, null, 'Email is already registered', 409);
        }

        $userId = 'user-' . uniqid();
        $hash = password_hash($password, PASSWORD_BCRYPT);
        $avatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80';

        $insertStmt = $pdo->prepare("
            INSERT INTO users (id, name, email, password_hash, role, avatar)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $insertStmt->execute([$userId, $name, $email, $hash, $role, $avatar]);

        jsonResponse(true, [
            'id' => $userId,
            'name' => $name,
            'email' => $email,
            'role' => $role,
            'avatar' => $avatar,
        ], 'Registration successful', 201);
    }

    if ($action === 'login') {
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';

        if (!$email || !$password) {
            jsonResponse(false, null, 'Email and password are required', 422);
        }

        $stmt = $pdo->prepare("SELECT id, name, email, password_hash, role, avatar, title FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            jsonResponse(false, null, 'Invalid credentials', 401);
        }

        unset($user['password_hash']);
        jsonResponse(true, [
            'user' => $user,
            'token' => base64_encode($user['id'] . ':' . time()),
        ], 'Authentication successful');
    }
}
