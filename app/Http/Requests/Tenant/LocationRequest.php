<?php

namespace App\Http\Requests\Tenant;

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
        // Extract location parameter safely whether it's bound as an object or primitive
        $location = $this->route('location');
        $locationId = is_object($location) ? $location->id : $location;

        return [
            'warehouse_id' => ['required', 'integer', 'exists:warehouses,id'],
            'rack_code'    => [
                'required',
                'string',
                'max:100',
                Rule::unique('locations', 'rack_code')->ignore($locationId),
            ],
            'zone'      => ['nullable', 'string', 'max:100'],
            'desc'      => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'warehouse_id.required' => __('A warehouse is required.'),
            'warehouse_id.exists'   => __('The selected warehouse is invalid.'),
            'rack_code.required'    => __('A rack code is required.'),
            'rack_code.unique'      => __('This rack code is already in use. Choose a different code.'),
        ];
    }
}
