export interface Printer {
    id: number;
    nom: string;
    type: 'bluetooth' | 'usb' | 'wifi';
    adresse: string | null;
    modele: string | null;
    largeur_papier: number;
    parametres: Record<string, any> | null;
    est_actif: boolean;
    est_par_defaut: boolean;
    message_facture: string | null;
    nom_restaurant: string | null;
    adresse_restaurant: string | null;
    telephone_restaurant: string | null;
    created_at: string;
    updated_at: string;
}


