<?php

use App\Http\Controllers\UrlController;
use App\Models\ShortUrl;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class TestableUrlControllerForDuplicateCheck extends UrlController
{
    public function callValidateOriginalUrlNotExists(
        Request $request,
        string $originalUrl,
    ): JsonResponse|RedirectResponse|null {
        return $this->validateOriginalUrlNotExists($request, $originalUrl);
    }
}

it('regresa null cuando la original_url no existe', function () {
    $controller = new TestableUrlControllerForDuplicateCheck();
    $request = Request::create('/urls', 'POST');
    app()->instance('request', $request);

    $out = $controller->callValidateOriginalUrlNotExists($request, 'https://no-existe.test');

    expect($out)->toBeNull();
});

it('regresa 409 JSON cuando la original_url ya existe y el request espera JSON', function () {
    $existing = ShortUrl::query()->create([
        'code' => 'deadbeef',
        'original_url' => 'https://dup.test',
    ]);

    $controller = new TestableUrlControllerForDuplicateCheck();

    $request = Request::create('/urls', 'POST');
    $request->headers->set('Accept', 'application/json');
    app()->instance('request', $request);

    $out = $controller->callValidateOriginalUrlNotExists($request, 'https://dup.test');

    expect($out)->toBeInstanceOf(JsonResponse::class);
    expect($out->getStatusCode())->toBe(409);

    $payload = json_decode($out->getContent() ?: '[]', true);
    expect($payload['ok'])->toBeFalse();
    expect($payload['message'])->toBe('Esta URL ya cuenta con un registro.');
    expect($payload['data']['id'])->toBe($existing->id);
    expect($payload['data']['code'])->toBe($existing->code);
    expect($payload['data']['original_url'])->toBe($existing->original_url);
});

it('regresa redirect con error cuando la original_url ya existe y el request NO espera JSON', function () {
    ShortUrl::query()->create([
        'code' => 'deadbeef',
        'original_url' => 'https://dup.test',
    ]);

    $controller = new TestableUrlControllerForDuplicateCheck();

    $request = Request::create('/urls', 'POST', ['original_url' => 'https://dup.test']);
    $request->headers->set('referer', '/urls/create');

    $session = app('session')->driver();
    $session->start();
    $request->setLaravelSession($session);
    app()->instance('request', $request);

    $out = $controller->callValidateOriginalUrlNotExists($request, 'https://dup.test');

    expect($out)->toBeInstanceOf(RedirectResponse::class);
    expect($out->getStatusCode())->toBe(302);

    /** @var Illuminate\Support\ViewErrorBag|null $errors */
    $errors = $session->get('errors');
    expect($errors)->not->toBeNull();
    expect($errors?->getBag('default')->has('original_url'))->toBeTrue();
});

