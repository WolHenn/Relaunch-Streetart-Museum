<?php

class ArtistsController
{
    public function __construct(private ArtistsGateway $gateway)
    {
    }

    public function processRequest(string $method, ?string $id): void
    {
        if ($id) {
            $this->processResourceRequest($method, $id);
        } else {
            $this->processCollectionRequest($method);
        }
    }

    private function processResourceRequest(string $method, string $id): void
    {
        $urlParts = explode(
            "/",
            str_replace("/img_api", "", $_SERVER["REQUEST_URI"])
        );
        $resourceType = $urlParts[1];

        if ($resourceType === 'artists') {
            $artist = $this->gateway->get($id);

            if (!$artist) {
                http_response_code(404);
                echo json_encode(["message" => "Artist not found"]);
                return;
            }
        } elseif ($resourceType === 'images') {
            $image = $this->gateway->getImageById($id);

            if (!$image) {
                http_response_code(404);
                echo json_encode(["message" => "Image not found"]);
                return;
            }
        }

        switch ($method) {
            case "GET":
                if ($resourceType === 'artists') {
                    echo json_encode(
                        $artist,
                        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT
                    );
                } elseif ($resourceType === 'images') {
                    echo json_encode(
                        $image,
                        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT
                    );
                }
                break;

            case "PATCH":
                $data = (array) json_decode(file_get_contents("php://input"), true);

                $errors = $this->getValidationErrors($data, false);

                if (!empty($errors)) {
                    http_response_code(422);
                    echo json_encode(["errors" => $errors]);
                    return;
                }

                if ($resourceType === 'artists') {
                    $rows = $this->gateway->updateArtist($artist, $data);
                    echo json_encode([
                        "message" => "Artist $id updated",
                        "rows"    => $rows
                    ]);
                } elseif ($resourceType === 'images') {
                    $rows = $this->gateway->updateImage($image, $data);
                    echo json_encode([
                        "message" => "Image $id updated",
                        "rows"    => $rows
                    ]);
                }
                break;

            case "DELETE":
    // Basispfad zum Projekt-Root (eine Ebene über /src)
                $basePath = realpath(__DIR__ . "/../");
    // Online später checken und evtl. einkommentieren:
    // $basePath = realpath(__DIR__ . "/../../");

    // Aus "../../assets/images/artwork/BlekLeRat/2011_04_01_BlekLeRat_3.jpg"
    // wird nach ltrim($relPath, "./"):
    // "assets/images/artwork/BlekLeRat/2011_04_01_BlekLeRat_3.jpg"

    // Kombiniert mit $basePath (/var/www) ergibt:
    // "/var/www/assets/images/artwork/BlekLeRat/2011_04_01_BlekLeRat_3.jpg"

                if ($resourceType === 'artists') {
                    // 1. Alle Bildpfade dieses Künstlers aus der DB holen
                    $allImages = $this->gateway->getAllImagePathsByArtist($id);

                    // 2. Dateien physisch löschen
                    $deleted = [];
                    $failed = [];

                    foreach ($allImages as $imageData) {
                        $paths = array_filter([
                            $imageData['url'] ?? null,
                            $imageData['thumbnailUrl'] ?? null,
                            $imageData['downloadUrl'] ?? null
                        ]);

                        foreach ($paths as $relPath) {
                            $absolutePath = $basePath . "/" . ltrim($relPath, "./");
                            if (file_exists($absolutePath)) {
                                if (unlink($absolutePath)) {
                                    $deleted[] = $relPath;
                                } else {
                                    $failed[] = $relPath;
                                }
                            }
                        }
                    }

                    // 3. Künstler löschen – CASCADE in der DB löscht die Bildeinträge
                    $rows = $this->gateway->deleteArtist($id);

                    echo json_encode([
                        "message"      => "Artist $id and all associated images deleted",
                        "rows"         => $rows,
                        "filesDeleted" => $deleted,
                        "filesFailed"  => $failed
                    ]);
                } elseif ($resourceType === 'images') {
                    // 1. Bildpfade aus der DB holen
                    $imageData = $this->gateway->getImagePaths($id);

                    $deleted = [];
                    $failed = [];

                    if ($imageData) {
                        // 2. Alle nicht-leeren Pfade sammeln
                        $paths = array_filter([
                            $imageData['url'] ?? null,
                            $imageData['thumbnailUrl'] ?? null,
                            $imageData['downloadUrl'] ?? null
                        ]);

                        // 3. Dateien physisch löschen
                        foreach ($paths as $relPath) {
                            $absolutePath = $basePath . "/" . ltrim($relPath, "./");
                            if (file_exists($absolutePath)) {
                                if (unlink($absolutePath)) {
                                    $deleted[] = $relPath;
                                } else {
                                    $failed[] = $relPath;
                                }
                            }
                        }
                    }

                    // 4. DB-Eintrag löschen
                    $rows = $this->gateway->deleteImage($id);

                    echo json_encode([
                        "message"      => "Image $id deleted",
                        "rows"         => $rows,
                        "filesDeleted" => $deleted,
                        "filesFailed"  => $failed
                    ]);
                }
                break;

            default:
                http_response_code(405);
                header("Allow: GET, PATCH, DELETE");
                // No break needed as this is the default case
        }
    }

