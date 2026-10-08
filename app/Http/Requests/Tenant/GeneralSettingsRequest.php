<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class GeneralSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'doc_header_html' => ['nullable', 'string'],
            'doc_footer_html' => ['nullable', 'string'],
            'doc_show_logo' => ['nullable', 'boolean'],
            'doc_show_npwp' => ['nullable', 'boolean'],
            'doc_paper_size' => ['nullable', 'string', 'in:A4,Letter,Legal'],
        ];
    }
}
