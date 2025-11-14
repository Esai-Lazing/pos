<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePrinterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    protected function prepareForValidation(): void
    {
        // Convertir les checkboxes : si absentes, c'est false
        if (!$this->has('est_actif')) {
            $this->merge(['est_actif' => false]);
        } else {
            $this->merge(['est_actif' => filter_var($this->est_actif, FILTER_VALIDATE_BOOLEAN)]);
        }

        if (!$this->has('est_par_defaut')) {
            $this->merge(['est_par_defaut' => false]);
        } else {
            $this->merge(['est_par_defaut' => filter_var($this->est_par_defaut, FILTER_VALIDATE_BOOLEAN)]);
        }
    }

    public function rules(): array
    {
        return [
            'nom' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', Rule::in(['bluetooth', 'usb', 'wifi'])],
            'adresse' => ['nullable', 'string', 'max:255'],
            'modele' => ['nullable', 'string', 'max:255'],
            'largeur_papier' => ['nullable', 'integer', 'min:58', 'max:112'],
            'parametres' => ['nullable', 'array'],
            'est_actif' => ['sometimes', 'boolean'],
            'est_par_defaut' => ['sometimes', 'boolean'],
            'message_facture' => ['nullable', 'string'],
            'nom_restaurant' => ['nullable', 'string', 'max:255'],
            'adresse_restaurant' => ['nullable', 'string', 'max:255'],
            'telephone_restaurant' => ['nullable', 'string', 'max:255'],
        ];
    }
}
