<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProduitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->canAccessStock() ?? false;
    }

    protected function prepareForValidation(): void
    {
        // Convertir la checkbox est_actif : si absente, c'est true par défaut (nouveau produit actif)
        if (!$this->has('est_actif')) {
            $this->merge(['est_actif' => true]);
        } else {
            // Si présente, convertir en booléen
            $this->merge(['est_actif' => filter_var($this->est_actif, FILTER_VALIDATE_BOOLEAN)]);
        }
    }

    public function rules(): array
    {
        return [
            'nom' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:255', 'unique:produits,code'],
            'description' => ['nullable', 'string'],
            'categorie' => ['nullable', 'string', 'max:255'],
            'unite_mesure' => ['required', 'string', Rule::in(['casier', 'bouteille', 'verre'])],
            'bouteilles_par_casier' => ['required', 'integer', Rule::in([12, 24])],
            'quantite_casiers' => ['nullable', 'integer', 'min:0'],
            'quantite_bouteilles' => ['nullable', 'integer', 'min:0'],
            'quantite_verres' => ['nullable', 'integer', 'min:0'],
            'stock_minimum' => ['nullable', 'integer', 'min:0'],
            'prix_casier_fc' => ['nullable', 'numeric', 'min:0'],
            'prix_casier_usd' => ['nullable', 'numeric', 'min:0'],
            'prix_bouteille_fc' => ['nullable', 'numeric', 'min:0'],
            'prix_bouteille_usd' => ['nullable', 'numeric', 'min:0'],
            'est_actif' => ['sometimes', 'boolean'],
            'image' => ['nullable', 'string'],
        ];
    }
}
