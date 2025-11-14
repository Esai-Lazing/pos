export interface Produit {
    id: number;
    nom: string;
    code: string | null;
}

export interface VenteItem {
    id: number;
    produit_id: number;
    produit?: Produit;
    unite: 'casier' | 'bouteille' | 'verre';
    quantite: number;
    prix_unitaire_fc: number;
    prix_unitaire_usd: number;
    sous_total_fc: number;
    sous_total_usd: number;
    benefice_fc: number;
    benefice_usd: number;
}

export interface Vente {
    id: number;
    numero_facture: string;
    user_id: number;
    user?: {
        id: number;
        name: string;
        email: string;
    };
    montant_total_fc: number;
    montant_total_usd: number;
    montant_paye_fc: number;
    montant_paye_usd: number;
    rendu_fc: number;
    rendu_usd: number;
    mode_paiement: 'fc' | 'usd' | 'mixte';
    taux_change: number | null;
    est_imprime: boolean;
    imprime_at: string | null;
    est_synchronise: boolean;
    notes: string | null;
    items?: VenteItem[];
    created_at: string;
    updated_at: string;
}

