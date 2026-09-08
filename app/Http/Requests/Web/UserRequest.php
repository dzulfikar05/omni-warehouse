<?php

namespace App\Http\Requests\Web;

use Illuminate\Foundation\Http\FormRequest;

class UserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isStore = $this->isMethod('POST');

        $userId = $this->route('user');

        return [
            'name' => ['required', 'string', 'max:255'],

            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                $isStore ? 'unique:users,email' : 'unique:users,email,' . $userId
            ],

            'password' => [
                $isStore ? 'required' : 'nullable',
                'string',
                'min:6',
                'confirmed'
            ],

            'role' => ['required', 'exists:roles,name'],
        ];
    }
}
