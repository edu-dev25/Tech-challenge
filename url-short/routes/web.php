<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\UrlController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');



Route::get('/urls/create', function () {
    return Inertia::render('urls/create');
})->name('urls.create');

Route::get('/urls/list', function () {
    return Inertia::render('urls/list');
})->name('urls.list');

Route::get('/urls', [UrlController::class, 'index'])->name('urls.index');
Route::post('/urls', [UrlController::class, 'store'])->name('urls.store');
Route::get('/urls/{code}', [UrlController::class, 'showByCode'])->name('urls.show');

// Vista "Wait a moment": recibe {code} y consulta al backend vía /urls/{code}
Route::get('/{code}', function (string $code) {
    return Inertia::render('urls/wait', [
        'code' => $code,
    ]);
})
    ->where('code', '[0-9a-fA-F]{8}')
    ->name('short.wait');