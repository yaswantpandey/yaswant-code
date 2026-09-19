<?php
/**
 * Yaswant Code LMS — Public Site Settings & Announcements API
 * Hostinger Shared Hosting Compatible
 *
 * Endpoints:
 *   GET /api/settings.php — Retrieve active platform branding, announcements & links
 */

declare(strict_types=1);
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    fail('Method not allowed.', 405);
}

$pdo = get_db();
$settings = [
    'announcement_enabled'   => '1',
    'announcement_badge'     => 'NEW RELEASE',
    'announcement_text'      => '🚀 Welcome to Yaswant Code — Direct ZIP developer downloads & university study notes now available!',
    'announcement_link'      => '#paths',
    'announcement_btn_text'  => 'Explore Roadmaps →',
    'platform_title'         => 'Yaswant Code',
    'platform_tagline'       => 'Full-Stack Engineering & Cloud Architecture Learning Ecosystem',
    'contact_email'          => 'ecotech.internship@gmail.com',
    'support_phone'          => '+91 98765 43210',
    'office_location'        => 'Tech Hub, Cyber City, Bangalore, India',
    'github_url'             => 'https://github.com/Yaswant-pandey',
    'youtube_url'            => 'https://youtube.com/@yaswantcode',
    'linkedin_url'           => 'https://linkedin.com/in/yaswant-pandey',
    'telegram_url'           => 'https://t.me/yaswantcode',
    'maintenance_mode'       => '0',
    'allow_registration'     => '1',
];

if ($pdo) {
    try {
        $stmt = $pdo->query('SELECT setting_key, setting_value FROM site_settings');
        $rows = $stmt->fetchAll();
        foreach ($rows as $r) {
            $settings[$r['setting_key']] = $r['setting_value'];
        }
    } catch (Throwable $e) {}
}

ok($settings, 'Public platform settings loaded');
