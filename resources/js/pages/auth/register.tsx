import { login } from '@/routes';
import { store } from '@/routes/register';
import { Form, Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

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
    cafe: CafeIllustration,
    hotel: HotelIllustration,
    'fast-food': FastFoodIllustration,
    autre: AutreIllustration,
};

const typeColors: Record<string, string> = {
    restaurant: 'from-red-500 to-pink-500',
    bar: 'from-cyan-500 to-teal-500',
    cafe: 'from-amber-700 to-orange-700',
    hotel: 'from-purple-500 to-pink-500',
    'fast-food': 'from-orange-500 to-yellow-500',
    autre: 'from-gray-500 to-slate-500',
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

    const totalSteps = 5;
    const selectedPlanData = selectedPlan ? plans[selectedPlan] : null;

    const handleNext = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setData('plan', selectedPlan);
        setData('restaurant_type_etablissement', selectedType);
        setData('restaurant_categorie', selectedCategory);
        setData('mode_paiement', selectedModePaiement);
        if (numeroTransaction) {
            setData('numero_transaction', numeroTransaction);
        }
        post(store.url());
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return true; // Les validations se feront côté serveur
            case 2:
                return true;
            case 3:
                return selectedType !== '';
            case 4:
                return true; // Catégorie optionnelle
            case 5:
                return selectedPlan !== '' && selectedModePaiement !== '';
            default:
                return false;
        }
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
                                    className={`flex items-center ${
                                        step < totalSteps ? 'flex-1' : ''
                                    }`}
                                >
                                    <div
                                        className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                                            step <= currentStep
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
                                            className={`flex-1 h-1 mx-2 transition-colors ${
                                                step < currentStep
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
                                <Card className="max-w-md bg-red-500 mx-auto">
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
                                                                <InputError message={errors?.name} />
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
                                                                <InputError message={errors?.email} />
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
                                                                <InputError message={errors?.password} />
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
                                                        setData('password_confirmation',e.target.value)
                                                    }
                                                    placeholder="Confirmer le mot de passe"
                                                />
                                                <InputError message={errors?.password_confirmation} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Step 2: Informations du restaurant */}
                            {currentStep === 2 && (
                                <Card>
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
                                                <InputError message={errors?.restaurant_nom} />
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
                                                <InputError
                                                    message={errors?.restaurant_telephone}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Step 3: Type d'établissement */}
                            {currentStep === 3 && (
                                <Card>
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
                                                            className={`relative p-6 rounded-xl border-2 transition-all text-left hover:shadow-lg hover:scale-105 ${
                                                                selectedType === value
                                                                    ? `border-primary shadow-lg scale-105 bg-gradient-to-br ${colorClass} bg-opacity-10`
                                                                    : 'border-border hover:border-primary/50 bg-card'
                                                            }`}
                                                        >
                                                            <div className="flex flex-col items-center gap-4">
                                                                <div
                                                                    className={`w-24 h-24 rounded-2xl p-4 flex items-center justify-center transition-all ${
                                                                        selectedType === value
                                                                            ? `bg-gradient-to-br ${colorClass} shadow-lg`
                                                                            : 'bg-muted'
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
                                                                        <div className={`rounded-full bg-gradient-to-br ${colorClass} p-1.5 shadow-md`}>
                                                                            <Check className="h-4 w-4 text-white" />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </button>
                                                    );
                                                }
                                            )}
                                        </div>
                                        <InputError
                                            message={errors?.restaurant_type_etablissement}
                                            className="mt-4"
                                        />
                                    </CardContent>
                                </Card>
                            )}

                            {/* Step 4: Catégorie */}
                            {currentStep === 4 && (
                                <Card>
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
                                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                            {Object.entries(categories).map(([value, label]) => {
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
                                                        className={`relative p-6 rounded-xl border-2 transition-all text-left hover:shadow-lg hover:scale-105 ${
                                                            selectedCategory === value
                                                                ? `border-primary shadow-lg scale-105 bg-gradient-to-br ${colorClass} bg-opacity-10`
                                                                : 'border-border hover:border-primary/50 bg-card'
                                                        }`}
                                                    >
                                                        <div className="flex flex-col items-center gap-4">
                                                            <div
                                                                className={`w-24 h-24 rounded-2xl p-4 flex items-center justify-center transition-all ${
                                                                    selectedCategory === value
                                                                        ? `bg-gradient-to-br ${colorClass} shadow-lg`
                                                                        : 'bg-muted'
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
                                                                    <div className={`rounded-full bg-gradient-to-br ${colorClass} p-1.5 shadow-md`}>
                                                                        <Check className="h-4 w-4 text-white" />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <InputError
                                            message={errors?.restaurant_categorie}
                                            className="mt-4"
                                        />
                                    </CardContent>
                                </Card>
                            )}

                            {/* Step 5: Plan d'abonnement */}
                            {currentStep === 5 && (
                                <Card>
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
                                                        className={`relative rounded-xl border-2 p-6 transition-all hover:shadow-xl ${
                                                            isSelected
                                                                ? `border-primary shadow-xl scale-105 bg-gradient-to-br ${planColor} bg-opacity-10`
                                                                : 'border-border hover:border-primary/50 bg-card'
                                                        }`}
                                                    >
                                                        {isSelected && (
                                                            <div className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r ${planColor} px-4 py-1.5 text-xs font-semibold text-white shadow-lg`}>
                                                                Sélectionné
                                                            </div>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => handlePlanSelect(slug)}
                                                            className="w-full text-left"
                                                        >
                                                            <div className={`mb-4 p-3 rounded-lg ${isSelected ? `bg-gradient-to-br ${planColor} text-white` : 'bg-muted'}`}>
                                                                <h3 className="text-xl font-bold capitalize">
                                                                    {plan.name}
                                                                </h3>
                                                                <p className={`text-sm mt-1 ${isSelected ? 'text-white/90' : 'text-muted-foreground'}`}>
                                                                    {plan.description}
                                                                </p>
                                                            </div>
                                                            <div className="mb-4">
                                                                <div className="flex items-baseline gap-1">
                                                                    <span className={`text-3xl font-bold ${isSelected ? `bg-gradient-to-r ${planColor} bg-clip-text text-transparent` : ''}`}>
                                                                        {plan.montant_mensuel.toLocaleString()}
                                                                    </span>
                                                                    <span className="text-muted-foreground">
                                                                        FC
                                                                    </span>
                                                                </div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    /mois
                                                                </div>
                                                            </div>
                                                            <ul className="space-y-2.5 text-sm mb-4">
                                                                <li className="flex items-center gap-2">
                                                                    <div className={`p-1 rounded-full ${isSelected ? `bg-gradient-to-br ${planColor} text-white` : 'bg-primary/10 text-primary'}`}>
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
                                                                    <div className={`p-1 rounded-full ${isSelected ? `bg-gradient-to-br ${planColor} text-white` : 'bg-primary/10 text-primary'}`}>
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
                                                                    <div className={`p-1 rounded-full ${isSelected ? `bg-gradient-to-br ${planColor} text-white` : 'bg-primary/10 text-primary'}`}>
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
                                                                        <div className={`p-1 rounded-full ${isSelected ? `bg-gradient-to-br ${planColor} text-white` : 'bg-primary/10 text-primary'}`}>
                                                                            <Check className="h-3 w-3" />
                                                                        </div>
                                                                    ) : (
                                                                        <span className="h-5 w-5" />
                                                                    )}
                                                                    <span>Rapports</span>
                                                                </li>
                                                                <li className="flex items-center gap-2">
                                                                    {plan.limitations.personnalisation === true ? (
                                                                        <div className={`p-1 rounded-full ${isSelected ? `bg-gradient-to-br ${planColor} text-white` : 'bg-primary/10 text-primary'}`}>
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
                                        <InputError message={errors?.plan} className="mt-4" />
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
                            <div className="w-full max-w-md mx-auto bg-red-500">
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
                                        >
                                            Suivant
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    ) : (
                                        <Button
                                            type="submit"
                                            disabled={!canProceed() || processing}
                                        >
                                            {processing && <Spinner />}
                                            Créer mon restaurant
                                        </Button>
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
                        {Object.entries(modesPaiement).map(([value, label]) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => handlePaymentSelect(value)}
                                className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                                    selectedModePaiement === value
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border hover:border-primary/50'
                                }`}
                            >
                                <div
                                    className={`p-3 rounded-lg ${
                                        selectedModePaiement === value
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
