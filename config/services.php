<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'stripe' => [
        'key' => env('STRIPE_KEY'),
        'secret' => env('STRIPE_SECRET'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
    ],

    'mobile_money' => [
        'provider' => env('MOBILE_MONEY_PROVIDER', 'orange_money'), // orange_money, airtel_money
        'orange_money' => [
            'merchant_id' => env('ORANGE_MONEY_MERCHANT_ID'),
            'api_key' => env('ORANGE_MONEY_API_KEY'),
            'api_url' => env('ORANGE_MONEY_API_URL', 'https://api.orange.com'),
            'currency' => env('ORANGE_MONEY_CURRENCY', 'USD'),
        ],
        'airtel_money' => [
            'client_id' => env('AIRTEL_MONEY_CLIENT_ID'),
            'client_secret' => env('AIRTEL_MONEY_CLIENT_SECRET'),
            'api_url' => env('AIRTEL_MONEY_API_URL', 'https://openapiuat.airtel.africa'),
            'country' => env('AIRTEL_MONEY_COUNTRY', 'CD'),
            'currency' => env('AIRTEL_MONEY_CURRENCY', 'USD'),
        ],
    ],

];
