<?php

namespace App\Http\Controllers\Tenant;

use App\Contracts\GeneralSettingsContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\GeneralSettingsRequest;
use App\Models\Tenant;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class GeneralSettingsController extends Controller
{
    protected GeneralSettingsContract $service;

    public function __construct(GeneralSettingsContract $service)
    {
        $this->service = $service;
    }

    public function edit(string $tenant_slug): Response
    {
        $settings = $this->service->getSettings($tenant_slug);
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();

        return Inertia::render('Tenant/Settings/GeneralSettings', [
            'settings' => $settings,
            'tenant_profile' => [
                'name' => $tenant->name,
                'tax_number' => $tenant->tax_number ?? '',
                'logo' => $tenant->getFirstMediaUrl('logo') ?: $tenant->logo,
            ],
        ]);
    }

    public function update(GeneralSettingsRequest $request, string $tenant_slug): RedirectResponse
    {
        $this->service->updateSettings($tenant_slug, $request->validated());

        return to_route('tenant.settings.general-settings.edit', ['tenant_slug' => $tenant_slug])
            ->with('success', 'General & Document Settings updated successfully.');
    }
}
