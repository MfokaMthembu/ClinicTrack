<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Enable full CORS support
        $middleware->use([
            \Illuminate\Http\Middleware\HandleCors::class,
    ]);

        // Keep stateful API sessions (for Sanctum if needed)
        $middleware->statefulApi();
    })->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
