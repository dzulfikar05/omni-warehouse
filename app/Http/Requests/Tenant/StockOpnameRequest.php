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
                'warehouse_id' => 'required|integer|exists:warehouses,id',
                'zone'         => 'required|string|max:100',
                'audit_type'   => 'required|string|max:50',
                'cut_off_date' => 'required|date',
                'notes'        => 'nullable|string|max:255',
            ];
        }

        if ($this->routeIs('*.verify')) {
            return [
                'item_id'      => 'required|integer',
                'physical_qty' => 'required|numeric|min:0',
                'notes'        => 'nullable|string|max:255',
            ];
        }

        if ($this->routeIs('*.adjust')) {
            return [
                'session_id'   => 'required|integer',
            ];
        }

        return [];
    }

    public function messages(): array
    {
        return [
            'warehouse_id.required' => __('A warehouse is required.'),
            'warehouse_id.exists'   => __('The selected warehouse is invalid.'),
            'zone.required'         => __('An audit zone is required.'),
            'audit_type.required'   => __('An audit type is required.'),
            'cut_off_date.required' => __('A cut-off date is required.'),
            'physical_qty.required' => __('A physical quantity is required.'),
            'physical_qty.min'      => __('The physical quantity must be zero or greater.'),
            'session_id.required'   => __('The stocktake session could not be found.'),
        ];
    }
}
