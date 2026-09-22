<?php

namespace App\Contracts;

use App\Models\Tenant;

interface CompanyProfileContract
{
    public function getCompanyProfile(string $tenantSlug): Tenant;

    public function updateCompanyProfile(string $tenantSlug, array $data): Tenant;

    public function deleteCompanyLogo(string $tenantSlug): Tenant;
}
