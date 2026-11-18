<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class StockOpnameRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        if ($this->routeIs('*.store-session')) {
            return [
                'warehouse_id' => 'required|integer',
                'location_id' => 'required|string|max:20',
                'notes' => 'nullable|string|max:255',
            ];
        }

        if ($this->routeIs('*.verify')) {
            return [
                'item_id' => 'required|integer',
                'physical_qty' => 'required|numeric|min:0',
                'notes' => 'nullable|string|max:1000',
            ];
        }

        if ($this->routeIs('*.scan')) {
            return [
                'session_id' => 'required|integer',
                'barcode' => 'required|string|max:100',
            ];
        }

        if ($this->routeIs('*.adjust')) {
            return [
                'session_id' => 'required|integer',
            ];
        }

        return [];
    }

    public function messages(): array
    {
        return [
            'warehouse_id.required' => __('A warehouse is required.'),
            'location_id.required' => __('A location or rack is required.'),
            'physical_qty.required' => __('A physical quantity is required.'),
            'physical_qty.min' => __('The physical quantity must be zero or greater.'),
            'session_id.required' => __('The stocktake session could not be found.'),
        ];
    }
}
