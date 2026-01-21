<?php

use App\Models\ShortUrl;

it('lista las urls creadas (GET /urls) y devuelve JSON', function () {
    ShortUrl::query()->create([
        'code' => 'aaaa1111',
        'original_url' => 'https://one.test',
    ]);
    ShortUrl::query()->create([
        'code' => 'bbbb2222',
        'original_url' => 'https://two.test',
    ]);

    $response = $this->getJson('/urls');

    $response->assertOk();
    $response->assertJsonPath('ok', true);
    $response->assertJsonCount(2, 'data');

    // Se ordena por id desc, así que el último insert debe aparecer primero.
    $response->assertJsonPath('data.0.code', 'bbbb2222');
    $response->assertJsonPath('data.1.code', 'aaaa1111');
});

