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

        // Update data profil & legalitas
        $tenant->update([
            'name' => $data['name'],
            'slug' => $data['slug'],
            'phone' => $data['phone'] ?? null,
            'email' => $data['email'] ?? null,
            'tax_number' => $data['tax_number'] ?? null, // Simpan NPWP
            'address' => $data['address'] ?? null,
        ]);

        // Penanganan Upload File via Spatie MediaLibrary
        if (isset($data['logo']) && $data['logo'] instanceof \Illuminate\Http\UploadedFile) {
            $tenant->clearMediaCollection('logo');
            $tenant->addMedia($data['logo'])->toMediaCollection('logo');
        }

        return $tenant;
    }

    public function deleteCompanyLogo(string $tenantSlug): void
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();
        $tenant->clearMediaCollection('logo');
    }
}
