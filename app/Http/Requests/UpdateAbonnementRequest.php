<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAbonnementRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->isSuperAdmin() ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'plan' => ['sometimes', 'string', 'in:basique,premium,enterprise'],
            'montant_mensuel' => ['sometimes', 'numeric', 'min:0'],
            'date_debut' => ['sometimes', 'date'],
            'date_fin' => ['nullable', 'date', 'after:date_debut'],
            'statut' => ['sometimes', 'string', 'in:actif,suspendu,expire,annule'],
            'est_actif' => ['sometimes', 'boolean'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
