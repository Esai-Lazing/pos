import AppLayout from '@/layouts/app-layout';
import * as userRoutes from '@/routes/user';
import { type BreadcrumbItem } from '@/types';
import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, UserPlus, Shield, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Utilisateurs',
        href: userRoutes.index().url,
    },
    {
        title: 'Créer un utilisateur',
        href: userRoutes.create().url,
    },
];

const roleLabels: Record<string, string> = {
    admin: 'Gérant (Administrateur)',
    caisse: 'Caisse',
    stock: 'Stock',
};

const roleDescriptions: Record<string, string> = {
    admin: 'Peut gérer tous les comptes (caisse, stock) et accéder à toutes les fonctionnalités',
    caisse: 'Peut effectuer des ventes et consulter l\'historique des ventes',
    stock: 'Peut gérer le stock et consulter les mouvements de stock',
};

const roleColors: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    caisse: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    stock: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

export default function UserCreate() {
    const [selectedRole, setSelectedRole] = useState<'admin' | 'caisse' | 'stock'>('caisse');
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Créer un utilisateur" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center gap-4">
                    <Link
                        href={userRoutes.index().url}
                        className="rounded-lg p-2 hover:bg-muted"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <UserPlus className="h-8 w-8 text-primary" />
                        <div>
                            <h1 className="text-2xl font-bold">Créer un utilisateur</h1>
                            <p className="text-muted-foreground">
                                Ajouter un nouveau compte caisse, stock ou gérant
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-border bg-card p-6">
                    <Form
                        action={userRoutes.store().url}
                        method="post"
                        className="space-y-6"
                    >
                        {({ errors, processing }) => (
                            <>
                                <div>
                                    <label htmlFor="name" className="mb-2 block text-sm font-medium">
                                        Nom complet *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        required
                                        className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                                            errors.name ? 'border-red-500' : 'border-input bg-background'
                                        }`}
                                        placeholder="Ex: Jean Dupont"
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="email" className="mb-2 block text-sm font-medium">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        required
                                        className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                                            errors.email ? 'border-red-500' : 'border-input bg-background'
                                        }`}
                                        placeholder="Ex: jean.dupont@example.com"
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                                    )}
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Cet email sera utilisé pour la connexion
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="password" className="mb-2 block text-sm font-medium">
                                        Mot de passe *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            id="password"
                                            name="password"
                                            required
                                            minLength={8}
                                            className={`w-full rounded-lg border px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary ${
                                                errors.password ? 'border-red-500' : 'border-input bg-background'
                                            }`}
                                            placeholder="Minimum 8 caractères"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                                    )}
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Le mot de passe doit contenir au moins 8 caractères
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="password_confirmation" className="mb-2 block text-sm font-medium">
                                        Confirmer le mot de passe *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswordConfirmation ? 'text' : 'password'}
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            required
                                            minLength={8}
                                            className={`w-full rounded-lg border px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary ${
                                                errors.password_confirmation ? 'border-red-500' : 'border-input bg-background'
                                            }`}
                                            placeholder="Répétez le mot de passe"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showPasswordConfirmation ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password_confirmation && (
                                        <p className="mt-1 text-sm text-red-500">{errors.password_confirmation}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-3 block text-sm font-medium">
                                        Rôle *
                                    </label>
                                    <div className="grid gap-3 md:grid-cols-3">
                                        {(['admin', 'caisse', 'stock'] as const).map((role) => (
                                            <label
                                                key={role}
                                                className={`cursor-pointer rounded-lg border-2 p-4 text-left transition-all ${
                                                    selectedRole === role
                                                        ? 'border-primary bg-primary/10'
                                                        : 'border-border bg-background hover:border-primary/50'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="role"
                                                    value={role}
                                                    checked={selectedRole === role}
                                                    onChange={(e) => {
                                                        setSelectedRole(e.target.value as 'admin' | 'caisse' | 'stock');
                                                    }}
                                                    className="sr-only"
                                                    required
                                                />
                                                <div className="mb-2 flex items-center gap-2">
                                                    <Shield className={`h-5 w-5 ${
                                                        selectedRole === role
                                                            ? 'text-primary'
                                                            : 'text-muted-foreground'
                                                    }`} />
                                                    <span
                                                        className={`font-semibold ${
                                                            selectedRole === role
                                                                ? 'text-primary'
                                                                : 'text-foreground'
                                                        }`}
                                                    >
                                                        {roleLabels[role]}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {roleDescriptions[role]}
                                                </p>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.role && (
                                        <p className="mt-1 text-sm text-red-500">{errors.role}</p>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        name="is_active"
                                        defaultChecked
                                        className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-primary"
                                    />
                                    <label htmlFor="is_active" className="text-sm font-medium">
                                        Compte actif (l'utilisateur pourra se connecter immédiatement)
                                    </label>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {processing ? 'Création...' : "Créer l'utilisateur"}
                                    </button>
                                    <Link
                                        href={userRoutes.index().url}
                                        className="rounded-lg border border-border bg-background px-4 py-2 hover:bg-muted"
                                    >
                                        Annuler
                                    </Link>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </div>
        </AppLayout>
    );
}

