<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // Must explicitly include your frontend URL
    'allowed_origins' => ['http://localhost:5173'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    // Must allow credentials
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
