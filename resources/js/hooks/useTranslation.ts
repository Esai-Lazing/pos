import { usePage } from '@inertiajs/react';
import { type SharedData, type Translations } from '@/types';

/**
 * Hook pour utiliser les traductions dans les composants React
 * 
 * @example
 * const { t, trans } = useTranslation();
 * 
 * // Utilisation simple
 * <h1>{t('dashboard', 'common')}</h1>
 * 
 * // Utilisation avec helpers
 * <button>{trans.common('save')}</button>
 * <button>{trans.stock('add_product')}</button>
 */
export function useTranslation() {
    const { props } = usePage<SharedData>();
    const translations = props.translations || {
        common: {},
        stock: {},
        sales: {},
        reports: {},
        printer: {},
        auth: {},
        validation: {},
    };

    const t = (key: string, namespace: keyof Translations = 'common'): string => {
        const namespaceTranslations = translations[namespace];
        return namespaceTranslations?.[key] || key;
    };

    const trans = {
        common: (key: string) => t(key, 'common'),
        stock: (key: string) => t(key, 'stock'),
        sales: (key: string) => t(key, 'sales'),
        reports: (key: string) => t(key, 'reports'),
        printer: (key: string) => t(key, 'printer'),
        auth: (key: string) => t(key, 'auth'),
        validation: (key: string) => t(key, 'validation'),
    };

    return { t, trans, translations };
}

