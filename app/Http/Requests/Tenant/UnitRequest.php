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
            'name.required'   => __('A unit name is required.'),
            'name.string'     => __('The unit name must be text.'),
            'symbol.required' => __('A unit symbol is required.'),
            'symbol.max'      => __('The unit symbol may not exceed 10 characters.'),
        ];
    }
}
