<?php

declare(strict_types=1);

/**
 * Checks if the user is authorized.
 *
 * @param PDO   $pdo    The database connection.
 * @param array $config The configuration array.
 *
 * @return string|false The authorization level or false if unauthorized.
 */
function isAuthorized(PDO $pdo, array $config)
{
    $headers = getallheaders();
    if (!isset($headers['Authorization'])) {
        return false;
    }

    $authHeader = $headers['Authorization'];
    $token = str_replace('Bearer ', '', $authHeader);

    // Check against the website key from the config
    if ($token === $config['WEBSITE_APP_KEY']) {
        return 'PUBLIC_READ';
    }

    // Check against the database
    $stmt = $pdo->prepare("SELECT id FROM users WHERE current_token = ?");
    $stmt->execute([$token]);

    if ($stmt->fetch() !== false) {
        return 'ADMIN_FULL';
    }

    return false;
}
