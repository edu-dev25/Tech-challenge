<?php

use App\Models\ShortUrl;

it('devuelve la original_url cuando el code existe (GET /urls/{code})', function () {
    ShortUrl::query()->create([
        'code' => 'aaaa1111',
        'original_url' => 'https://one.test/path',
    ]);

    $response = $this->getJson('/urls/aaaa1111');

    $response->assertOk();
    $response->assertJsonPath('ok', true);
    $response->assertJsonPath('data.code', 'aaaa1111');
    $response->assertJsonPath('data.original_url', 'https://one.test/path');
});

it('devuelve 404 cuando el code no existe (GET /urls/{code})', function () {
    $response = $this->getJson('/urls/no-existe');

    $response->assertStatus(404);
    $response->assertJsonPath('ok', false);
    $response->assertJsonPath('message', 'Código no encontrado.');
});

