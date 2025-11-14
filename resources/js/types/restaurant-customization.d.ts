export interface RestaurantCustomization {
    id: number;
    restaurant_id: number;
    logo: string | null;
    adresse: string | null;
    ville: string | null;
    pays: string | null;
    code_postal: string | null;
    description: string | null;
    site_web: string | null;
    reseaux_sociaux: Record<string, string> | null;
    couleur_principale: string | null;
    horaires: Record<string, any> | null;
    restaurant?: {
        id: number;
        nom: string;
        telephone: string | null;
    };
    created_at: string;
    updated_at: string;
}


