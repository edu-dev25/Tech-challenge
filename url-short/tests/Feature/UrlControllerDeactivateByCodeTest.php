<?php

use App\Models\ShortUrl;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;

beforeEach(function () {
    // En web, el DELETE pasa por CSRF. Para probar la lógica del controller aquí, lo deshabilitamos.
    $this->withoutMiddleware(VerifyCsrfToken::class);
});

it('desactiva (active=false) cuando el code existe (DELETE /urls/{code})', function () {
    $item = ShortUrl::query()->create([
        'code' => 'aaaa1111',
        'original_url' => 'https://one.test',
        'active' => true,
    ]);

    $response = $this->deleteJson('/urls/aaaa1111');

    $response->assertOk();
    $response->assertJsonPath('ok', true);
    $response->assertJsonPath('data.id', $item->id);
    $response->assertJsonPath('data.code', 'aaaa1111');
    $response->assertJsonPath('data.active', false);

    $this->assertDatabaseHas('short_urls', [
        'id' => $item->id,
        'active' => 0,
    ]);
});

it('devuelve 404 cuando el code no existe (DELETE /urls/{code})', function () {
    $response = $this->deleteJson('/urls/no-existe');

    $response->assertStatus(404);
    $response->assertJsonPath('ok', false);
    $response->assertJsonPath('message', 'Código no encontrado.');
});

