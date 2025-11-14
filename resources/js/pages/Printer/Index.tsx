import AppLayout from '@/layouts/app-layout';
import * as printerRoutes from '@/routes/printer';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Edit, Plus, Printer as PrinterIcon, Trash2 } from 'lucide-react';

interface Printer {
    id: number;
    nom: string;
    type: string;
    adresse: string | null;
    modele: string | null;
    est_actif: boolean;
    est_par_defaut: boolean;
}

interface Props {
    printers: Printer[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Imprimantes',
        href: printerRoutes.index().url,
    },
];

export default function PrinterIndex({ printers }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configuration des Imprimantes" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Configuration des Imprimantes</h1>
                    <Link
                        href={printerRoutes.create().url}
                        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                    >
                        <Plus className="h-4 w-4" />
                        Nouvelle Imprimante
                    </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {printers.map((printer) => (
                        <div
                            key={printer.id}
                            className="rounded-lg border border-border bg-card p-4"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    <PrinterIcon className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <h3 className="font-semibold">{printer.nom}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {printer.type} - {printer.modele || 'Non spécifié'}
                                        </p>
                                    </div>
                                </div>
                                {printer.est_par_defaut && (
                                    <span className="rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
                                        Par défaut
                                    </span>
                                )}
                            </div>
                            {printer.adresse && (
                                <div className="mt-2 text-sm text-muted-foreground">
                                    Adresse: {printer.adresse}
                                </div>
                            )}
                            <div className="mt-4 flex gap-2">
                                <Link
                                    href={printerRoutes.edit(printer.id).url}
                                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-center text-sm hover:bg-accent"
                                >
                                    <Edit className="mx-auto h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {printers.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        Aucune imprimante configurée
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

