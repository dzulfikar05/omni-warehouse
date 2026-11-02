<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class TenantCheckRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tenant_slug' => ['required', 'string', 'alpha_dash', 'exists:tenants,slug'],
        ];
    }

    public function messages(): array
    {
        return [
            'tenant_slug.exists' => 'Workspace / Tenant tidak ditemukan atau tidak aktif.',
        ];
    }
}
