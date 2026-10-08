<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CompanyProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $tenantSlug = $this->route('tenant_slug');

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                'alpha_dash',
                Rule::unique('tenants', 'slug')->ignore($tenantSlug, 'slug'),
            ],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'tax_number' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string'],
            'logo' => ['nullable', 'file', 'mimes:jpeg,png,jpg,gif,svg', 'max:2048'],
        ];
    }
}
