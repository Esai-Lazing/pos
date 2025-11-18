/**
 * Page de test pour vérifier que les traductions fonctionnent dans le navigateur
 */

import { useTranslation } from '@/hooks/useTranslation';
import { usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { useEffect } from 'react';

export default function TranslationTest() {
    const { trans, translations } = useTranslation();
    const { props } = usePage<SharedData>();

    useEffect(() => {
        console.log('Translations object:', props.translations);
        console.log('Common translations:', translations.common);
        console.log('Auth translations:', translations.auth);
    }, [props.translations, translations]);

    return (
        <>
            <Head title="Test des traductions" />
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6">Test des traductions</h1>

                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4">État des traductions</h2>
                        <div className="space-y-2">
                            <p>
                                <strong>Traductions disponibles:</strong>{' '}
                                <span className={props.translations ? 'text-green-600' : 'text-red-600'}>
                                    {props.translations ? 'Oui ✓' : 'Non ✗'}
                                </span>
                            </p>
                            <p>
                                <strong>Common keys:</strong>{' '}
                                {translations.common ? Object.keys(translations.common).length : 0}
                            </p>
                            <p>
                                <strong>Stock keys:</strong>{' '}
                                {translations.stock ? Object.keys(translations.stock).length : 0}
                            </p>
                            <p>
                                <strong>Sales keys:</strong>{' '}
                                {translations.sales ? Object.keys(translations.sales).length : 0}
                            </p>
                            <p>
                                <strong>Auth keys:</strong>{' '}
                                {translations.auth ? Object.keys(translations.auth).length : 0}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4">Exemples de traductions</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-semibold mb-2">Common</h3>
                                <ul className="space-y-1 text-sm">
                                    <li>Dashboard: <strong>{trans.common('dashboard')}</strong></li>
                                    <li>Save: <strong>{trans.common('save')}</strong></li>
                                    <li>Cancel: <strong>{trans.common('cancel')}</strong></li>
                                    <li>Delete: <strong>{trans.common('delete')}</strong></li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">Auth</h3>
                                <ul className="space-y-1 text-sm">
                                    <li>Login: <strong>{trans.auth('login')}</strong></li>
                                    <li>Email: <strong>{trans.auth('email')}</strong></li>
                                    <li>Password: <strong>{trans.auth('password')}</strong></li>
                                    <li>Register: <strong>{trans.auth('register')}</strong></li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">Stock</h3>
                                <ul className="space-y-1 text-sm">
                                    <li>Title: <strong>{trans.stock('title')}</strong></li>
                                    <li>Add Product: <strong>{trans.stock('add_product')}</strong></li>
                                    <li>Products: <strong>{trans.stock('products')}</strong></li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">Sales</h3>
                                <ul className="space-y-1 text-sm">
                                    <li>Title: <strong>{trans.sales('title')}</strong></li>
                                    <li>New Sale: <strong>{trans.sales('new_sale')}</strong></li>
                                    <li>Cart: <strong>{trans.sales('cart')}</strong></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Données brutes (pour débogage)</h2>
                        <details>
                            <summary className="cursor-pointer font-medium mb-2">
                                Cliquer pour voir les traductions complètes
                            </summary>
                            <pre className="text-xs overflow-auto bg-gray-100 p-4 rounded max-h-96">
                                {JSON.stringify(translations, null, 2)}
                            </pre>
                        </details>
                    </div>
                </div>
            </div>
        </>
    );
}

