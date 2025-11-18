import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import {
    BookOpen,
    ShoppingCart,
    Package,
    BarChart3,
    Printer,
    Users,
    DollarSign,
    AlertTriangle,
    History,
    CheckCircle,
    ArrowRight,
    LayoutGrid,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Aide & Support',
        href: '#',
    },
];

interface Section {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    items: string[];
}

export default function AideIndex() {
    const { auth } = usePage<SharedData>().props;
    const userRole = auth.user?.role || 'caisse';

    // Sections communes à tous les rôles
    const sectionsCommunes: Section[] = [
        {
            title: 'Bienvenue dans Pay way',
            icon: LayoutGrid,
            items: [
                'Pay way est un système de point de vente (POS) conçu spécialement pour les restaurants et bars congolais.',
                'L\'application fonctionne en mode hors ligne (offline-first) pour garantir une utilisation continue même sans connexion internet.',
                'Toutes les données sont synchronisées automatiquement dès que la connexion est rétablie.',
            ],
        },
    ];

    // Sections selon le rôle
    const sectionsParRole: Record<string, Section[]> = {
        admin: [
            {
                title: 'Dashboard Administrateur',
                icon: LayoutGrid,
                items: [
                    'Vue d\'ensemble complète des ventes du jour, de la semaine et du mois.',
                    'Statistiques détaillées en Franc Congolais (FC) et en Dollars (USD).',
                    'Nombre total de ventes effectuées.',
                    'Alertes sur les produits en stock bas.',
                    'Liste des produits les plus vendus.',
                    'Historique des dernières ventes avec détails complets.',
                ],
            },
            {
                title: 'Gestion des Ventes',
                icon: ShoppingCart,
                items: [
                    'Créer une nouvelle vente en sélectionnant les produits.',
                    'Choisir l\'unité de vente : casier ou bouteille.',
                    'Sélectionner le mode de paiement : FC uniquement, USD uniquement, ou Mixte.',
                    'Le système calcule automatiquement le total, le rendu et le bénéfice.',
                    'Imprimer la facture directement via une imprimante POS.',
                    'Consulter et modifier l\'historique des ventes.',
                ],
            },
            {
                title: 'Gestion du Stock',
                icon: Package,
                items: [
                    'Ajouter de nouveaux produits avec leurs caractéristiques (nom, code, prix, stock).',
                    'Le code produit est généré automatiquement si non fourni.',
                    'Gérer les quantités en casiers et bouteilles.',
                    'Définir le stock minimum par casier pour recevoir des alertes.',
                    'Effectuer des mouvements de stock (entrées, sorties, ajustements).',
                    'Consulter l\'historique des mouvements de stock.',
                    'Supprimer des produits (suppression douce).',
                ],
            },
            {
                title: 'Rapports et Statistiques',
                icon: BarChart3,
                items: [
                    'Générer des rapports journaliers, hebdomadaires et mensuels.',
                    'Analyser les produits les plus vendus.',
                    'Suivre les ventes par devise (FC/USD).',
                    'Calculer la rentabilité et les bénéfices.',
                    'Exporter les rapports en PDF ou Excel.',
                ],
            },
            {
                title: 'Gestion des Imprimantes',
                icon: Printer,
                items: [
                    'Configurer les imprimantes POS (Bluetooth, USB, Wi-Fi).',
                    'Personnaliser les informations de l\'établissement sur les factures.',
                    'Définir le message personnalisé pour les factures.',
                    'Tester l\'impression des factures.',
                ],
            },
            {
                title: 'Gestion des Utilisateurs',
                icon: Users,
                items: [
                    'Créer et gérer les comptes utilisateurs.',
                    'Assigner les rôles : Admin, Caisse, ou Stock.',
                    'Activer ou désactiver les comptes utilisateurs.',
                ],
            },
        ],
        caisse: [
            {
                title: 'Dashboard Caisse',
                icon: LayoutGrid,
                items: [
                    'Voir vos ventes personnelles du jour.',
                    'Statistiques de vos ventes en FC et USD.',
                    'Nombre de ventes que vous avez effectuées.',
                    'Accès rapide à vos dernières ventes.',
                ],
            },
            {
                title: 'Créer une Vente',
                icon: ShoppingCart,
                items: [
                    'Cliquez sur "Vente" dans le menu pour créer une nouvelle vente.',
                    'Recherchez et sélectionnez les produits à vendre.',
                    'Choisissez l\'unité : casier ou bouteille.',
                    'Le prix unitaire s\'affiche automatiquement selon l\'unité choisie.',
                    'Sélectionnez le mode de paiement : FC, USD, ou Mixte.',
                    'Entrez les montants payés pour chaque devise si nécessaire.',
                    'Le système calcule automatiquement le total et le rendu.',
                    'Cliquez sur "Valider la vente" pour enregistrer.',
                ],
            },
            {
                title: 'Imprimer une Facture',
                icon: Printer,
                items: [
                    'Après validation d\'une vente, cliquez sur "Imprimer".',
                    'La facture s\'imprime automatiquement sur l\'imprimante POS configurée.',
                    'Si l\'imprimante n\'est pas disponible, utilisez l\'impression navigateur.',
                    'La facture contient : numéro, date, produits, totaux, et message personnalisé.',
                ],
            },
            {
                title: 'Historique des Ventes',
                icon: History,
                items: [
                    'Consultez toutes vos ventes dans "Historique".',
                    'Filtrez par période : jour, semaine, ou mois.',
                    'Voir les détails d\'une vente en cliquant dessus.',
                    'Modifier une vente si nécessaire.',
                    'Réimprimer une facture depuis l\'historique.',
                ],
            },
            {
                title: 'Conseils pour la Caisse',
                icon: CheckCircle,
                items: [
                    'Vérifiez toujours le stock disponible avant de vendre.',
                    'Assurez-vous que le montant payé correspond au total.',
                    'En cas de paiement mixte, vérifiez les deux montants.',
                    'Imprimez toujours la facture pour le client.',
                    'En cas de problème, contactez l\'administrateur.',
                ],
            },
        ],
        stock: [
            {
                title: 'Dashboard Stock',
                icon: LayoutGrid,
                items: [
                    'Vue d\'ensemble du stock total.',
                    'Nombre de produits actifs.',
                    'Alertes sur les produits en stock bas.',
                    'Mouvements récents de stock (7 derniers jours).',
                ],
            },
            {
                title: 'Ajouter un Produit',
                icon: Package,
                items: [
                    'Cliquez sur "Stock" puis "Nouveau produit".',
                    'Remplissez les informations : nom, catégorie, prix.',
                    'Le code produit est généré automatiquement (optionnel).',
                    'Définissez les quantités initiales en casiers et bouteilles.',
                    'Spécifiez le nombre de bouteilles par casier (12 ou 24).',
                    'Définissez le stock minimum en casiers.',
                    'Choisissez la devise principale (FC, USD, ou Mixte).',
                    'Activez ou désactivez le produit.',
                ],
            },
            {
                title: 'Gérer le Stock',
                icon: Package,
                items: [
                    'Consultez la liste de tous les produits.',
                    'Cliquez sur un produit pour voir ses détails.',
                    'Modifiez les informations du produit si nécessaire.',
                    'Effectuez des mouvements de stock depuis la page de détails.',
                    'Utilisez "Actions rapides" pour ajouter ou retirer du stock rapidement.',
                    'Consultez l\'historique des mouvements pour chaque produit.',
                ],
            },
            {
                title: 'Mouvements de Stock',
                icon: ArrowRight,
                items: [
                    'Entrée : Ajouter du stock (réception de marchandises).',
                    'Sortie : Retirer du stock (vente, perte, etc.).',
                    'Ajustement : Corriger une erreur de comptage.',
                    'Spécifiez les quantités en casiers et/ou bouteilles.',
                    'Ajoutez une raison pour chaque mouvement.',
                    'Le système calcule automatiquement le total en bouteilles.',
                ],
            },
            {
                title: 'Alertes de Stock Bas',
                icon: AlertTriangle,
                items: [
                    'Les produits en stock bas sont affichés en rouge.',
                    'Le stock minimum est défini en casiers.',
                    'L\'alerte se déclenche quand le stock total (en bouteilles) est inférieur ou égal au minimum.',
                    'Commander rapidement les produits en stock bas.',
                ],
            },
            {
                title: 'Conseils pour le Stock',
                icon: CheckCircle,
                items: [
                    'Vérifiez régulièrement les stocks disponibles.',
                    'Effectuez des inventaires périodiques.',
                    'Enregistrez tous les mouvements de stock immédiatement.',
                    'Tenez compte des bouteilles hors casier dans vos calculs.',
                    'Contactez l\'administrateur en cas de problème.',
                ],
            },
        ],
    };

    const sections = [...sectionsCommunes, ...(sectionsParRole[userRole] || [])];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Comment ça marche - Aide & Support" />
            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Comment ça marche</h1>
                        <p className="mt-2 text-muted-foreground">
                            Guide d'utilisation de Pay way pour le rôle :{' '}
                            <span className="font-semibold capitalize">
                                {userRole === 'admin'
                                    ? 'Administrateur'
                                    : userRole === 'caisse'
                                      ? 'Caisse'
                                      : 'Stock'}
                            </span>
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    {sections.map((section, index) => {
                        const Icon = section.icon;
                        return (
                            <div
                                key={index}
                                className="rounded-lg border border-border bg-card p-6 shadow-sm"
                            >
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="rounded-lg bg-primary/10 p-2">
                                        <Icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <h2 className="text-xl font-semibold">{section.title}</h2>
                                </div>
                                <ul className="space-y-3">
                                    {section.items.map((item, itemIndex) => (
                                        <li
                                            key={itemIndex}
                                            className="flex items-start gap-2 text-sm text-muted-foreground"
                                        >
                                            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>

                {/* Section FAQ rapide */}
                <div className="mt-6 rounded-lg border border-border bg-card p-6">
                    <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                        <BookOpen className="h-5 w-5" />
                        Questions Fréquentes
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <h3 className="font-semibold text-foreground">
                                Comment fonctionne le mode hors ligne ?
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                L'application fonctionne sans connexion internet. Toutes les données
                                sont stockées localement et synchronisées automatiquement dès que la
                                connexion est rétablie.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">
                                Puis-je modifier une vente après validation ?
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Oui, vous pouvez modifier une vente depuis l'historique. Le stock
                                sera automatiquement ajusté lors de la modification.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">
                                Comment calculer le stock total ?
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Le stock total = (nombre de casiers × bouteilles par casier) +
                                bouteilles hors casier. Le système calcule automatiquement ce total.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">
                                Que faire si l'imprimante ne fonctionne pas ?
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                L'application bascule automatiquement vers l'impression navigateur
                                si l'imprimante POS n'est pas disponible. Vous pouvez toujours
                                imprimer la facture.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Lien retour */}
                <div className="mt-4 flex justify-end">
                    <a
                        href={dashboard().url}
                        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                    >
                        Retour au Dashboard
                        <ArrowRight className="h-4 w-4" />
                    </a>
                </div>
            </div>
        </AppLayout>
    );
}

