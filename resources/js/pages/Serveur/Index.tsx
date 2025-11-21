import AppLayout from '@/layouts/app-layout';
import { Link, router } from '@inertiajs/react';
import { Plus, Trash2, User, AlertTriangle } from 'lucide-react';
import * as serveurRoutes from '@/routes/serveur';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface Serveur {
    id: number;
    name: string;
    pin_code: string;
    is_active: boolean;
    created_at: string;
}

interface Props {
    serveurs: {
        data: Serveur[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    serveurStats?: {
        total_serveurs: number;
        max_serveurs: number | null;
    };
}

export default function ServeurIndex({ serveurs, serveurStats }: Props) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [serveurToDelete, setServeurToDelete] = useState<{ id: number; name: string } | null>(null);

    const handleDeleteClick = (serveur: Serveur) => {
        setServeurToDelete({ id: serveur.id, name: serveur.name });
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (serveurToDelete) {
            router.delete(serveurRoutes.destroy({ serveur: serveurToDelete.id }).url, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setServeurToDelete(null);
                },
            });
        }
    };

    return (
        <AppLayout>
            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Gestion des Serveurs</h1>
                        <p className="text-muted-foreground">Gérez les comptes serveurs pour votre restaurant</p>
                        {serveurStats && (
                            <div className="mt-1 text-sm text-muted-foreground">
                                Serveurs: {serveurStats.total_serveurs}
                                {serveurStats.max_serveurs !== null && ` / ${serveurStats.max_serveurs}`}
                            </div>
                        )}
                    </div>
                    <Link
                        href={serveurRoutes.create().url}
                        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                    >
                        <Plus className="h-4 w-4" />
                        Nouveau Serveur
                    </Link>
                </div>

                <div className="rounded-lg border border-border bg-card">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Nom</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Code PIN</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Statut</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Date de création</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {serveurs.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                            <User className="mx-auto mb-2 h-12 w-12 opacity-50" />
                                            <p>Aucun serveur trouvé</p>
                                        </td>
                                    </tr>
                                ) : (
                                    serveurs.data.map((serveur) => (
                                        <tr key={serveur.id} className="border-b border-border hover:bg-muted/50">
                                            <td className="px-4 py-3 font-semibold">{serveur.name}</td>
                                            <td className="px-4 py-3">
                                                <span className="font-mono text-lg font-bold">{serveur.pin_code}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`rounded-full px-2 py-1 text-xs font-semibold ${serveur.is_active
                                                        ? 'bg-green-500/10 text-green-500'
                                                        : 'bg-red-500/10 text-red-500'
                                                        }`}
                                                >
                                                    {serveur.is_active ? 'Actif' : 'Inactif'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-muted-foreground">
                                                {new Date(serveur.created_at).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => handleDeleteClick(serveur)}
                                                    className="rounded-lg p-2 text-destructive hover:bg-muted"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Dialog de confirmation de suppression */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <DialogTitle className="text-xl">Supprimer le serveur</DialogTitle>
                        </div>
                        <DialogDescription className="pt-2 text-base">
                            Êtes-vous sûr de vouloir supprimer le serveur <strong>{serveurToDelete?.name}</strong> ?
                            Cette action est irréversible et le serveur ne pourra plus se connecter.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="flex-col gap-2 sm:flex-row">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setDeleteDialogOpen(false);
                                setServeurToDelete(null);
                            }}
                            className="w-full sm:w-auto"
                        >
                            Annuler
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteConfirm}
                            className="w-full sm:w-auto"
                        >
                            Supprimer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

