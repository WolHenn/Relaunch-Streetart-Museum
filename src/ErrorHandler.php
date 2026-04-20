<?php

declare(strict_types=1);

class ErrorHandler
{
    public static function handleException(Throwable $exception): void
    {
        http_response_code(500);
        if (getenv("APP_ENV") === "production") {
            echo json_encode(["message" => "Internal Server Error"]);
        } else {
            echo json_encode([
                "code"    => $exception->getCode(),
                "message" => $exception->getMessage(),
                "file"    => $exception->getFile(),
                "line"    => $exception->getLine()
            ]);
        }
    }

    public static function handleError(
        int $errno,
        string $errstr,
        string $errfile,
        int $errline
    ): bool {
        throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
    }
}
