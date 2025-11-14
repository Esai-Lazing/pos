<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    /**
     * Détermine si l'utilisateur est autorisé à faire cette requête.
     */
    public function authorize(): bool
    {
        // Seul l'admin peut créer des utilisateurs
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * Règles de validation.
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                'unique:users,email',
            ],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['required', 'string', Rule::in(['admin', 'caisse', 'stock'])],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * Préparer les données pour la validation.
     */
    protected function prepareForValidation(): void
    {
        // Convertir la checkbox is_active : si absente, c'est true par défaut (nouveau compte actif)
        if (!$this->has('is_active')) {
            $this->merge(['is_active' => true]);
        } else {
            // Si présente, convertir en booléen
            $this->merge(['is_active' => filter_var($this->is_active, FILTER_VALIDATE_BOOLEAN)]);
        }
    }
}

