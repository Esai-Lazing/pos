import { Form } from '@inertiajs/react';
import { useState } from 'react';

export default function ServeurLogin() {
    const [pinCode, setPinCode] = useState('');

    const handlePinInput = (value: string) => {
        // Ne permettre que les chiffres et limiter à 4
        const numericValue = value.replace(/\D/g, '').slice(0, 4);
        setPinCode(numericValue);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 p-4">
            <div className="w-full max-w-md">
                <div className="rounded-lg border border-border bg-card p-8 shadow-lg">
                    <div className="mb-6 text-center">
                        <h1 className="mb-2 text-3xl font-bold">Connexion Serveur</h1>
                        <p className="text-muted-foreground">Entrez votre code PIN à 4 chiffres</p>
                    </div>

                    <Form action="/serveur/login" method="post" className="space-y-6">
                        <div>
                            <label htmlFor="pin_code" className="mb-2 block text-sm font-medium">
                                Code PIN
                            </label>
                            <div className="flex gap-2">
                                {[0, 1, 2, 3].map((index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={pinCode[index] || ''}
                                        onChange={(e) => {
                                            const newValue = e.target.value.replace(/\D/g, '');
                                            if (newValue) {
                                                const newPin = pinCode.split('');
                                                newPin[index] = newValue;
                                                handlePinInput(newPin.join(''));
                                                // Focus sur le champ suivant
                                                const nextInput = document.getElementById(`pin-${index + 1}`);
                                                if (nextInput) {
                                                    nextInput.focus();
                                                }
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Backspace' && !pinCode[index] && index > 0) {
                                                const prevInput = document.getElementById(`pin-${index - 1}`);
                                                if (prevInput) {
                                                    prevInput.focus();
                                                }
                                            }
                                        }}
                                        id={`pin-${index}`}
                                        className="h-14 w-full rounded-lg border-2 border-input bg-background text-center text-2xl font-bold focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                        autoFocus={index === 0}
                                    />
                                ))}
                            </div>
                            <input type="hidden" name="pin_code" value={pinCode} />
                        </div>

                        <button
                            type="submit"
                            disabled={pinCode.length !== 4}
                            className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Se connecter
                        </button>
                    </Form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            Vous êtes un administrateur ?{' '}
                            <a href="/login" className="text-primary hover:underline">
                                Connectez-vous ici
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

