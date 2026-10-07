<?php

namespace App\Services;

use App\Contracts\CompanyProfileContract;
use App\Models\Tenant;

class CompanyProfileService implements CompanyProfileContract
{
    public function getCompanyProfile(string $tenantSlug): Tenant
    {
        return Tenant::where('slug', $tenantSlug)->firstOrFail();
    }

    public function updateCompanyProfile(string $tenantSlug, array $data): Tenant
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();

        $tenant->update([
            'name' => $data['name'],
            'slug' => $data['slug'],
            'phone' => $data['phone'] ?? null,
            'email' => $data['email'] ?? null,
            'website' => $data['website'] ?? null,
            'tax_number' => $data['tax_number'] ?? null,
            'address' => $data['address'] ?? null,
        ]);

        if (isset($data['logo']) && $data['logo'] instanceof \Illuminate\Http\UploadedFile) {
            $tenant->clearMediaCollection('logo');
            $tenant->addMedia($data['logo'])->toMediaCollection('logo');
        }

        return $tenant;
    }

    public function deleteCompanyLogo(string $tenantSlug): Tenant
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();

        $tenant->clearMediaCollection('logo');
        $tenant->update(['logo' => null]);

        return $tenant;
    }
}
