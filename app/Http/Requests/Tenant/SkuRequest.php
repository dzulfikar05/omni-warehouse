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
            'product_id.required'    => 'Produk induk wajib dipilih.',
            'product_id.exists'      => 'Produk yang dipilih tidak ditemukan.',
            'unit_id.required'       => 'Satuan (Unit) wajib dipilih.',
            'unit_id.exists'         => 'Satuan yang dipilih tidak valid.',
            'sku_code.required'      => 'Kode SKU wajib diisi.',
            'sku_code.unique'        => 'Kode SKU ini sudah digunakan oleh barang lain.',
            'barcode.unique'         => 'Barcode ini sudah terdaftar di sistem.',
            'base_cost.required'     => 'Harga dasar (Cost) wajib diisi.',
            'base_cost.numeric'      => 'Harga dasar harus berupa angka.',
            'current_stock.required' => 'Jumlah stok awal wajib diisi.',
            'current_stock.integer'  => 'Jumlah stok harus berupa angka bulat.',
        ];
    }
}
