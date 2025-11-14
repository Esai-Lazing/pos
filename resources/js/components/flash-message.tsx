import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePage } from '@inertiajs/react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { type SharedData } from '@/types';

type FlashType = 'success' | 'error' | 'warning' | 'info';

interface FlashMessageProps {
    type: FlashType;
    message: string;
    onClose: () => void;
}

function FlashMessage({ type, message, onClose }: FlashMessageProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Attendre l'animation de fermeture
        }, 5000); // Afficher pendant 5 secondes

        return () => clearTimeout(timer);
    }, [onClose]);

    const icons = {
        success: CheckCircle2,
        error: XCircle,
        warning: AlertTriangle,
        info: Info,
    };

    const colors = {
        success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
        error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
        info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
    };

    const Icon = icons[type];

    if (!isVisible) {
        return null;
    }

    return (
        <div
            className={`transition-all duration-300 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            }`}
        >
            <Alert className={`${colors[type]} relative pr-10`}>
                <Icon className="h-4 w-4" />
                <AlertDescription className="font-medium">{message}</AlertDescription>
                <button
                    onClick={() => {
                        setIsVisible(false);
                        setTimeout(onClose, 300);
                    }}
                    className="absolute right-2 top-2 rounded-md p-1 hover:bg-black/5 dark:hover:bg-white/5"
                >
                    <X className="h-4 w-4" />
                </button>
            </Alert>
        </div>
    );
}

export default function FlashMessages() {
    const page = usePage<SharedData>();
    const { flash, errors } = page.props;
    const [messages, setMessages] = useState<Array<{ id: string; type: FlashType; message: string }>>([]);

    useEffect(() => {
        const newMessages: Array<{ id: string; type: FlashType; message: string }> = [];

        if (flash?.success) {
            newMessages.push({
                id: `success-${Date.now()}`,
                type: 'success',
                message: flash.success,
            });
        }

        if (flash?.error) {
            newMessages.push({
                id: `error-${Date.now()}`,
                type: 'error',
                message: flash.error,
            });
        }

        if (flash?.warning) {
            newMessages.push({
                id: `warning-${Date.now()}`,
                type: 'warning',
                message: flash.warning,
            });
        }

        if (flash?.info) {
            newMessages.push({
                id: `info-${Date.now()}`,
                type: 'info',
                message: flash.info,
            });
        }

        // Afficher les erreurs de validation si présentes
        if (errors && Object.keys(errors).length > 0) {
            const errorMessages = Object.values(errors).flat();
            errorMessages.forEach((error) => {
                if (typeof error === 'string') {
                    newMessages.push({
                        id: `error-${Date.now()}-${Math.random()}`,
                        type: 'error',
                        message: error,
                    });
                }
            });
        }

        if (newMessages.length > 0) {
            setMessages((prev) => [...prev, ...newMessages]);
        }
    }, [flash, errors]);

    const removeMessage = (id: string) => {
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
    };

    if (messages.length === 0) {
        return null;
    }

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full">
            {messages.map((msg) => (
                <FlashMessage
                    key={msg.id}
                    type={msg.type}
                    message={msg.message}
                    onClose={() => removeMessage(msg.id)}
                />
            ))}
        </div>
    );
}

