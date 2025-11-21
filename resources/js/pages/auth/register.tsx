import { login } from '@/routes';
import { store } from '@/routes/register';
import { Form, Head, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import * as React from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AuthLayout from '@/layouts/auth-layout';
import {
    Check,
    ChevronRight,
    User,
    Building2,
    UtensilsCrossed,
    Coffee,
    Hotel,
    Store,
    CreditCard,
    Smartphone,
    Wallet,
    ArrowRight,
    ArrowLeft,
} from 'lucide-react';
import {
    RestaurantIllustration,
    BarIllustration,
    CafeIllustration,
    HotelIllustration,
    FastFoodIllustration,
    RestaurantBarIllustration,
    AutreIllustration,
    CategoryIllustrations,
} from '@/components/illustrations/TypeIllustrations';

interface Plan {
    name: string;
    slug: string;
    description: string;
    montant_mensuel: number;
    limitations: Record<string, unknown>;
}

interface RegisterProps {
    plans: Record<string, Plan>;
    typesEtablissement: Record<string, string>;
    categories: Record<string, string>;
    modesPaiement: Record<string, string>;
}

const typeIcons: Record<string, React.ComponentType> = {
    restaurant: RestaurantIllustration,
    bar: BarIllustration,
    restaurant_bar: RestaurantBarIllustration,
    cafe: CafeIllustration,
    hotel: HotelIllustration,
    'fast-food': FastFoodIllustration,
    autre: AutreIllustration,
};

const typeColors: Record<string, string> = {
    restaurant: 'from-red-500 to-pink-500',
    bar: 'from-cyan-500 to-teal-500',
    restaurant_bar: 'from-red-500 via-pink-500 to-cyan-500',
    cafe: 'from-amber-700 to-orange-700',
    hotel: 'from-purple-500 to-pink-500',
    'fast-food': 'from-orange-500 to-yellow-500',
    autre: 'from-gray-500 to-slate-500',
};

// Mapping des catégories disponibles par type d'établissement
const categoriesByType: Record<string, string[]> = {
    restaurant: ['gastronomique', 'traditionnel', 'italien', 'asiatique', 'pizzeria', 'grill', 'autre'],
    bar: ['autre'], // Les bars ont généralement peu de catégories spécifiques
    restaurant_bar: ['gastronomique', 'traditionnel', 'italien', 'asiatique', 'pizzeria', 'grill', 'autre'],
    cafe: ['autre'],
    hotel: ['gastronomique', 'traditionnel', 'italien', 'asiatique', 'autre'],
    'fast-food': ['fast-food', 'autre'],
    autre: ['fast-food', 'gastronomique', 'traditionnel', 'italien', 'asiatique', 'pizzeria', 'grill', 'autre'],
};

const categoryColors: Record<string, string> = {
    'fast-food': 'from-orange-500 to-yellow-500',
    'gastronomique': 'from-red-500 to-pink-500',
    'traditionnel': 'from-amber-600 to-orange-600',
    'italien': 'from-green-600 to-red-600',
    'asiatique': 'from-orange-500 to-red-500',
    'pizzeria': 'from-yellow-400 to-orange-400',
    'grill': 'from-red-600 to-red-800',
    'autre': 'from-gray-500 to-slate-500',
};

const paymentIcons: Record<string, React.ReactNode> = {
    mobile_money: <Smartphone className="h-8 w-8" />,
    carte_bancaire: <CreditCard className="h-8 w-8" />,
    espece: <Wallet className="h-8 w-8" />,
    autre: <CreditCard className="h-8 w-8" />,
};

export default function Register({
    plans,
    typesEtablissement,
    categories,
    modesPaiement,
}: RegisterProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedPlan, setSelectedPlan] = useState<string>('');
    const [selectedType, setSelectedType] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedModePaiement, setSelectedModePaiement] = useState<string>('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [numeroTransaction, setNumeroTransaction] = useState<string>('');
    const [attemptedNext, setAttemptedNext] = useState<Record<number, boolean>>({});

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        restaurant_nom: '',
        restaurant_telephone: '',
        restaurant_type_etablissement: '',
        restaurant_categorie: '',
        plan: '',
        mode_paiement: '',
        numero_transaction: '',
    });

    // Déterminer l'étape à afficher en fonction des erreurs serveur
    useEffect(() => {
        if (errors && Object.keys(errors).length > 0) {
            // Marquer qu'on a tenté de soumettre pour afficher les erreurs
            // Si erreur sur step 1
            if (errors.name || errors.email || errors.password || errors.password_confirmation) {
                setCurrentStep(1);
                setAttemptedNext((prev) => ({ ...prev, 1: true }));
                return;
            }
            // Si erreur sur step 2
            if (errors.restaurant_nom || errors.restaurant_telephone) {
                setCurrentStep(2);
                setAttemptedNext((prev) => ({ ...prev, 2: true }));
                return;
            }
            // Si erreur sur step 3
            if (errors.restaurant_type_etablissement) {
                setCurrentStep(3);
                setAttemptedNext((prev) => ({ ...prev, 3: true }));
                return;
            }
            // Si erreur sur step 4
            if (errors.restaurant_categorie) {
                setCurrentStep(4);
                setAttemptedNext((prev) => ({ ...prev, 4: true }));
                return;
            }
            // Si erreur sur step 5
            if (errors.plan || errors.mode_paiement || errors.numero_transaction) {
                setCurrentStep(5);
                setAttemptedNext((prev) => ({ ...prev, 5: true }));
                return;
            }
        }
    }, [errors]);

    const totalSteps = 5;
    const selectedPlanData = selectedPlan ? plans[selectedPlan] : null;

    const handleNext = () => {
        // Marquer qu'on a tenté de passer à l'étape suivante
        setAttemptedNext((prev) => ({ ...prev, [currentStep]: true }));

        // Vérifier qu'il n'y a pas d'erreurs avant de passer à l'étape suivante
        if (!canProceed()) {
            return;
        }

        // Réinitialiser le flag pour l'étape suivante
        setAttemptedNext((prev) => ({ ...prev, [currentStep]: false }));

        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            // Réinitialiser le flag d'erreur pour l'étape précédente
            setAttemptedNext((prev) => ({ ...prev, [currentStep]: false }));
            setCurrentStep(currentStep - 1);
        }
    };

    const handlePlanSelect = (planSlug: string) => {
        setSelectedPlan(planSlug);
        setData('plan', planSlug);
        setShowPaymentModal(true);
    };

    const handlePaymentSelect = (mode: string) => {
        setSelectedModePaiement(mode);
        setData('mode_paiement', mode);
        setShowPaymentModal(false);
    };

    // Synchroniser les valeurs sélectionnées avec le formulaire
    useEffect(() => {
        if (selectedType) {
            setData('restaurant_type_etablissement', selectedType);
        }
    }, [selectedType]);

    useEffect(() => {
        if (selectedCategory) {
            setData('restaurant_categorie', selectedCategory);
        }
    }, [selectedCategory]);

    // Réinitialiser la catégorie si le type change et que la catégorie n'est plus disponible
    useEffect(() => {
        if (selectedType && selectedCategory) {
            const availableCategories = categoriesByType[selectedType] || categoriesByType.autre;
            if (!availableCategories.includes(selectedCategory)) {
                setSelectedCategory('');
                setData('restaurant_categorie', '');
            }
        }
    }, [selectedType, selectedCategory]);

    useEffect(() => {
        if (selectedPlan) {
            setData('plan', selectedPlan);
        }
    }, [selectedPlan]);

    useEffect(() => {
        if (selectedModePaiement) {
            setData('mode_paiement', selectedModePaiement);
        }
    }, [selectedModePaiement]);

    useEffect(() => {
        if (numeroTransaction) {
            setData('numero_transaction', numeroTransaction);
        }
    }, [numeroTransaction]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setData('plan', selectedPlan);
        setData('restaurant_type_etablissement', selectedType);
        setData('restaurant_categorie', selectedCategory);
        setData('mode_paiement', selectedModePaiement);
        if (numeroTransaction) {
            setData('numero_transaction', numeroTransaction);
        }
        post(store.url(), {
            onSuccess: () => {
                // Rediriger vers la page de paiement après inscription réussie
                window.location.href = '/payment';
            },
        });
    };

    const getStepErrors = (): string[] => {
        const stepErrors: string[] = [];

        switch (currentStep) {
            case 1:
                if (errors?.name) stepErrors.push('name');
                if (errors?.email) stepErrors.push('email');
                if (errors?.password) stepErrors.push('password');
                if (errors?.password_confirmation) stepErrors.push('password_confirmation');
                // Vérifier que les mots de passe correspondent
                if (data.password && data.password_confirmation && data.password !== data.password_confirmation) {
                    stepErrors.push('password_mismatch');
                }
                break;
            case 2:
                if (errors?.restaurant_nom) stepErrors.push('restaurant_nom');
                if (errors?.restaurant_telephone) stepErrors.push('restaurant_telephone');
                break;
            case 3:
                if (errors?.restaurant_type_etablissement) stepErrors.push('restaurant_type_etablissement');
                if (selectedType === '') stepErrors.push('type_required');
                break;
            case 4:
                if (errors?.restaurant_categorie) stepErrors.push('restaurant_categorie');
                break;
            case 5:
                if (errors?.plan) stepErrors.push('plan');
                if (errors?.mode_paiement) stepErrors.push('mode_paiement');
                if (errors?.numero_transaction) stepErrors.push('numero_transaction');
                if (selectedPlan === '') stepErrors.push('plan_required');
                if (selectedModePaiement === '') stepErrors.push('payment_required');
                break;
        }

        return stepErrors;
    };

    const canProceed = (): boolean => {
        const stepErrors = getStepErrors();

        // Vérifications de base pour chaque étape
        switch (currentStep) {
            case 1:
                if (stepErrors.length > 0) return false;
                if (!data.name || !data.email || !data.password || !data.password_confirmation) {
                    return false;
                }
                // Vérifier que les mots de passe correspondent
                if (data.password !== data.password_confirmation) {
                    return false;
                }
                return true;
            case 2:
                if (stepErrors.length > 0) return false;
                if (!data.restaurant_nom) return false;
                return true;
            case 3:
                if (stepErrors.length > 0) return false;
                if (selectedType === '') return false;
                return true;
            case 4:
                if (stepErrors.length > 0) return false;
                // Catégorie optionnelle, donc toujours true si pas d'erreur
                return true;
            case 5:
                if (stepErrors.length > 0) return false;
                if (selectedPlan === '' || selectedModePaiement === '') return false;
                return true;
            default:
                return false;
        }
    };

    const hasStepErrors = (): boolean => {
        return getStepErrors().length > 0;
    };

    return (
        <AuthLayout
            title="Créer votre restaurant"
            description="Créez votre compte et votre restaurant en quelques étapes"
        >
            <Head title="Inscription" />
            <div className="w-full max-w-3xl mx-auto px-4">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        {Array.from({ length: totalSteps }, (_, i) => i + 1).map(
                            (step) => (
                                <div
                                    key={step}
                                    className={`flex items-center ${step < totalSteps ? 'flex-1' : ''
                                        }`}
                                >
                                    <div
                                        className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${step <= currentStep
                                            ? 'bg-primary border-primary text-primary-foreground'
                                            : 'bg-background border-muted text-muted-foreground'
                                            }`}
                                    >
                                        {step < currentStep ? (
                                            <Check className="h-5 w-5" />
                                        ) : (
                                            step
                                        )}
                                    </div>
                                    {step < totalSteps && (
                                        <div
                                            className={`flex-1 h-1 mx-2 transition-colors ${step < currentStep
                                                ? 'bg-primary'
                                                : 'bg-muted'
                                                }`}
                                        />
                                    )}
                                </div>
                            )
                        )}
                    </div>
                    <div className="text-center text-sm text-muted-foreground">
                        Étape {currentStep} sur {totalSteps}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <>
                        {/* Step 1: Informations personnelles */}
                        {currentStep === 1 && (
                            <Card className="w-full max-w-sm mx-auto">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <User className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle>Informations personnelles</CardTitle>
                                            <CardDescription>
                                                Entrez vos informations pour créer votre compte
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Nom complet</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                required
                                                autoFocus
                                                name="name"
                                                value={data.name || ''}
                                                onChange={(e) =>
                                                    setData('name', e.target.value)
                                                }
                                                placeholder="Votre nom complet"
                                            />
                                            {attemptedNext[1] && <InputError message={errors?.name} />}
                                            {currentStep === 1 && attemptedNext[1] && errors?.name && (
                                                <p className="text-sm text-red-600 dark:text-red-400">
                                                    Veuillez corriger cette erreur avant de continuer
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Adresse email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                required
                                                name="email"
                                                value={data.email || ''}
                                                onChange={(e) =>
                                                    setData('email', e.target.value)
                                                }
                                                placeholder="email@example.com"
                                            />
                                            {attemptedNext[1] && <InputError message={errors?.email} />}
                                            {currentStep === 1 && attemptedNext[1] && errors?.email && (
                                                <p className="text-sm text-red-600 dark:text-red-400">
                                                    Veuillez corriger cette erreur avant de continuer
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="password">Mot de passe</Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                required
                                                name="password"
                                                value={data.password || ''}
                                                onChange={(e) =>
                                                    setData('password', e.target.value)
                                                }
                                                placeholder="Mot de passe"
                                            />
                                            {attemptedNext[1] && <InputError message={errors?.password} />}
                                            {currentStep === 1 && attemptedNext[1] && errors?.password && (
                                                <p className="text-sm text-red-600 dark:text-red-400">
                                                    Veuillez corriger cette erreur avant de continuer
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="password_confirmation">
                                                Confirmer le mot de passe
                                            </Label>
                                            <Input
                                                id="password_confirmation"
                                                type="password"
                                                required
                                                name="password_confirmation"
                                                value={data.password_confirmation || ''}
                                                onChange={(e) =>
                                                    setData('password_confirmation', e.target.value)
                                                }
                                                placeholder="Confirmer le mot de passe"
                                            />
                                            {attemptedNext[1] && <InputError message={errors?.password_confirmation} />}
                                            {currentStep === 1 && attemptedNext[1] && errors?.password_confirmation && (
                                                <p className="text-sm text-red-600 dark:text-red-400">
                                                    Veuillez corriger cette erreur avant de continuer
                                                </p>
                                            )}
                                            {currentStep === 1 && attemptedNext[1] && data.password && data.password_confirmation && data.password !== data.password_confirmation && (
                                                <div className="mt-2 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                                                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                                                        Les mots de passe ne correspondent pas. Veuillez les saisir à nouveau.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 2: Informations du restaurant */}
                        {currentStep === 2 && (
                            <Card className="w-full max-w-sm mx-auto">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <Building2 className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle>Informations de l'établissement</CardTitle>
                                            <CardDescription>
                                                Donnez un nom à votre établissement
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="restaurant_nom">
                                                Nom du restaurant
                                            </Label>
                                            <Input
                                                id="restaurant_nom"
                                                type="text"
                                                required
                                                name="restaurant_nom"
                                                value={data.restaurant_nom || ''}
                                                onChange={(e) =>
                                                    setData('restaurant_nom', e.target.value)
                                                }
                                                placeholder="Nom de votre restaurant"
                                            />
                                            {attemptedNext[2] && <InputError message={errors?.restaurant_nom} />}
                                            {currentStep === 2 && attemptedNext[2] && errors?.restaurant_nom && (
                                                <p className="text-sm text-red-600 dark:text-red-400">
                                                    Veuillez corriger cette erreur avant de continuer
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="restaurant_telephone">
                                                Téléphone du restaurant
                                            </Label>
                                            <Input
                                                id="restaurant_telephone"
                                                type="tel"
                                                name="restaurant_telephone"
                                                value={data.restaurant_telephone || ''}
                                                onChange={(e) =>
                                                    setData(
                                                        'restaurant_telephone',
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="+243 XXX XXX XXX"
                                            />
                                            {attemptedNext[2] && <InputError message={errors?.restaurant_telephone} />}
                                            {currentStep === 2 && attemptedNext[2] && errors?.restaurant_telephone && (
                                                <p className="text-sm text-red-600 dark:text-red-400">
                                                    Veuillez corriger cette erreur avant de continuer
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 3: Type d'établissement */}
                        {currentStep === 3 && (
                            <Card className="w-full mx-auto">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <UtensilsCrossed className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle>Type d'établissement</CardTitle>
                                            <CardDescription>
                                                Sélectionnez le type de votre établissement
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {Object.entries(typesEtablissement).map(
                                            ([value, label]) => {
                                                const IconComponent = typeIcons[value] || AutreIllustration;
                                                const colorClass = typeColors[value] || typeColors.autre;
                                                return (
                                                    <button
                                                        key={value}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedType(value);
                                                            setData('restaurant_type_etablissement', value);
                                                        }}
                                                        className={`relative p-6 rounded-xl border-2 transition-all text-left hover:shadow-lg hover:scale-105 bg-card ${selectedType === value
                                                            ? `shadow-lg scale-105 border-2`
                                                            : 'border-border hover:border-primary/50'
                                                            }`}
                                                        style={selectedType === value ? {
                                                            borderColor: `var(--color-primary)`,
                                                            borderWidth: '3px'
                                                        } : {}}
                                                    >
                                                        <div className="flex flex-col items-center gap-4">
                                                            <div
                                                                className={`w-24 h-24 rounded-2xl p-4 flex items-center justify-center transition-all bg-muted ${selectedType === value
                                                                    ? 'shadow-lg ring-2 ring-primary ring-offset-2'
                                                                    : ''
                                                                    }`}
                                                            >
                                                                <IconComponent />
                                                            </div>
                                                            <div className="text-center">
                                                                <div className="font-semibold text-lg">
                                                                    {label}
                                                                </div>
                                                            </div>
                                                            {selectedType === value && (
                                                                <div className="absolute top-3 right-3">
                                                                    <div className="rounded-full bg-primary p-1.5 shadow-md">
                                                                        <Check className="h-4 w-4 text-primary-foreground" />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </button>
                                                );
                                            }
                                        )}
                                    </div>
                                    {attemptedNext[3] && (
                                        <InputError
                                            message={errors?.restaurant_type_etablissement}
                                            className="mt-4"
                                        />
                                    )}
                                    {currentStep === 3 && attemptedNext[3] && selectedType === '' && (
                                        <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                                            <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                                                Veuillez sélectionner un type d'établissement avant de continuer
                                            </p>
                                        </div>
                                    )}
                                    {currentStep === 3 && attemptedNext[3] && errors?.restaurant_type_etablissement && (
                                        <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                {errors.restaurant_type_etablissement}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 4: Catégorie */}
                        {currentStep === 4 && (
                            <Card className="w-full mx-auto">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <Store className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle>Catégorie (optionnel)</CardTitle>
                                            <CardDescription>
                                                Choisissez la catégorie de votre établissement
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {!selectedType && (
                                        <div className="mb-4 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
                                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                                Veuillez d'abord sélectionner un type d'établissement à l'étape précédente.
                                            </p>
                                        </div>
                                    )}
                                    {selectedType && (
                                        <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                                            <p className="text-sm text-primary font-medium">
                                                Catégories disponibles pour : <span className="capitalize">{typesEtablissement[selectedType]}</span>
                                            </p>
                                        </div>
                                    )}
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {(() => {
                                            // Filtrer les catégories selon le type sélectionné
                                            const availableCategories = selectedType
                                                ? (categoriesByType[selectedType] || categoriesByType.autre)
                                                : [];

                                            return Object.entries(categories)
                                                .filter(([value]) => !selectedType || availableCategories.includes(value))
                                                .map(([value, label]) => {
                                                    const IconComponent = (CategoryIllustrations as Record<string, React.ComponentType>)[value] || AutreIllustration;
                                                    const colorClass = categoryColors[value] || categoryColors.autre;
                                                    return (
                                                        <button
                                                            key={value}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedCategory(value);
                                                                setData('restaurant_categorie', value);
                                                            }}
                                                            className={`relative p-6 rounded-xl border-2 transition-all text-left hover:shadow-lg hover:scale-105 bg-card ${selectedCategory === value
                                                                ? `shadow-lg scale-105 border-2`
                                                                : 'border-border hover:border-primary/50'
                                                                }`}
                                                            style={selectedCategory === value ? {
                                                                borderColor: `var(--color-primary)`,
                                                                borderWidth: '3px'
                                                            } : {}}
                                                        >
                                                            <div className="flex flex-col items-center gap-4">
                                                                <div
                                                                    className={`w-24 h-24 rounded-2xl p-4 flex items-center justify-center transition-all bg-muted ${selectedCategory === value
                                                                        ? 'shadow-lg ring-2 ring-primary ring-offset-2'
                                                                        : ''
                                                                        }`}
                                                                >
                                                                    <IconComponent />
                                                                </div>
                                                                <div className="text-center">
                                                                    <div className="font-semibold text-lg">
                                                                        {label}
                                                                    </div>
                                                                </div>
                                                                {selectedCategory === value && (
                                                                    <div className="absolute top-3 right-3">
                                                                        <div className="rounded-full bg-primary p-1.5 shadow-md">
                                                                            <Check className="h-4 w-4 text-primary-foreground" />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </button>
                                                    );
                                                });
                                        })()}
                                    </div>
                                    {selectedType && Object.entries(categories).filter(([value]) => {
                                        const availableCategories = categoriesByType[selectedType] || categoriesByType.autre;
                                        return !availableCategories.includes(value);
                                    }).length > 0 && (
                                            <div className="mt-4 p-3 rounded-lg bg-muted border border-border">
                                                <p className="text-xs text-muted-foreground">
                                                    Certaines catégories ne sont pas disponibles pour ce type d'établissement.
                                                </p>
                                            </div>
                                        )}
                                    {attemptedNext[4] && (
                                        <InputError
                                            message={errors?.restaurant_categorie}
                                            className="mt-4"
                                        />
                                    )}
                                    {currentStep === 4 && attemptedNext[4] && errors?.restaurant_categorie && (
                                        <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                {errors.restaurant_categorie}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 5: Plan d'abonnement */}
                        {currentStep === 5 && (
                            <Card className="w-full mx-auto">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <CreditCard className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle>Choisissez votre plan</CardTitle>
                                            <CardDescription>
                                                Sélectionnez le plan qui correspond à vos besoins
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-6 md:grid-cols-3">
                                        {Object.entries(plans).map(([slug, plan], index) => {
                                            const planColors = [
                                                'from-blue-500 to-cyan-500',
                                                'from-purple-500 to-pink-500',
                                                'from-orange-500 to-red-500',
                                            ];
                                            const planColor = planColors[index] || planColors[0];
                                            const isSelected = selectedPlan === slug;

                                            return (
                                                <div
                                                    key={slug}
                                                    className={`relative rounded-xl border-2 p-6 transition-all hover:shadow-xl bg-card ${isSelected
                                                        ? `shadow-xl scale-105 border-2`
                                                        : 'border-border hover:border-primary/50'
                                                        }`}
                                                    style={isSelected ? {
                                                        borderColor: `var(--color-primary)`,
                                                        borderWidth: '3px'
                                                    } : {}}
                                                >
                                                    {isSelected && (
                                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-lg">
                                                            Sélectionné
                                                        </div>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => handlePlanSelect(slug)}
                                                        className="w-full text-left"
                                                    >
                                                        <div className="mb-4 p-3 rounded-lg bg-muted">
                                                            <h3 className="text-xl font-bold capitalize">
                                                                {plan.name}
                                                            </h3>
                                                            <p className="text-sm mt-1 text-muted-foreground">
                                                                {plan.description}
                                                            </p>
                                                        </div>
                                                        <div className="mb-4">
                                                            <div className="flex items-baseline gap-1">
                                                                <span className="text-3xl font-bold">
                                                                    ${plan.montant_mensuel.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                </span>
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                /mois
                                                            </div>
                                                        </div>
                                                        <ul className="space-y-2.5 text-sm mb-4">
                                                            <li className="flex items-center gap-2">
                                                                <div className="p-1 rounded-full bg-primary/10 text-primary">
                                                                    <Check className="h-3 w-3" />
                                                                </div>
                                                                <span>
                                                                    Utilisateurs:{' '}
                                                                    {(plan.limitations.max_users as number | null) === null
                                                                        ? 'Illimité'
                                                                        : String(plan.limitations.max_users)}
                                                                </span>
                                                            </li>
                                                            <li className="flex items-center gap-2">
                                                                <div className="p-1 rounded-full bg-primary/10 text-primary">
                                                                    <Check className="h-3 w-3" />
                                                                </div>
                                                                <span>
                                                                    Produits:{' '}
                                                                    {(plan.limitations.max_produits as number | null) === null
                                                                        ? 'Illimité'
                                                                        : String(plan.limitations.max_produits)}
                                                                </span>
                                                            </li>
                                                            <li className="flex items-center gap-2">
                                                                <div className="p-1 rounded-full bg-primary/10 text-primary">
                                                                    <Check className="h-3 w-3" />
                                                                </div>
                                                                <span>
                                                                    Ventes/mois:{' '}
                                                                    {(plan.limitations.max_ventes_mois as number | null) === null
                                                                        ? 'Illimité'
                                                                        : String(plan.limitations.max_ventes_mois)}
                                                                </span>
                                                            </li>
                                                            <li className="flex items-center gap-2">
                                                                {plan.limitations.rapports === true ? (
                                                                    <div className="p-1 rounded-full bg-primary/10 text-primary">
                                                                        <Check className="h-3 w-3" />
                                                                    </div>
                                                                ) : (
                                                                    <span className="h-5 w-5" />
                                                                )}
                                                                <span>Rapports</span>
                                                            </li>
                                                            <li className="flex items-center gap-2">
                                                                {plan.limitations.personnalisation === true ? (
                                                                    <div className="p-1 rounded-full bg-primary/10 text-primary">
                                                                        <Check className="h-3 w-3" />
                                                                    </div>
                                                                ) : (
                                                                    <span className="h-5 w-5" />
                                                                )}
                                                                <span>Personnalisation</span>
                                                            </li>
                                                        </ul>
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {attemptedNext[5] && <InputError message={errors?.plan} className="mt-4" />}
                                    {currentStep === 5 && attemptedNext[5] && selectedPlan === '' && (
                                        <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                                            <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                                                Veuillez sélectionner un plan d'abonnement avant de continuer
                                            </p>
                                        </div>
                                    )}
                                    {currentStep === 5 && attemptedNext[5] && selectedModePaiement === '' && (
                                        <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                                            <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                                                Veuillez sélectionner un mode de paiement avant de continuer
                                            </p>
                                        </div>
                                    )}
                                    {currentStep === 5 && attemptedNext[5] && errors?.mode_paiement && (
                                        <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                {errors.mode_paiement}
                                            </p>
                                        </div>
                                    )}
                                    {currentStep === 5 && attemptedNext[5] && errors?.numero_transaction && (
                                        <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                {errors.numero_transaction}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Hidden fields for form submission */}
                        <input
                            type="hidden"
                            name="plan"
                            value={selectedPlan}
                        />
                        <input
                            type="hidden"
                            name="restaurant_type_etablissement"
                            value={selectedType}
                        />
                        <input
                            type="hidden"
                            name="restaurant_categorie"
                            value={selectedCategory}
                        />
                        <input
                            type="hidden"
                            name="mode_paiement"
                            value={selectedModePaiement}
                        />
                        {(selectedModePaiement === 'mobile_money' ||
                            selectedModePaiement === 'carte_bancaire') && (
                                <input
                                    type="hidden"
                                    name="numero_transaction"
                                    value={numeroTransaction}
                                />
                            )}

                        {/* Navigation Buttons */}
                        <div className="w-full max-w-sm mx-auto">
                            <div className="flex items-center justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handlePrevious}
                                    disabled={currentStep === 1}
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Précédent
                                </Button>

                                {currentStep < totalSteps ? (
                                    <Button
                                        type="button"
                                        onClick={handleNext}
                                        disabled={!canProceed()}
                                        className={!canProceed() ? 'opacity-50 cursor-not-allowed' : ''}
                                    >
                                        Suivant
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        disabled={!canProceed() || processing}
                                        className={(!canProceed() || processing) ? 'opacity-50 cursor-not-allowed' : ''}
                                    >
                                        {processing && <Spinner />}
                                        Créer mon restaurant
                                    </Button>
                                )}
                                {!canProceed() && attemptedNext[currentStep] && hasStepErrors() && (
                                    <p className="text-xs text-red-600 dark:text-red-400 mt-2 text-center">
                                        Veuillez corriger les erreurs ci-dessus avant de continuer
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Vous avez déjà un compte ?{' '}
                            <TextLink href={login()}>Se connecter</TextLink>
                        </div>
                    </>
                </form>
            </div>

            {/* Payment Modal */}
            <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Choisissez votre mode de paiement</DialogTitle>
                        <DialogDescription>
                            Sélectionnez comment vous souhaitez payer pour votre abonnement{' '}
                            {selectedPlanData?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {Object.entries(modesPaiement)
                            .filter(([value]) => value !== 'mobile_money') // Filtrer mobile_money temporairement
                            .map(([value, label]) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => handlePaymentSelect(value)}
                                    className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all hover:shadow-md ${selectedModePaiement === value
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border hover:border-primary/50'
                                        }`}
                                >
                                    <div
                                        className={`p-3 rounded-lg ${selectedModePaiement === value
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted'
                                            }`}
                                    >
                                        {paymentIcons[value] || paymentIcons.autre}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="font-semibold">{label}</div>
                                    </div>
                                    {selectedModePaiement === value && (
                                        <Check className="h-5 w-5 text-primary" />
                                    )}
                                </button>
                            ))}
                    </div>
                    {(selectedModePaiement === 'mobile_money' ||
                        selectedModePaiement === 'carte_bancaire') && (
                            <div className="pt-4 border-t">
                                <Label htmlFor="numero_transaction">
                                    Numéro de transaction
                                </Label>
                                <Input
                                    id="numero_transaction"
                                    type="text"
                                    name="numero_transaction"
                                    value={numeroTransaction}
                                    onChange={(e) => setNumeroTransaction(e.target.value)}
                                    placeholder="Entrez le numéro de transaction"
                                    className="mt-2"
                                />
                            </div>
                        )}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowPaymentModal(false)}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="button"
                            onClick={() => {
                                if (selectedModePaiement) {
                                    setShowPaymentModal(false);
                                }
                            }}
                            disabled={!selectedModePaiement}
                        >
                            Confirmer
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AuthLayout>
    );
}
