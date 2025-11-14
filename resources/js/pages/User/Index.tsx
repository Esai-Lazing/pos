import AppLayout from '@/layouts/app-layout';
import * as userRoutes from '@/routes/user';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Search, Users as UsersIcon, Shield, UserCheck, UserX, UserPlus } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'caisse' | 'stock' | 'serveur';
    is_active: boolean;
    created_at: string;
    ventes_count?: number;
    stock_movements_count?: number;
}

interface Props {
    users: {
        data: User[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    filters: {
        search?: string;
        role?: string;
        is_active?: boolean;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Utilisateurs',
        href: userRoutes.index().url,
    },
];

const roleLabels: Record<string, string> = {
    admin: 'Administrateur',
    caisse: 'Caisse',
    stock: 'Stock',
    serveur: 'Serveur',
};

const roleColors: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    caisse: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    stock: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    serveur: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
};

export default function UserIndex({ users, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(userRoutes.index().url, { search }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion des Utilisateurs" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <UsersIcon className="h-8 w-8 text-primary" />
                        <h1 className="text-2xl font-bold">Gestion des Utilisateurs</h1>
                    </div>
                    <Link
                        href={userRoutes.create().url}
                        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground hover:bg-primary/90"
                    >
                        <UserPlus className="h-4 w-4" />
                        Créer un utilisateur
                    </Link>
                </div>

                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Rechercher un utilisateur..."
                            className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2"
                        />
                    </div>
                </form>

                <div className="rounded-lg border border-border bg-card">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Nom</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Rôle</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Statut</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Ventes</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Mouvements</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="border-b border-border hover:bg-accent/50 transition-colors"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{user.name}</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">
                                            {user.email}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${roleColors[user.role] || ''}`}
                                            >
                                                <Shield className="h-3 w-3" />
                                                {roleLabels[user.role] || user.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {user.is_active ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                                                    <UserCheck className="h-3 w-3" />
                                                    Actif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                                                    <UserX className="h-3 w-3" />
                                                    Inactif
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">
                                            {user.ventes_count || 0}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">
                                            {user.stock_movements_count || 0}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link
                                                href={userRoutes.show({ user: user.id }).url}
                                                className="text-sm text-primary hover:underline"
                                            >
                                                Voir détails
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {users.data.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">
                            <UsersIcon className="mx-auto mb-4 h-12 w-12 opacity-50" />
                            <p>Aucun utilisateur trouvé</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {users.last_page > 1 && (
                        <div className="border-t border-border p-4">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Page {users.current_page} sur {users.last_page}
                                </div>
                                <div className="flex gap-2">
                                    {users.links.map((link, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                if (link.url) {
                                                    router.get(link.url);
                                                }
                                            }}
                                            disabled={!link.url || link.active}
                                            className={`rounded-lg px-3 py-1 text-sm ${
                                                link.active
                                                    ? 'bg-primary text-primary-foreground'
                                                    : link.url
                                                      ? 'bg-muted text-muted-foreground hover:bg-accent'
                                                      : 'bg-muted/50 text-muted-foreground/50 cursor-not-allowed'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}


