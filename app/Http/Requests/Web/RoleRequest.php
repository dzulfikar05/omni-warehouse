<?php

namespace App\Http\Requests\Web;

use Illuminate\Foundation\Http\FormRequest;

class RoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isStore = $this->isMethod('POST');
        $roleId = $this->route('role');

        return [
            'name' => [
                'required',
                'string',
                $isStore ? 'unique:roles,name' : 'unique:roles,name,' . $roleId
            ],
            'permissions' => ['nullable', 'array'],
        ];
    }
}
