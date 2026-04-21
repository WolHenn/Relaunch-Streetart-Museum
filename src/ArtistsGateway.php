<?php

declare(strict_types=1);

class ArtistsGateway
{
    private PDO $conn;

    public function __construct(Database $database)
    {
        $this->conn = $database->getConnection();
    }

    public function getAll(?string $initialLetter = null, int $limit = 50, int $offset = 0): array
    {
        try {
            $sqlArtists = "SELECT * FROM artists";
            $params = [];

            if ($initialLetter !== null) {
                $sqlArtists .= " WHERE name LIKE :initialLetter";
                $params['initialLetter'] = $initialLetter . '%';
            }

            $sqlArtists .= " ORDER BY name LIMIT :limit OFFSET :offset";
            $stmt = $this->conn->prepare($sqlArtists);

            foreach ($params as $key => $value) {
                $stmt->bindValue(':' . $key, $value, PDO::PARAM_STR);
            }
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            $artists = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (!$artists) {
                return ['success' => true, 'data' => ['artists' => []]];
            }

            $artistIds = array_column($artists, 'id');
            $artistImagesMap = [];

            if (!empty($artistIds)) {
                $inQuery = implode(',', array_fill(0, count($artistIds), '?'));
                $sqlImages = "SELECT * FROM artistsImagesRaw WHERE artist_id IN ($inQuery)";
                $stmtImages = $this->conn->prepare($sqlImages);
                $stmtImages->execute($artistIds);
                $images = $stmtImages->fetchAll(PDO::FETCH_ASSOC);

                foreach ($images as $img) {
                    $artistImagesMap[$img['artist_id']][] = $img;
                }
            }

            $artistsWithImages = [];
            foreach ($artists as $artist) {
                $artistId = $artist['id'];
                $artist['artistsImages'] = $artistImagesMap[$artistId] ?? [];
                $artistsWithImages[] = $artist;
            }

            return ['success' => true, 'data' => ['artists' => $artistsWithImages]];
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return ['success' => false, 'error' => 'Datenbankfehler beim Laden der Künstler.'];
        }
    }

    public function create(array $data): string
    {
        try {
            $insertArtistSQL = "INSERT INTO artists 
                (name, origin, vita, homepageUrl, facebookUrl, instaUrl, twitter) 
                VALUES (:name, :origin, :vita, :homepageUrl, :facebookUrl, :instaUrl, :twitter)";

            $artistStmt = $this->conn->prepare($insertArtistSQL);
            $artistStmt->bindValue(":name", $data["name"], PDO::PARAM_STR);
            $artistStmt->bindValue(":origin", $data["origin"] ?? "", PDO::PARAM_STR);
            $artistStmt->bindValue(":vita", $data["vita"] ?? "", PDO::PARAM_STR);
            $artistStmt->bindValue(":homepageUrl", $data["homepageUrl"] ?? "", PDO::PARAM_STR);
            $artistStmt->bindValue(":facebookUrl", $data["facebookUrl"] ?? "", PDO::PARAM_STR);
            $artistStmt->bindValue(":instaUrl", $data["instaUrl"] ?? "", PDO::PARAM_STR);
            $artistStmt->bindValue(":twitter", $data["twitter"] ?? "", PDO::PARAM_STR);
            $artistStmt->execute();

            return $this->conn->lastInsertId();
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return "0";
        }
    }

    public function createImage(array $data): string
    {
        try {
            $insertImageSQL = "INSERT INTO artistsImagesRaw 
                (artist_id, orientation, url, alt, location, coords, title, imgDate, 
                 attribution, shortdescription, downloadUrl, thumbnailUrl, imgType) 
                VALUES 
                (:artist_id, :orientation, :url, :alt, :location, :coords, :title, :imgDate, 
                 :attribution, :shortdescription, :downloadUrl, :thumbnailUrl, :imgType)";

            $imgStmt = $this->conn->prepare($insertImageSQL);
            $imgStmt->bindValue(":artist_id", $data["artist_id"], PDO::PARAM_INT);
            $imgStmt->bindValue(":orientation", $data["orientation"], PDO::PARAM_STR);
            $imgStmt->bindValue(":url", $data["url"], PDO::PARAM_STR);
            $imgStmt->bindValue(":alt", $data["alt"] ?? "", PDO::PARAM_STR);
            $imgStmt->bindValue(":location", $data["location"] ?? "", PDO::PARAM_STR);
            $imgStmt->bindValue(":coords", $data["coords"] ?? "", PDO::PARAM_STR);
            $imgStmt->bindValue(":title", $data["title"] ?? "", PDO::PARAM_STR);
            $imgStmt->bindValue(":imgDate", $data["imgDate"] ?? "", PDO::PARAM_STR);
            $imgStmt->bindValue(":attribution", $data["attribution"] ?? "", PDO::PARAM_STR);
            $imgStmt->bindValue(":shortdescription", $data["shortdescription"] ?? "", PDO::PARAM_STR);
            $imgStmt->bindValue(":downloadUrl", $data["downloadUrl"] ?? "", PDO::PARAM_STR);
            $imgStmt->bindValue(":thumbnailUrl", $data["thumbnailUrl"] ?? "", PDO::PARAM_STR);
            $imgStmt->bindValue(":imgType", $data["imgType"] ?? "", PDO::PARAM_STR);
            $imgStmt->execute();

            return $this->conn->lastInsertId();
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return "0";
        }
    }

