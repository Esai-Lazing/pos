import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { type HTMLAttributes } from 'react';

export default function InputError({
    message,
    className = '',
    ...props
}: HTMLAttributes<HTMLParagraphElement> & { message?: string }) {
    const { trans } = useTranslation();

    if (!message) {
        return null;
    }

    // Essayer de traduire le message si c'est une clé de traduction
    // Les messages Laravel peuvent être des clés comme "auth.failed" ou des messages complets
    let translatedMessage = message;

    // Si le message ressemble à une clé de traduction (contient un point)
    if (message.includes('.')) {
        const [namespace, key] = message.split('.', 2);
        if (namespace === 'auth' || namespace === 'validation') {
            const translation = trans[namespace as 'auth' | 'validation'](key);
            if (translation !== key) {
                translatedMessage = translation;
            }
        }
    }

    // Si le message est un message Laravel standard, essayer de le traduire
    // Messages d'authentification courants
    const authMessages: Record<string, string> = {
        'These credentials do not match our records.': trans.auth('failed'),
        'The provided password is incorrect.': trans.auth('password_incorrect'),
        'Too many login attempts.': trans.auth('throttle'),
    };

    if (authMessages[message]) {
        translatedMessage = authMessages[message];
    }

    return (
        <p
            {...props}
            className={cn('text-sm text-red-600 dark:text-red-400', className)}
        >
            {translatedMessage}
        </p>
    );
}
