<?php

declare(strict_types=1);

$config = include __DIR__ . '/src/bootstrap.php';
require_once __DIR__ . '/src/authorization.php';

$path = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);
$parts = explode("/", str_replace("/img_api", "", $path));

$allowedValues = ["artists", "images", "login"];
if (!in_array($parts[1], $allowedValues)) {
    http_response_code(404);
    exit;
}

$database = new Database(
    $config['DB_HOST'],
    "streetart_img_db",
    "root",
    $config['DB_PASSWORD']
);
$pdo = $database->getConnection();

if ($parts[1] === "login") {
    include __DIR__ . "/src/login.php";
    exit;
}

// Türsteher: Token prüfen
$authLevel = isAuthorized($pdo, $config);

if (!$authLevel) {
    http_response_code(401);
    echo json_encode(["error" => "Nicht autorisiert. Bitte einloggen."]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET' && $authLevel !== 'ADMIN_FULL') {
    http_response_code(403);
    echo json_encode(["error" => "Keine Schreibrechte für Website-Key."]);
    exit;
}

$id = $parts[2] ?? null;
$gateway = new ArtistsGateway($database);
$controller = new ArtistsController($gateway);
$controller->processRequest($_SERVER["REQUEST_METHOD"], $id);
