<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LocationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Ambil ID location jika dalam mode update/edit
        $locationId = $this->route('location') ? $this->route('location')->id : null;

        return [
            'warehouse_id' => 'required|integer|exists:warehouses,id',
            'rack_code'    => [
                'required',
                'string',
                'max:100',
                Rule::unique('locations', 'rack_code')->ignore($locationId),
            ],
            'zone'      => 'nullable|string|max:100',
            'desc'      => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'warehouse_id.required' => 'Gudang target wajib dipilih.',
            'warehouse_id.exists'   => 'Gudang yang dipilih tidak valid.',
            'rack_code.required'    => 'Kode rak wajib diisi.',
            'rack_code.unique'      => 'Kode rak sudah digunakan, gunakan kode lain.',
        ];
    }
}
