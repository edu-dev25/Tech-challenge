<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UrlController extends Controller
{
    public function store(Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'original_url' => ['required', 'string', 'url', 'max:2048'],
        ]);

        // Por ahora solo validamos y regresamos la URL recibida.
        // Más adelante aquí se generará el short-code y se persistirá en BD.

        if ($request->expectsJson()) {
            return response()->json(
                [
                    'ok' => true,
                    'data' => $validated,
                ],
                201,
            );
        }

        return back()->with('data', $validated);
    }
}

