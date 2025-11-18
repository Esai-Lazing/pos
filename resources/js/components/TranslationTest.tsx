/**
 * Composant de test pour vérifier que les traductions fonctionnent
 * À utiliser temporairement pour déboguer
 */

import { useTranslation } from '@/hooks/useTranslation';
import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

export default function TranslationTest() {
    const { trans, translations } = useTranslation();
    const { props } = usePage<SharedData>();

    return (
        <div className="p-4 bg-white rounded shadow">
            <h2 className="text-xl font-bold mb-4">Test des traductions</h2>

            <div className="space-y-2 mb-4">
                <p>
                    <strong>Traductions disponibles:</strong>{' '}
                    {props.translations ? 'Oui' : 'Non'}
                </p>
                <p>
                    <strong>Common keys:</strong>{' '}
                    {translations.common ? Object.keys(translations.common).length : 0}
                </p>
                <p>
                    <strong>Auth keys:</strong>{' '}
                    {translations.auth ? Object.keys(translations.auth).length : 0}
                </p>
            </div>

            <div className="space-y-2">
                <h3 className="font-semibold">Exemples de traductions:</h3>
                <p>Dashboard: {trans.common('dashboard')}</p>
                <p>Login: {trans.auth('login')}</p>
                <p>Email: {trans.auth('email')}</p>
                <p>Password: {trans.auth('password')}</p>
                <p>Save: {trans.common('save')}</p>
            </div>

            <div className="mt-4 p-2 bg-gray-100 rounded">
                <h4 className="font-semibold mb-2">Raw translations object:</h4>
                <pre className="text-xs overflow-auto">
                    {JSON.stringify(translations, null, 2)}
                </pre>
            </div>
        </div>
    );
}

