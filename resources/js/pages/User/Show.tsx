import AppLayout from '@/layouts/app-layout';
import * as userRoutes from '@/routes/user';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, Form, router, usePage } from '@inertiajs/react';
import { Edit, Shield, UserCheck, UserX, Lock, ShoppingCart, Package } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type SharedData } from '@/types';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'caisse' | 'stock';
    is_active: boolean;
    created_at: string;
    ventes_count?: number;
    stock_movements_count?: number;
}

interface Props {
    user: User;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Utilisateurs',
        href: userRoutes.index().url,
    },
    {
        title: 'Détails',
        href: '#',
    },
];

const roleLabels: Record<string, string> = {
    admin: 'Administrateur',
    caisse: 'Caisse',
    stock: 'Stock',
};

const roleColors: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    caisse: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    stock: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

export default function UserShow({ user }: Props) {
    const { auth } = usePage<SharedData>().props;
    const isAdmin = auth.user?.role === 'admin';
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${user.name} - Détails`} />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{user.name}</h1>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    {isAdmin && (
                        <Link
                            href={userRoutes.edit({ user: user.id }).url}
                            className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 hover:bg-accent"
                        >
                            <Edit className="h-4 w-4" />
                            Modifier
                        </Link>
                    )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {/* Informations générales */}
                    <div className="rounded-lg border border-border bg-card p-6">
                        <h2 className="mb-4 font-semibold">Informations générales</h2>
                        <div className="space-y-3">
                            <div>
                                <Label className="text-sm text-muted-foreground">Nom</Label>
                                <p className="font-medium">{user.name}</p>
                            </div>
                            <div>
                                <Label className="text-sm text-muted-foreground">Email</Label>
                                <p className="font-medium">{user.email}</p>
                            </div>
                            <div>
                                <Label className="text-sm text-muted-foreground">Rôle</Label>
                                <div className="mt-1">
                                    <span
                                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${roleColors[user.role] || ''}`}
                                    >
                                        <Shield className="h-4 w-4" />
                                        {roleLabels[user.role] || user.role}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm text-muted-foreground">Statut</Label>
                                <div className="mt-1">
                                    {user.is_active ? (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                                            <UserCheck className="h-4 w-4" />
                                            Actif
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                                            <UserX className="h-4 w-4" />
                                            Inactif
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm text-muted-foreground">Date de création</Label>
                                <p className="font-medium">
                                    {new Date(user.created_at).toLocaleDateString('fr-CD', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Statistiques */}
                    <div className="rounded-lg border border-border bg-card p-6">
                        <h2 className="mb-4 font-semibold">Statistiques</h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                                <ShoppingCart className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Ventes effectuées</p>
                                    <p className="text-xl font-bold">{user.ventes_count || 0}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                                <Package className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Mouvements de stock</p>
                                    <p className="text-xl font-bold">{user.stock_movements_count || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modification du mot de passe (Admin uniquement) */}
                {isAdmin && (
                    <div className="rounded-lg border border-border bg-card p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Lock className="h-5 w-5 text-primary" />
                                <h2 className="font-semibold">Modifier le mot de passe</h2>
                            </div>
                            {!showPasswordForm && (
                                <Button
                                    variant="outline"
                                    onClick={() => setShowPasswordForm(true)}
                                >
                                    Modifier le mot de passe
                                </Button>
                            )}
                        </div>

                        {showPasswordForm && (
                            <Form
                                method="put"
                                action={userRoutes.updatePassword({ user: user.id }).url}
                                className="space-y-4"
                                onSuccess={() => {
                                    setShowPasswordForm(false);
                                    setPassword('');
                                    setPasswordConfirmation('');
                                }}
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="password">Nouveau mot de passe</Label>
                                            <Input
                                                id="password"
                                                name="password"
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                autoComplete="new-password"
                                                placeholder="Nouveau mot de passe"
                                            />
                                            <InputError message={errors.password} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="password_confirmation">
                                                Confirmer le mot de passe
                                            </Label>
                                            <Input
                                                id="password_confirmation"
                                                name="password_confirmation"
                                                type="password"
                                                value={passwordConfirmation}
                                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                                required
                                                autoComplete="new-password"
                                                placeholder="Confirmer le mot de passe"
                                            />
                                            <InputError message={errors.password_confirmation} />
                                        </div>

                                        <div className="flex gap-2">
                                            <Button type="submit" disabled={processing}>
                                                {processing ? 'Enregistrement...' : 'Enregistrer le mot de passe'}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setShowPasswordForm(false);
                                                    setPassword('');
                                                    setPasswordConfirmation('');
                                                }}
                                            >
                                                Annuler
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </Form>
                        )}

                        {!showPasswordForm && (
                            <p className="text-sm text-muted-foreground">
                                Seul l'administrateur peut modifier le mot de passe des autres utilisateurs.
                            </p>
                        )}
                    </div>
                )}

                {/* Message pour les non-admins */}
                {!isAdmin && (
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            <strong>Note :</strong> Vous pouvez consulter les informations de cet utilisateur,
                            mais seul l'administrateur peut modifier les mots de passe.
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

