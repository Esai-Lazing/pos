import AppLayout from '@/layouts/app-layout';
import { Form } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useState } from 'react';

export default function ServeurCreate() {
    const [pinCode, setPinCode] = useState('');

    const generatePin = () => {
        const pin = Math.floor(1000 + Math.random() * 9000).toString();
        setPinCode(pin);
    };

    return (
        <AppLayout>
            <div className="space-y-6 p-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/serveur"
                        className="rounded-lg p-2 hover:bg-muted"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Nouveau Serveur</h1>
                        <p className="text-muted-foreground">Créer un nouveau compte serveur avec un code PIN</p>
                    </div>
                </div>

                <div className="rounded-lg border border-border bg-card p-6">
                    <Form action="/serveur" method="post" className="space-y-6">
                        <div>
                            <label htmlFor="name" className="mb-2 block text-sm font-medium">
                                Nom du serveur *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label htmlFor="pin_code" className="block text-sm font-medium">
                                    Code PIN (4 chiffres) *
                                </label>
                                <button
                                    type="button"
                                    onClick={generatePin}
                                    className="text-sm text-primary hover:underline"
                                >
                                    Générer automatiquement
                                </button>
                            </div>
                            <input
                                type="text"
                                id="pin_code"
                                name="pin_code"
                                value={pinCode}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                    setPinCode(value);
                                }}
                                required
                                maxLength={4}
                                pattern="[0-9]{4}"
                                className="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="0000"
                            />
                            <p className="mt-1 text-sm text-muted-foreground">
                                Ce code sera utilisé par le serveur pour se connecter
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={pinCode.length !== 4}
                                className="rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Créer le serveur
                            </button>
                            <Link
                                href="/serveur"
                                className="rounded-lg border border-border bg-background px-4 py-2 hover:bg-muted"
                            >
                                Annuler
                            </Link>
                        </div>
                    </Form>
                </div>
            </div>
        </AppLayout>
    );
}

