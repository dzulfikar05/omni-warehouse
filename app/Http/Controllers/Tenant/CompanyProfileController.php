<?php

namespace App\Http\Controllers\Tenant;

use App\Contracts\CompanyProfileContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\CompanyProfileRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CompanyProfileController extends Controller
{
    protected CompanyProfileContract $service;

    public function __construct(CompanyProfileContract $service)
    {
        $this->service = $service;
    }

    public function edit(string $tenant_slug): Response
    {
        $tenant = $this->service->getCompanyProfile($tenant_slug);

        $mediaUrl = $tenant->getFirstMediaUrl('logo') ?: $tenant->logo;

        return Inertia::render('Tenant/Settings/CompanyProfile', [
            'company' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'slug' => $tenant->slug,
                'logo' => $mediaUrl,
                'phone' => $tenant->phone ?? '',
                'address' => $tenant->address ?? '',
            ],
        ]);
    }

    public function update(CompanyProfileRequest $request, string $tenant_slug): RedirectResponse
    {
        $this->service->updateCompanyProfile($tenant_slug, $request->validated());

        return to_route('tenant.settings.company-profile.edit', ['tenant_slug' => $tenant_slug])
            ->with('success', 'Company profile updated successfully.');
    }

    public function destroyLogo(string $tenant_slug): RedirectResponse
    {
        $this->service->deleteCompanyLogo($tenant_slug);

        return to_route('tenant.settings.company-profile.edit', ['tenant_slug' => $tenant_slug])
            ->with('success', 'Company logo removed successfully.');
    }
}