    public function getAllNames(?string $initialLetter = null, ?string $search = null): array
    {
        try {
            $sql = "SELECT id, name FROM artists";
            $params = [];
            $conditions = [];

            if ($initialLetter !== null) {
                $conditions[] = "name LIKE :initialLetter";
                $params['initialLetter'] = $initialLetter . '%';
            }

            if ($search !== null) {
                $conditions[] = "name LIKE :search";
                $params['search'] = '%' . $search . '%';
            }

            if (!empty($conditions)) {
                $sql .= " WHERE " . implode(" AND ", $conditions);
            }

            $sql .= " ORDER BY name";
            $stmt = $this->conn->prepare($sql);

            foreach ($params as $key => $value) {
                $stmt->bindValue(':' . $key, $value, PDO::PARAM_STR);
            }

            $stmt->execute();
            return [
            'success' => true,
            'data'    => ['artists' => $stmt->fetchAll(PDO::FETCH_ASSOC)]
            ];
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return ['success' => false, 'error' => 'Datenbankfehler beim Laden der Künstlernamen.'];
        }
    }

    public function getSliderImages(): array
    {
        try {
            $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 20;
            $limit = max(1, min($limit, 100));

            $sql = "SELECT ai.* 
                FROM artistsImagesRaw ai
                INNER JOIN artists a ON ai.artist_id = a.id
                WHERE ai.imgDate >= DATE_SUB(NOW(), INTERVAL 24 MONTH)
                ORDER BY ai.imgDate DESC
                LIMIT :limit";

            $stmt = $this->conn->prepare($sql);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            $images = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return ['success' => true, 'data' => ['artistsImages' => $images]];
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return ['success' => false, 'error' => 'Database error while fetching slider images'];
        }
    }

