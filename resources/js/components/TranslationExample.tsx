/**
 * Exemple d'utilisation des traductions dans un composant React
 * 
 * Ce fichier montre comment utiliser le hook useTranslation dans vos composants
 */

import { useTranslation } from '@/hooks/useTranslation';

export default function TranslationExample() {
    const { t, trans } = useTranslation();

    return (
        <div>
            {/* Méthode 1 : Utilisation directe avec t() */}
            <h1>{t('dashboard', 'common')}</h1>
            <p>{t('welcome', 'common')}</p>

            {/* Méthode 2 : Utilisation avec les helpers trans */}
            <button>{trans.common('save')}</button>
            <button>{trans.common('cancel')}</button>

            {/* Exemples avec différents namespaces */}
            <h2>{trans.stock('title')}</h2>
            <p>{trans.stock('add_product')}</p>

            <h2>{trans.sales('title')}</h2>
            <p>{trans.sales('new_sale')}</p>

            <h2>{trans.reports('title')}</h2>
            <p>{trans.reports('daily_report')}</p>

            <h2>{trans.printer('title')}</h2>
            <p>{trans.printer('print_receipt')}</p>

            <h2>{trans.auth('login')}</h2>
            <p>{trans.auth('email')}</p>
        </div>
    );
}

