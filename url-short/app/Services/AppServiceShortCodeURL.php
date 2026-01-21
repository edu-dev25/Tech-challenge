<?php

namespace App\Services;

class AppServiceShortCodeURL
{
    /**
     * Genera un código corto (8 chars) a partir de la URL.
     *
     * Nota: este método incluye aleatoriedad (random_int), así que dos llamadas
     * con la misma URL pueden producir códigos distintos.
     */
    public function generateShortCode(string $url): string
    {
        // Idealmente este secreto vive en variables de entorno/secret manager.
        // Para este challenge lo tomamos de env con fallback a APP_KEY.
        $secreto = (string) config('services.short_url.secret', env('APP_KEY', ''));

        $datosParaHash = $url.$secreto;
        $hash = hash('sha256', $datosParaHash);

        $codigo = '';
        $length = strlen($hash);

        for ($i = 0; $i < 8; $i++) {
            // Generamos una posición aleatoria en el rango del hash
            $pos = random_int(0, $length - 1);
            $codigo .= $hash[$pos];
        }

        return $codigo;
    }
}

