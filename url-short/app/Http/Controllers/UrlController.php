<?php

namespace App\Http\Controllers;

use App\Models\ShortUrl;
use App\Services\AppServiceShortCodeURL;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UrlController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // Este endpoint se diseñó para ser consumido por fetch/AJAX (Accept: application/json).
        // Si en el futuro queremos una vista Inertia, podemos extenderlo.
        $items = ShortUrl::query()
            ->orderByDesc('id')
            ->get(['id', 'code', 'original_url', 'created_at', 'updated_at']);

        return response()->json([
            'ok' => true,
            'data' => $items,
        ]);
    }

    protected function generateUniqueShortCode(
        AppServiceShortCodeURL $shortCodeService,
        string $originalUrl,
        int $maxAttempts = 25,
    ): string {
        // Generamos un code corto (máx 8 chars) y validamos que sea único.
        $attempt = 0;
        do {
            $attempt++;
            $code = $shortCodeService->generateShortCode($originalUrl);
        } while (ShortUrl::query()->where('code', $code)->exists() && $attempt < $maxAttempts);

        if (ShortUrl::query()->where('code', $code)->exists()) {
            abort(500, 'No se pudo generar un código único.');
        }

        return $code;
    }

    protected function validateOriginalUrlNotExists(
        Request $request,
        string $originalUrl,
    ): JsonResponse|RedirectResponse|null {
        // Validamos que la URL original no exista ya en la tabla.
        $existing = ShortUrl::query()
            ->where('original_url', $originalUrl)
            ->first();

        if (!$existing) {
            return null;
        }

        $message = 'Esta URL ya cuenta con un registro.';

        // Si el frontend mandó Accept: application/json, devolvemos JSON.
        if ($request->expectsJson()) {
            return response()->json(
                [
                    'ok' => false,
                    'message' => $message,
                    'data' => [
                        'id' => $existing->id,
                        'code' => $existing->code,
                        'original_url' => $existing->original_url,
                        'created_at' => $existing->created_at,
                        'updated_at' => $existing->updated_at,
                    ],
                ],
                409, // request choca con datos ya existentes
            );
        }

        return back()
            ->withErrors(['original_url' => $message])
            ->withInput();
    }

    public function store(Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'original_url' => [
                // le dice a laravel que se detenga en la primera regla que falle
                'bail', 
                'required',
                'string',
                'max:2048',
                'url',
                // que comience con http:// o https://
                'starts_with:http://,https://',
                // Ese patrón bloquea caracteres de control ASCII:
                //  \x00-\x1F (NUL, tab, newlines, etc.)
                //  \x7F (DEL)
                'not_regex:/[\\x00-\\x1F\\x7F]/',
            ],
        ]);

        /** @var AppServiceShortCodeURL $shortCodeService */
        $shortCodeService = app(AppServiceShortCodeURL::class);

        $duplicateResponse = $this->validateOriginalUrlNotExists(
            $request,
            $validated['original_url'],
        );
        if ($duplicateResponse) {
            return $duplicateResponse;
        }

        $code = $this->generateUniqueShortCode(
            $shortCodeService,
            $validated['original_url'],
        );

        $shortUrl = ShortUrl::query()->create([
            'code' => $code,
            'original_url' => $validated['original_url'],
        ]);

        // si el frontend mando un header Accept: application/json, devolvemos un json
        if ($request->expectsJson()) {
            return response()->json(
                [
                    'ok' => true,
                    'data' => [
                        'id' => $shortUrl->id,
                        'code' => $shortUrl->code,
                        'original_url' => $shortUrl->original_url,
                        'created_at' => $shortUrl->created_at,
                        'updated_at' => $shortUrl->updated_at,
                    ],
                ],
                201,
            );
        }

        return back()->with('data', [
            'id' => $shortUrl->id,
            'code' => $shortUrl->code,
            'original_url' => $shortUrl->original_url,
        ]);
    }
}

