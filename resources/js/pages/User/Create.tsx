import AppLayout from '@/layouts/app-layout';
import * as userRoutes from '@/routes/user';
import * as subscriptionRoutes from '@/routes/subscription';
import { type BreadcrumbItem } from '@/types';
import { Form, Head, Link, usePage, router } from '@inertiajs/react';
import { ArrowLeft, UserPlus, Shield, Eye, EyeOff, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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

const getPlanName = (plan: string | null) => {
    if (!plan) {
        return 'N/A';
    }
    const plans: Record<string, string> = {
        simple: 'Starter',
        medium: 'Business',
        premium: 'Pro',
    };
    return plans[plan] || plan;
};

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
    const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

    const page = usePage();
    const props = page.props as {
        flash?: Record<string, unknown>;
        errors?: Record<string, unknown>;
        limit_reached?: boolean;
        limit_message?: string;
        current_plan?: string;
        current_users?: number;
        max_users?: number;
    };

    const flash = props.flash;
    const errors = props.errors;

    // Récupérer les données depuis les props de la page (passées directement par Inertia)
    // ou depuis flash (au cas où)
    const limitReached = props.limit_reached ?? (flash?.limit_reached === true || flash?.limit_reached === '1' || flash?.limit_reached === 1);
    const limitMessage = props.limit_message ?? (flash?.limit_message ? String(flash.limit_message) : '');
    const currentPlan = props.current_plan ?? (flash?.current_plan ? String(flash.current_plan) : '');
    const currentUsers = props.current_users ?? (flash?.current_users ? Number(flash.current_users) : 0);
    const maxUsers = props.max_users ?? (flash?.max_users ? Number(flash.max_users) : 0);


    useEffect(() => {
        // Vérifier si l'erreur de limite atteinte est présente
        if (limitReached) {
            console.log('Limit reached detected, opening dialog');
            setShowUpgradeDialog(true);
        }
    }, [limitReached]);

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
                                Ajouter un nouveau compte utilisateur (gérant, caisse ou stock)
                            </p>
                        </div>
                    </div>
                </div>

                <div className="max-w-full mx-auto">
                    <div className="rounded-lg border border-border bg-card p-6">
                        <Form
                            action={userRoutes.store().url}
                            method="post"
                            className="space-y-6"
                            onError={(formErrors) => {
                                // Si l'erreur de limite est présente, ouvrir le dialog
                                console.log('Form onError called with:', formErrors);
                                if (formErrors.limit_reached) {
                                    console.log('Limit reached in form errors, opening dialog');
                                    setShowUpgradeDialog(true);
                                }
                            }}
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
                                            className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${errors.name ? 'border-red-500' : 'border-input bg-background'
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
                                            className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${errors.email ? 'border-red-500' : 'border-input bg-background'
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
                                                className={`w-full rounded-lg border px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary ${errors.password ? 'border-red-500' : 'border-input bg-background'
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
                                                className={`w-full rounded-lg border px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary ${errors.password_confirmation ? 'border-red-500' : 'border-input bg-background'
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
                                                    className={`cursor-pointer rounded-lg border-2 p-4 text-left transition-all ${selectedRole === role
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
                                                        <Shield className={`h-5 w-5 ${selectedRole === role
                                                            ? 'text-primary'
                                                            : 'text-muted-foreground'
                                                            }`} />
                                                        <span
                                                            className={`font-semibold ${selectedRole === role
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
            </div>

            {/* Dialog pour l'upgrade d'abonnement */}
            <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <DialogTitle className="text-xl">Limite d'utilisateurs atteinte</DialogTitle>
                        </div>
                        <DialogDescription className="pt-2 text-base">
                            {limitMessage || `Vous avez atteint la limite d'utilisateurs de votre plan actuel (${currentUsers}/${maxUsers}).`}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/20">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                        Plan actuel :
                                    </span>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        {getPlanName(currentPlan)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                        Utilisateurs :
                                    </span>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        {currentUsers} / {maxUsers}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            Pour créer plus d'utilisateurs, vous devez upgrader votre abonnement vers un plan supérieur qui offre plus de flexibilité.
                        </p>
                    </div>

                    <DialogFooter className="flex-col gap-2 sm:flex-row">
                        <Button
                            variant="outline"
                            onClick={() => setShowUpgradeDialog(false)}
                            className="w-full sm:w-auto"
                        >
                            Fermer
                        </Button>
                        <Button
                            asChild
                            className="w-full sm:w-auto"
                        >
                            <Link href={subscriptionRoutes.index().url} className="flex items-center gap-2">
                                Voir les plans disponibles
                                <ArrowUpRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

