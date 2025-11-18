<?php

namespace App\Actions\Fortify;

use App\Models\Abonnement;
use App\Models\Restaurant;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user with restaurant and subscription.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class),
            ],
            'password' => $this->passwordRules(),
            // Restaurant fields
            'restaurant_nom' => ['required', 'string', 'max:255'],
            'restaurant_telephone' => ['nullable', 'string', 'max:255'],
            'restaurant_type_etablissement' => ['required', 'string', Rule::in(['restaurant', 'bar', 'cafe', 'hotel', 'fast-food', 'autre'])],
            'restaurant_categorie' => ['nullable', 'string', 'max:255'],
            // Subscription fields
            'plan' => ['required', 'string', Rule::in(['simple', 'medium', 'premium'])],
            'mode_paiement' => ['required', 'string', Rule::in(['mobile_money', 'carte_bancaire', 'espece', 'autre'])],
            'numero_transaction' => ['nullable', 'string', 'max:255'],
        ])->validate();

        return DB::transaction(function () use ($input) {
            // Récupérer les informations du plan
            $planData = SubscriptionPlan::getPlanBySlug($input['plan']);
            if (! $planData) {
                throw new \InvalidArgumentException('Plan d\'abonnement invalide');
            }

            // Créer le restaurant
            $restaurant = Restaurant::create([
                'nom' => $input['restaurant_nom'],
                'slug' => Restaurant::genererSlugUnique($input['restaurant_nom']),
                'email' => $input['email'],
                'telephone' => $input['restaurant_telephone'] ?? null,
                'type_etablissement' => $input['restaurant_type_etablissement'],
                'categorie' => $input['restaurant_categorie'] ?? null,
                'est_actif' => true,
                'date_creation' => now(),
            ]);

            // Créer l'abonnement
            $abonnement = Abonnement::create([
                'restaurant_id' => $restaurant->id,
                'plan' => $input['plan'],
                'montant_mensuel' => $planData['montant_mensuel'],
                'mode_paiement' => $input['mode_paiement'],
                'numero_transaction' => $input['numero_transaction'] ?? null,
                'date_paiement' => now(),
                'date_debut' => now(),
                'date_fin' => now()->addMonth(), // Abonnement mensuel
                'est_actif' => true,
                'statut' => 'actif',
                'limitations' => $planData['limitations'],
            ]);

            // Créer l'utilisateur admin du restaurant
            $user = User::create([
                'name' => $input['name'],
                'email' => $input['email'],
                'password' => $input['password'],
                'role' => 'admin',
                'restaurant_id' => $restaurant->id,
                'is_active' => true,
                'email_verified_at' => now(),
            ]);

            return $user;
        });
    }
}
