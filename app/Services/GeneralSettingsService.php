<?php

namespace App\Services;

use App\Contracts\GeneralSettingsContract;
use App\Models\GeneralSetting;
use App\Models\Tenant;

class GeneralSettingsService implements GeneralSettingsContract
{
    public function getSettings(string $tenantSlug): array
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();

        return GeneralSetting::where('tenant_id', $tenant->id)
            ->pluck('value', 'name')
            ->toArray();
    }

    public function updateSettings(string $tenantSlug, array $settings): void
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();

        foreach ($settings as $key => $value) {
            GeneralSetting::updateOrCreate(
                [
                    'tenant_id' => $tenant->id,
                    'name' => $key,
                ],
                [
                    'value' => is_bool($value) ? ($value ? '1' : '0') : (string) ($value ?? ''),
                ]
            );
        }
    }
}
