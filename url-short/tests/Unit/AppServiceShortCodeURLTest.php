<?php

use App\Services\AppServiceShortCodeURL;

uses(Tests\TestCase::class);

it('genera un código de 8 caracteres en hexadecimal', function () {
    config()->set('services.short_url.secret', 'test-secret');

    $svc = new AppServiceShortCodeURL();
    $code = $svc->generateShortCode('https://example.com');

    expect($code)->toBeString();
    expect(strlen($code))->toBe(8);
    expect($code)->toMatch('/^[0-9a-f]{8}$/');
});

it('puede generar códigos distintos para la misma URL (hay aleatoriedad)', function () {
    config()->set('services.short_url.secret', 'test-secret');

    $svc = new AppServiceShortCodeURL();

    $codes = [];
    for ($i = 0; $i < 20; $i++) {
        $codes[] = $svc->generateShortCode('https://example.com');
    }

    // No garantizamos unicidad total, pero sí esperamos ver variación normalmente.
    expect(count(array_unique($codes)))->toBeGreaterThan(1);
});

