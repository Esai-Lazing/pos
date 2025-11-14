import AppLayout from '@/layouts/app-layout';
import * as printerRoutes from '@/routes/printer';
import { type BreadcrumbItem } from '@/types';
import { type Printer } from '@/types/printer';
import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';

interface Props {
    printer: Printer;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Imprimantes',
        href: printerRoutes.index().url,
    },
    {
        title: 'Modifier',
        href: '#',
    },
];

export default function PrinterEdit({ printer }: Props) {
    const [type, setType] = useState<'bluetooth' | 'usb' | 'wifi'>(printer.type);
    const [estActif, setEstActif] = useState(printer.est_actif);
    const [estParDefaut, setEstParDefaut] = useState(printer.est_par_defaut);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Modifier ${printer.nom}`} />
            <div className="flex flex-col gap-4 p-4">
                <h1 className="text-2xl font-bold">Modifier l'imprimante</h1>

                <Form
                    method="put"
                    action={printerRoutes.update(printer.id).url}
                    className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6"
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium">Nom de l'imprimante *</label>
                            <input
                                type="text"
                                name="nom"
                                defaultValue={printer.nom}
                                required
                                className="w-full rounded-lg border border-input bg-background px-3 py-2"
                                placeholder="Ex: Imprimante POS Bluetooth"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium">Type de connexion *</label>
                            <select
                                name="type"
                                value={type}
                                onChange={(e) => setType(e.target.value as 'bluetooth' | 'usb' | 'wifi')}
                                required
                                className="w-full rounded-lg border border-input bg-background px-3 py-2"
                            >
                                <option value="bluetooth">Bluetooth</option>
                                <option value="usb">USB</option>
                                <option value="wifi">Wi-Fi</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Adresse {type === 'bluetooth' ? '(MAC)' : type === 'usb' ? '(Port)' : '(IP)'}
                            </label>
                            <input
                                type="text"
                                name="adresse"
                                defaultValue={printer.adresse || ''}
                                className="w-full rounded-lg border border-input bg-background px-3 py-2"
                                placeholder={
                                    type === 'bluetooth'
                                        ? 'Ex: 00:11:22:33:44:55'
                                        : type === 'usb'
                                          ? 'Ex: /dev/ttyUSB0'
                                          : 'Ex: 192.168.1.100'
                                }
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium">Modèle</label>
                            <input
                                type="text"
                                name="modele"
                                defaultValue={printer.modele || ''}
                                className="w-full rounded-lg border border-input bg-background px-3 py-2"
                                placeholder="Ex: XP-80C"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium">Largeur du papier (mm)</label>
                            <select
                                name="largeur_papier"
                                defaultValue={printer.largeur_papier || 80}
                                className="w-full rounded-lg border border-input bg-background px-3 py-2"
                            >
                                <option value={58}>58mm (ticket standard)</option>
                                <option value={80}>80mm (ticket large)</option>
                                <option value={112}>112mm (A4)</option>
                            </select>
                        </div>
                    </div>

                    <div className="border-t border-border pt-4">
                        <h3 className="mb-4 text-lg font-semibold">Informations du restaurant</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium">Nom du restaurant</label>
                                <input
                                    type="text"
                                    name="nom_restaurant"
                                    defaultValue={printer.nom_restaurant || ''}
                                    className="w-full rounded-lg border border-input bg-background px-3 py-2"
                                    placeholder="Ex: Restaurant Le Bon Goût"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">Téléphone</label>
                                <input
                                    type="text"
                                    name="telephone_restaurant"
                                    defaultValue={printer.telephone_restaurant || ''}
                                    className="w-full rounded-lg border border-input bg-background px-3 py-2"
                                    placeholder="Ex: +243 900 000 000"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium">Adresse</label>
                                <input
                                    type="text"
                                    name="adresse_restaurant"
                                    defaultValue={printer.adresse_restaurant || ''}
                                    className="w-full rounded-lg border border-input bg-background px-3 py-2"
                                    placeholder="Ex: Avenue X, Kinshasa"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-border pt-4">
                        <h3 className="mb-4 text-lg font-semibold">Message de facture</h3>
                        <div>
                            <label className="mb-2 block text-sm font-medium">Message personnalisé</label>
                            <textarea
                                name="message_facture"
                                rows={3}
                                defaultValue={printer.message_facture || ''}
                                className="w-full rounded-lg border border-input bg-background px-3 py-2"
                                placeholder="Ex: Merci de votre visite ! À bientôt !"
                            />
                        </div>
                    </div>

                    <div className="border-t border-border pt-4">
                        <div className="flex flex-col gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="est_actif"
                                    checked={estActif}
                                    onChange={(e) => setEstActif(e.target.checked)}
                                    className="rounded border-input"
                                />
                                <span className="text-sm font-medium">Imprimante active</span>
                            </label>

                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="est_par_defaut"
                                    checked={estParDefaut}
                                    onChange={(e) => setEstParDefaut(e.target.checked)}
                                    className="rounded border-input"
                                />
                                <span className="text-sm font-medium">Imprimante par défaut</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-2 border-t border-border pt-4">
                        <button
                            type="submit"
                            className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                        >
                            Enregistrer
                        </button>
                        <a
                            href={printerRoutes.index().url}
                            className="rounded-lg border border-border bg-background px-4 py-2 hover:bg-accent"
                        >
                            Annuler
                        </a>
                    </div>
                </Form>
            </div>
        </AppLayout>
    );
}


