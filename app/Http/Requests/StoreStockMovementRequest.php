<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStockMovementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->canAccessStock() ?? false;
    }

    public function rules(): array
    {
        return [
            'produit_id' => ['required', 'exists:produits,id'],
            'type' => ['required', 'string', Rule::in(['entree', 'sortie', 'ajustement'])],
            'quantite_casiers' => ['nullable', 'integer', 'min:0'],
            'quantite_bouteilles' => ['nullable', 'integer', 'min:0'],
            'quantite_verres' => ['nullable', 'integer', 'min:0'],
            'prix_achat_fc' => ['nullable', 'numeric', 'min:0'],
            'prix_achat_usd' => ['nullable', 'numeric', 'min:0'],
            'raison' => ['nullable', 'string'],
            'reference_fournisseur' => ['nullable', 'string', 'max:255'],
            'date_mouvement' => ['nullable', 'date'],
        ];
    }
}
