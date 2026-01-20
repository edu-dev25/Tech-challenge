<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');



Route::get('/urls/create', function () {
    return Inertia::render('urls/create');
})->name('urls.create');