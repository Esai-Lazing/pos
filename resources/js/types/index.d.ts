import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
    roles?: ('super-admin' | 'admin' | 'caisse' | 'stock' | 'serveur')[];
}

export interface SubscriptionNotification {
    type: 'expired' | 'expiring';
    restaurant: {
        id: number;
        nom: string;
    };
    abonnement: {
        id: number;
        date_fin: string;
    };
    message: string;
    days_until_expiration?: number;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    restaurant?: {
        id: number;
        nom: string;
        email?: string;
        telephone?: string;
        customization?: {
            logo?: string;
            nom: string;
            adresse?: string;
            ville?: string;
            pays?: string;
            couleur_principale?: string;
        } | null;
    } | null;
    sidebarOpen: boolean;
    flash?: {
        success?: string;
        error?: string;
        warning?: string;
        info?: string;
        admin_credentials?: {
            email: string;
            password: string;
            name: string;
        };
    };
    subscriptionNotifications?: SubscriptionNotification[];
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    role?: 'super-admin' | 'admin' | 'caisse' | 'stock' | 'serveur';
    restaurant_id?: number;
    pin_code?: string;
    is_active?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
