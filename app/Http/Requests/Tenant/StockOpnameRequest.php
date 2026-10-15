<?php

namespace App\Http\Requests;

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
            'warehouse_id.required' => 'Gudang target wajib dipilih.',
            'warehouse_id.exists'   => 'Gudang yang dipilih tidak valid.',
            'zone.required'         => 'Zona / Area audit wajib ditentukan.',
            'audit_type.required'   => 'Tipe siklus audit wajib dipilih.',
            'cut_off_date.required' => 'Batas waktu cut-off wajib diisi.',
            'physical_qty.required' => 'Jumlah hitungan fisik wajib diisi.',
            'physical_qty.min'      => 'Jumlah hitungan fisik tidak boleh bernilai negatif.',
            'session_id.required'   => 'ID Sesi opname tidak ditemukan.',
        ];
    }
}
