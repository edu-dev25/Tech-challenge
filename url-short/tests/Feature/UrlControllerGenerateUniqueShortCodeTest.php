<?php

use App\Http\Controllers\UrlController;
use App\Models\ShortUrl;
use App\Services\AppServiceShortCodeURL;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * Nota: testeamos `generateUniqueShortCode` sin Reflection::setAccessible (deprecado)
 * exponiéndolo vía un wrapper público en un controller de prueba.
 */

class TestableUrlController extends UrlController
{
    public function callGenerateUniqueShortCode(
        AppServiceShortCodeURL $service,
        string $originalUrl,
        int $maxAttempts = 25,
    ): string {
        return $this->generateUniqueShortCode($service, $originalUrl, $maxAttempts);
    }
}

class FakeShortCodeService extends AppServiceShortCodeURL
{
    /** @var array<int, string> */
    public array $codes;

    public int $calls = 0;

    /**
     * @param  array<int, string>  $codes
     */
    public function __construct(array $codes)
    {
        $this->codes = $codes;
    }

    public function generateShortCode(string $url): string
    {
        $this->calls++;

        $idx = $this->calls - 1;
        return $this->codes[$idx] ?? $this->codes[array_key_last($this->codes)];
    }
}

it('devuelve el código al primer intento si no hay colisión', function () {
    $controller = new TestableUrlController();
    $service = new FakeShortCodeService(['abc12345']);

    $code = $controller->callGenerateUniqueShortCode($service, 'https://example.com', 25);

    expect($code)->toBe('abc12345');
    expect($service->calls)->toBe(1);
});

it('reintenta si el código ya existe y regresa uno único', function () {
    ShortUrl::query()->create([
        'code' => 'deadbeef',
        'original_url' => 'https://already-exists.test',
    ]);

    $controller = new TestableUrlController();
    $service = new FakeShortCodeService(['deadbeef', 'cafebabe']);

    $code = $controller->callGenerateUniqueShortCode($service, 'https://example.com', 25);

    expect($code)->toBe('cafebabe');
    expect($service->calls)->toBe(2);
});

it('aborta si no puede generar un código único en maxAttempts', function () {
    ShortUrl::query()->create([
        'code' => 'deadbeef',
        'original_url' => 'https://already-exists.test',
    ]);

    $controller = new TestableUrlController();
    $service = new FakeShortCodeService(['deadbeef']); // siempre colisiona

    expect(fn () => $controller->callGenerateUniqueShortCode($service, 'https://example.com', 2))
        ->toThrow(HttpException::class);
});

