<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    /**
     * Détermine si l'utilisateur est autorisé à faire cette requête.
     */
    public function authorize(): bool
    {
        // Seul l'admin peut modifier les utilisateurs
        return $this->user()->isAdmin();
    }

    /**
     * Règles de validation.
     */
    public function rules(): array
    {
        $user = $this->route('user');

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user?->id),
            ],
            'role' => ['required', 'string', Rule::in(['admin', 'caisse', 'stock'])],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * Préparer les données pour la validation.
     */
    protected function prepareForValidation(): void
    {
        // Convertir la checkbox is_active en booléen
        // Si la checkbox est cochée, elle envoie "1", sinon elle n'est pas présente
        $this->merge([
            'is_active' => $this->boolean('is_active', false),
        ]);
    }
}
