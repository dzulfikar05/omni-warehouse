<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SkuRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $skuId = $this->route('sku') ? $this->route('sku')->id : null;

        return [
            'product_id'    => ['required', 'integer', 'exists:products,id'],
            'unit_id'       => ['required', 'integer', 'exists:units,id'],
            'sku_code'      => [
                'required',
                'string',
                'max:100',
                Rule::unique('skus', 'sku_code')->ignore($skuId),
            ],
            'barcode'       => [
                'nullable',
                'string',
                'max:100',
                Rule::unique('skus', 'barcode')->ignore($skuId),
            ],
            'base_cost'     => ['required', 'numeric', 'min:0'],
            'current_stock' => ['required', 'integer', 'min:0'],
            'min_stock'     => ['nullable', 'integer', 'min:0'],
            'max_stock'     => ['nullable', 'integer', 'min:0'],
            'weight_grams'  => ['nullable', 'numeric', 'min:0'],
            'is_active'     => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'product_id.required'    => __('A product is required.'),
            'product_id.exists'      => __('The selected product is invalid.'),
            'unit_id.required'       => __('A unit is required.'),
            'unit_id.exists'         => __('The selected unit is invalid.'),
            'sku_code.required'      => __('An SKU code is required.'),
            'sku_code.unique'        => __('This SKU code is already in use.'),
            'barcode.unique'         => __('This barcode is already registered.'),
            'base_cost.required'     => __('A base cost is required.'),
            'base_cost.numeric'      => __('The base cost must be a number.'),
            'current_stock.required' => __('An opening stock quantity is required.'),
            'current_stock.integer'  => __('The stock quantity must be a whole number.'),
        ];
    }
}
