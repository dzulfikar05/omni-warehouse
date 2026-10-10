<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class SupplierRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'       => ['required', 'string', 'max:255'],
            'pic'        => ['nullable', 'string', 'max:255'],
            'phone'      => ['nullable', 'string', 'max:255'],
            'email'      => ['nullable', 'email', 'max:255'],
            'tax_number' => ['nullable', 'string', 'max:255'],
            'address'    => ['nullable', 'string'],
            'notes'      => ['nullable', 'string'],
        ];
    }
}
