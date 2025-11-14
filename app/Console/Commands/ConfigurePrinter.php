<?php

namespace App\Console\Commands;

use App\Models\Printer;
use Illuminate\Console\Command;

class ConfigurePrinter extends Command
{
    protected $signature = 'printer:configure
                            {--nom=JUVISY : Nom de l\'établissement}
                            {--adresse= : Adresse complète}
                            {--message= : Message personnalisé}
                            {--telephone= : Numéro de téléphone}';

    protected $description = 'Configure l\'imprimante par défaut avec les informations de l\'établissement';

    public function handle(): int
    {
        $nom = $this->option('nom') ?: 'JUVISY';
        $adresse = $this->option('adresse') ?: '217 Avenue Congo Motors, Quartier Gambella I, Commune Lubumbashi';
        $message = $this->option('message') ?: 'Merci de votre visite chez Juvisy !';
        $telephone = $this->option('telephone');

        $printer = Printer::updateOrCreate(
            ['nom' => 'Imprimante POS '.$nom],
            [
                'type' => 'wifi',
                'adresse' => null,
                'modele' => 'POS-80',
                'largeur_papier' => 80,
                'est_actif' => true,
                'est_par_defaut' => true,
                'message_facture' => $message,
                'nom_restaurant' => $nom,
                'adresse_restaurant' => $adresse,
                'telephone_restaurant' => $telephone,
            ]
        );

        $this->info('Imprimante configurée avec succès !');
        $this->table(
            ['Champ', 'Valeur'],
            [
                ['Nom', $printer->nom_restaurant],
                ['Adresse', $printer->adresse_restaurant],
                ['Téléphone', $printer->telephone_restaurant ?? 'Non renseigné'],
                ['Message', $printer->message_facture],
            ]
        );

        return Command::SUCCESS;
    }
}
