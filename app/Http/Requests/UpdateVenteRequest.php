<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVenteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->canAccessVente() ?? false;
    }

    protected function prepareForValidation(): void
    {
        // Décoder le JSON des items si c'est une chaîne
        if ($this->has('items') && is_string($this->items)) {
            $decoded = json_decode($this->items, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $this->merge(['items' => $decoded]);
            }
        }
    }

    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.produit_id' => ['required', 'exists:produits,id'],
            'items.*.unite' => ['required', 'string', Rule::in(['casier', 'bouteille'])],
            'items.*.quantite' => ['required', 'integer', 'min:1'],
            'items.*.prix_unitaire_fc' => ['required', 'numeric', 'min:0'],
            'items.*.prix_unitaire_usd' => ['nullable', 'numeric', 'min:0'],
            'montant_paye_fc' => ['nullable', 'numeric', 'min:0'],
            'montant_paye_usd' => ['nullable', 'numeric', 'min:0'],
            'mode_paiement' => ['required', 'string', Rule::in(['fc', 'usd', 'mixte'])],
            'taux_change' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
        ];
    }
}


