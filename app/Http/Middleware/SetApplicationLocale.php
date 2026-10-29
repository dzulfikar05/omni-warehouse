<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetApplicationLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->cookie('app_locale');

        App::setLocale(
            in_array($locale, ['id', 'en'], true)
                ? $locale
                : config('app.locale'),
        );

        return $next($request);
    }
}