    private function processCollectionRequest(string $method): void
    {
        $urlParts = explode(
            "/",
            str_replace("/img_api", "", $_SERVER["REQUEST_URI"])
        );
        $resourceType = $urlParts[1];

        if (isset($_GET['sliderImages']) && $_GET['sliderImages'] === 'true') {
            $sliderImages = $this->gateway->getSliderImages();

            if ($sliderImages['success']) {
                echo json_encode(
                    $sliderImages['data'],
                    JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT
                );
            } else {
                http_response_code(500);
                echo json_encode(['error' => $sliderImages['error']]);
            }
            return;
        }

        switch ($method) {
            case "GET":
                $initialLetter = $_GET['initialLetter'] ?? null;
                $namesOnly = isset($_GET['namesOnly']) && $_GET['namesOnly'] === 'true';
                $search = isset($_GET['search']) ? trim($_GET['search']) : null;

    // Leeren Search-String als null behandeln
                if ($search === '') {
                    $search = null;
                }

                if ($namesOnly) {
                    $response = $this->gateway->getAllNames($initialLetter, $search);
                } else {
                    $limit  = isset($_GET['limit'])  ? (int) $_GET['limit']  : 50;
                    $offset = isset($_GET['offset']) ? (int) $_GET['offset'] : 0;
                    $response = $this->gateway->getAll($initialLetter, $limit, $offset);
                }

                if ($response['success']) {
                    echo json_encode(
                        $response['data'],
                        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT
                    );
                } else {
                    http_response_code(500);
                    echo json_encode(['error' => $response['error']]);
                }
                break;

            case "POST":
                $data = (array) json_decode(file_get_contents("php://input"), true);

                if ($resourceType === 'artists') {
                    $errors = $this->getValidationErrors($data);

                    if (!empty($errors)) {
                        http_response_code(422);
                        echo json_encode(["errors" => $errors]);
                        return;
                    }

                    $id = $this->gateway->create($data);

                    http_response_code(201);
                    echo json_encode([
                        "message" => "Artist created",
                        "id"      => $id
                    ]);
                } elseif ($resourceType === 'images') {
                    $errors = $this->getImageValidationErrors($data);

                    if (!empty($errors)) {
                        http_response_code(422);
                        echo json_encode(["errors" => $errors]);
                        return;
                    }

                    $id = $this->gateway->createImage($data);

                    http_response_code(201);
                    echo json_encode([
                        "message" => "Image created",
                        "id"      => $id
                    ]);
                }
                break;

            default:
                http_response_code(405);
                header("Allow: GET, POST");
                // No break needed as this is the default case
        }
    }

    private function getValidationErrors(array $data, bool $is_new = true): array
    {
        $errors = [];

        if ($is_new && empty($data["name"])) {
            $errors[] = "name is required";
        }

        return $errors;
    }

    private function getImageValidationErrors(array $data, bool $is_new = true): array
    {
        $errors = [];

        if ($is_new && empty($data["artist_id"])) {
            $errors[] = "artist id is required";
        }
        if ($is_new && !($data["orientation"] == "portrait" || $data["orientation"] == "landscape")) {
            $errors[] = "orientation is required";
        }
        if ($is_new && empty($data["url"])) {
            $errors[] = "url is required";
        }

        return $errors;
    }
}
