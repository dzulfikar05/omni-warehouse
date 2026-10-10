<?php

namespace App\Contracts;

use Illuminate\Support\Collection;

interface GeneralSettingsContract
{
    public function getSettings(string $tenantSlug): array;

    public function updateSettings(string $tenantSlug, array $settings): void;
}
