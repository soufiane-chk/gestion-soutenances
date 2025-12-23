<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Laravel\Sanctum\Http\Controllers\CsrfCookieController;

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

Route::get('/sanctum/csrf-cookie', [CsrfCookieController::class, 'show']);