    public function get(string $id): array
    {
        try {
            $id = intval($id);

            $stmt = $this->conn->prepare("SELECT * FROM artists WHERE id = :id");
            $stmt->execute(['id' => $id]);
            $artist = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$artist) {
                return ["error" => "Artist not found"];
            }

            $stmtImages = $this->conn->prepare("SELECT * FROM artistsImagesRaw WHERE artist_id = :id");
            $stmtImages->execute(['id' => $id]);
            $images = $stmtImages->fetchAll(PDO::FETCH_ASSOC);

            $artist['artistsImages'] = $images;

            return ['artist' => $artist];
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return ["error" => "An error occurred while fetching the artist"];
        }
    }

    public function getArtistById(string $id): array|false
    {
        try {
            $stmt = $this->conn->prepare("SELECT * FROM artists WHERE id = :id");
            $stmt->bindValue(":id", $id, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return false;
        }
    }

    public function getImageById(string $id): array|false
    {
        try {
            $stmt = $this->conn->prepare("SELECT * FROM artistsImagesRaw WHERE id = :id");
            $stmt->bindValue(":id", $id, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return false;
        }
    }

    public function getImagePaths(string $id): array|false
    {
        try {
            $stmt = $this->conn->prepare(
                "SELECT url, thumbnailUrl, downloadUrl FROM artistsImagesRaw WHERE id = ?"
            );
            $stmt->execute([$id]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return false;
        }
    }

    public function getAllImagePathsByArtist(string $id): array
    {
        try {
            $stmt = $this->conn->prepare(
                "SELECT url, thumbnailUrl, downloadUrl FROM artistsImagesRaw WHERE artist_id = ?"
            );
            $stmt->execute([$id]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return [];
        }
    }

    public function updateArtist(array $current, array $new): int
    {
        try {
            $sql = "UPDATE artists 
                SET name = :name, origin = :origin, vita = :vita, 
                    homepageUrl = :homepageUrl, facebookUrl = :facebookUrl, 
                    instaUrl = :instaUrl, twitter = :twitter
                WHERE id = :id";

            $stmt = $this->conn->prepare($sql);
            $stmt->bindValue(":name", $new["name"] ?? $current["name"], PDO::PARAM_STR);
            $stmt->bindValue(":origin", $new["origin"] ?? $current["origin"], PDO::PARAM_STR);
            $stmt->bindValue(":vita", $new["vita"] ?? $current["vita"], PDO::PARAM_STR);
            $stmt->bindValue(":homepageUrl", $new["homepageUrl"] ?? $current["homepageUrl"], PDO::PARAM_STR);
            $stmt->bindValue(":facebookUrl", $new["facebookUrl"] ?? $current["facebookUrl"], PDO::PARAM_STR);
            $stmt->bindValue(":instaUrl", $new["instaUrl"] ?? $current["instaUrl"], PDO::PARAM_STR);
            $stmt->bindValue(":twitter", $new["twitter"] ?? $current["twitter"], PDO::PARAM_STR);
            $stmt->bindValue(":id", $current["id"], PDO::PARAM_INT);
            $stmt->execute();

            return $stmt->rowCount();
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return 0;
        }
    }

    public function updateImage(array $currImgData, array $newImgData): int
    {
        try {
            $sql = "UPDATE artistsImagesRaw 
                SET artist_id = :artist_id, orientation = :orientation, url = :url, 
                    alt = :alt, location = :location, coords = :coords, title = :title, 
                    imgDate = :imgDate, attribution = :attribution, 
                    shortdescription = :shortdescription, downloadUrl = :downloadUrl, 
                    thumbnailUrl = :thumbnailUrl, imgType = :imgType 
                WHERE id = :id";

            $stmt = $this->conn->prepare($sql);
            $stmt->bindValue(":artist_id", $newImgData["artist_id"] ?? $currImgData["artist_id"], PDO::PARAM_INT);
            $stmt->bindValue(":orientation", $newImgData["orientation"] ?? $currImgData["orientation"], PDO::PARAM_STR);
            $stmt->bindValue(":url", $newImgData["url"] ?? $currImgData["url"], PDO::PARAM_STR);
            $stmt->bindValue(":alt", $newImgData["alt"] ?? $currImgData["alt"], PDO::PARAM_STR);
            $stmt->bindValue(":location", $newImgData["location"] ?? $currImgData["location"], PDO::PARAM_STR);
            $stmt->bindValue(":coords", $newImgData["coords"] ?? $currImgData["coords"], PDO::PARAM_STR);
            $stmt->bindValue(":title", $newImgData["title"] ?? $currImgData["title"], PDO::PARAM_STR);
            $stmt->bindValue(":imgDate", $newImgData["imgDate"] ?? $currImgData["imgDate"], PDO::PARAM_STR);
            $stmt->bindValue(":attribution", $newImgData["attribution"] ?? $currImgData["attribution"], PDO::PARAM_STR);
            $stmt->bindValue(":shortdescription", $newImgData["shortdescription"] ?? $currImgData["shortdescription"], PDO::PARAM_STR);
            $stmt->bindValue(":downloadUrl", $newImgData["downloadUrl"] ?? $currImgData["downloadUrl"], PDO::PARAM_STR);
            $stmt->bindValue(":thumbnailUrl", $newImgData["thumbnailUrl"] ?? $currImgData["thumbnailUrl"], PDO::PARAM_STR);
            $stmt->bindValue(":imgType", $newImgData["imgType"] ?? $currImgData["imgType"], PDO::PARAM_STR);
            $stmt->bindValue(":id", $currImgData["id"], PDO::PARAM_INT);
            $stmt->execute();

            return $stmt->rowCount();
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return 0;
        }
    }

    public function deleteImage(string $id): int
    {
        try {
            $stmt = $this->conn->prepare("DELETE FROM artistsImagesRaw WHERE id = :id");
            $stmt->bindValue(":id", $id, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->rowCount();
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return 0;
        }
    }

    public function deleteArtist(string $id): int
    {
        try {
            $stmt = $this->conn->prepare("DELETE FROM artists WHERE id = :id");
            $stmt->bindValue(":id", $id, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->rowCount();
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return 0;
        }
    }
}
