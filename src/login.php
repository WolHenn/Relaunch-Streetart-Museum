<?php

$data = json_decode(file_get_contents("php://input"), true);
$user = $data['username'] ?? '';
$pass = $data['password'] ?? '';

if (empty($user) || empty($pass)) {
    http_response_code(400);
    echo json_encode(['error' => 'Bitte Benutzername und Passwort angeben']);
    exit;
}

try {
    // 2. User in der DB suchen
    $stmt = $pdo->prepare("SELECT id, password_hash FROM users WHERE username = ?");
    $stmt->execute([$user]);
    $userData = $stmt->fetch(PDO::FETCH_ASSOC);

    // 3. Passwort-Hash prüfen
    if ($userData && password_verify($pass, $userData['password_hash'])) {
        // 4. Token generieren
        // Wir nutzen einen einfachen Zufalls-Token für den Anfang
        $token = bin2hex(random_bytes(32));

        // 5. Token in der DB speichern (wichtig für spätere Validierung!)
        // Wir gehen davon aus, dass deine Tabelle eine Spalte 'current_token' hat.
        $updateStmt = $pdo->prepare("UPDATE users SET current_token = ?, last_login = NOW() WHERE id = ?");
        $updateStmt->execute([$token, $userData['id']]);

        echo json_encode(
            [
                'token' => $token,
                'user' => $user
            ]
        );
    } else {
        // 6. Fehler bei falschem Passwort oder User
        http_response_code(401);
        echo json_encode(['error' => 'Ungültige Zugangsdaten']);
    }
} catch (PDOException $e) {
    error_log("Datenbankfehler beim Login: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Datenbankfehler: ' . $e->getMessage()]);
}
