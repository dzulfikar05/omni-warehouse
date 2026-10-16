<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class UnitRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name'   => ['required', 'string', 'max:255'],
            'symbol' => ['required', 'string', 'max:10'],
        ];
    }

    /**
     * Custom validation error messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required'   => 'Unit name is required.',
            'name.string'     => 'Unit name must be a valid string.',
            'symbol.required' => 'Unit symbol is required.',
            'symbol.max'      => 'Unit symbol must not exceed 10 characters.',
        ];
    }
}
