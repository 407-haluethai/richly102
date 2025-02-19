<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    protected $except = [
        '/transactions', // ✅ ยกเว้น API ธุรกรรมจากการตรวจสอบ CSRF
    ];
}
