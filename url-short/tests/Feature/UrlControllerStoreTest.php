<?php

use App\Models\ShortUrl;
use App\Services\AppServiceShortCodeURL;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;

class FakeShortCodeServiceForStore extends AppServiceShortCodeURL
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

beforeEach(function () {
    // Los tests de Feature pasan por middleware web, incluyendo CSRF.
    // Para enfocarnos en la lógica del controller, lo deshabilitamos aquí.
    $this->withoutMiddleware(VerifyCsrfToken::class);
});

it('crea un short url y devuelve 201 con JSON', function () {
    $fake = new FakeShortCodeServiceForStore(['abc12345']);
    app()->instance(AppServiceShortCodeURL::class, $fake);

    $response = $this->postJson('/urls', [
        'original_url' => 'https://example.com',
    ]);

    $response->assertStatus(201);
    $response->assertJsonPath('ok', true);
    $response->assertJsonPath('data.original_url', 'https://example.com');
    $response->assertJsonPath('data.code', 'abc12345');

    $this->assertDatabaseHas('short_urls', [
        'original_url' => 'https://example.com',
        'code' => 'abc12345',
    ]);
});

it('retorna 409 si la original_url ya existe', function () {
    $existing = ShortUrl::query()->create([
        'code' => 'deadbeef',
        'original_url' => 'https://dup.test',
    ]);

    $fake = new FakeShortCodeServiceForStore(['cafebabe']);
    app()->instance(AppServiceShortCodeURL::class, $fake);

    $response = $this->postJson('/urls', [
        'original_url' => 'https://dup.test',
    ]);

    $response->assertStatus(409);
    $response->assertJsonPath('ok', false);
    $response->assertJsonPath('message', 'Esta URL ya cuenta con un registro.');
    $response->assertJsonPath('data.id', $existing->id);
    $response->assertJsonPath('data.code', $existing->code);
    $response->assertJsonPath('data.original_url', $existing->original_url);

    expect(ShortUrl::query()->count())->toBe(1);
});

it('retorna 422 si la URL no es válida', function () {
    $response = $this->postJson('/urls', [
        'original_url' => 'no-es-url',
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['original_url']);
});

it('reintenta si hay colisión de code y termina insertando uno único', function () {
    ShortUrl::query()->create([
        'code' => 'deadbeef',
        'original_url' => 'https://ya-ocupado.test',
    ]);

    $fake = new FakeShortCodeServiceForStore(['deadbeef', 'cafebabe']);
    app()->instance(AppServiceShortCodeURL::class, $fake);

    $response = $this->postJson('/urls', [
        'original_url' => 'https://example.com',
    ]);

    $response->assertStatus(201);
    $response->assertJsonPath('data.code', 'cafebabe');

    $this->assertDatabaseHas('short_urls', [
        'original_url' => 'https://example.com',
        'code' => 'cafebabe',
    ]);
});

