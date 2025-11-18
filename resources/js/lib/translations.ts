import { usePage } from '@inertiajs/react';
import { type SharedData, type Translations } from '@/types';

export function useTranslations(): Translations {
    const { props } = usePage<SharedData>();
    const translations = props.translations;

    if (!translations) {
        // Fallback si les traductions ne sont pas disponibles
        return {
            common: {},
            stock: {},
            sales: {},
            reports: {},
            printer: {},
            auth: {},
        };
    }

    return translations;
}

export function t(key: string, namespace: keyof Translations = 'common'): string {
    const translations = useTranslations();
    const namespaceTranslations = translations[namespace];

    if (!namespaceTranslations) {
        return key;
    }

    return namespaceTranslations[key] || key;
}

// Helpers pour chaque namespace
export const trans = {
    common: (key: string) => t(key, 'common'),
    stock: (key: string) => t(key, 'stock'),
    sales: (key: string) => t(key, 'sales'),
    reports: (key: string) => t(key, 'reports'),
    printer: (key: string) => t(key, 'printer'),
    auth: (key: string) => t(key, 'auth'),
};
