<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => ['required', 'exists:categories,id'],
            'name'        => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status'      => ['required', 'in:active,inactive,draft'],
        ];
    }

    public function messages(): array
    {
        return [
            'category_id.required' => __('A category is required.'),
            'category_id.exists'   => __('The selected category is invalid.'),
            'name.required'        => __('A product name is required.'),
            'status.required'      => __('A product status is required.'),
        ];
    }
}
