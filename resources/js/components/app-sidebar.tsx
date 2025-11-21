import { NavFooter } from '@/components/nav-footer';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import * as venteRoutes from '@/routes/vente';
import * as stockRoutes from '@/routes/stock';
import * as rapportRoutes from '@/routes/rapports';
import * as printerRoutes from '@/routes/printer';
import * as userRoutes from '@/routes/user';
import * as restaurantRoutes from '@/routes/restaurant';
import * as subscriptionRoutes from '@/routes/subscription';
import { type NavGroup, type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    HelpCircle,
    Info,
    History,
    LayoutGrid,
    Package,
    ShoppingCart,
    BarChart3,
    Printer as PrinterIcon,
    Users,
    Building2,
    Palette,
    CreditCard,
    Settings,
    Store,
} from 'lucide-react';
import { useMemo } from 'react';
import AppLogoIcon from './app-logo-icon';
import { resolveUrl } from '@/lib/utils';

// Définition des sections de navigation
const navigationSections: NavGroup[] = [
    {
        title: 'Vue d\'ensemble',
        items: [
            {
                title: 'Dashboard',
                href: dashboard(),
                icon: LayoutGrid,
                roles: ['super-admin', 'admin', 'caisse', 'stock'],
            },
        ],
    },
    {
        title: 'Gestion',
        items: [
            {
                title: 'Restaurants',
                href: restaurantRoutes.index(),
                icon: Building2,
                roles: ['super-admin'],
            },
        ],
    },
    {
        title: 'Opérations',
        items: [
            {
                title: 'Vente',
                href: venteRoutes.create(),
                icon: ShoppingCart,
                roles: ['admin', 'caisse'],
            },
            {
                title: 'Historique',
                href: venteRoutes.index(),
                icon: History,
                roles: ['admin', 'caisse'],
            },
            {
                title: 'Stock',
                href: stockRoutes.index(),
                icon: Package,
                roles: ['admin', 'stock'],
            },
        ],
    },
    {
        title: 'Administration',
        items: [
            {
                title: 'Rapports',
                href: rapportRoutes.index(),
                icon: BarChart3,
                roles: ['admin'],
            },
            {
                title: 'Imprimantes',
                href: printerRoutes.index(),
                icon: PrinterIcon,
                roles: ['admin'],
            },
            {
                title: 'Utilisateurs',
                href: userRoutes.index(),
                icon: Users,
                roles: ['admin'],
            },
            {
                title: 'Personnalisation',
                href: '/restaurant/customization/edit',
                icon: Palette,
                roles: ['admin'],
            },
            {
                title: 'Abonnement',
                href: subscriptionRoutes.index(),
                icon: CreditCard,
                roles: ['admin'],
            },
        ],
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Aide & Support',
        href: '#',
        icon: HelpCircle,
    },
    {
        title: 'À propos de Pay way',
        href: '#',
        icon: Info,
    },
];

export function AppSidebar() {
    const { auth, restaurant } = usePage<SharedData>().props;
    const userRole = auth.user?.role || 'caisse';
    const isSuperAdmin = userRole === 'super-admin';
    const subscriptionLimitations = restaurant?.subscriptionLimitations;
    const page = usePage();

    // Filtrer les sections selon le rôle et les limitations
    const filteredSections = useMemo(() => {
        return navigationSections
            .map((section) => {
                const filteredItems = section.items.filter((item) => {
                    const itemRoles = item.roles || [];
                    const hasRoleAccess = itemRoles.includes(
                        userRole as 'super-admin' | 'admin' | 'caisse' | 'stock' | 'serveur'
                    );

                    if (!hasRoleAccess) {
                        return false;
                    }

                    // Vérifier l'accès aux fonctionnalités selon l'abonnement
                    if (item.title === 'Personnalisation') {
                        if (isSuperAdmin) {
                            return true;
                        }
                        return subscriptionLimitations?.personnalisation === true;
                    }

                    if (item.title === 'Rapports') {
                        if (isSuperAdmin) {
                            return true;
                        }
                        return subscriptionLimitations?.rapports === true;
                    }

                    return true;
                });

                // Ne retourner la section que si elle a des items
                if (filteredItems.length === 0) {
                    return null;
                }

                return {
                    ...section,
                    items: filteredItems,
                };
            })
            .filter((section): section is NavGroup => section !== null);
    }, [userRole, subscriptionLimitations, isSuperAdmin]);

    // Déterminer le nom et le logo à afficher
    const restaurantName = isSuperAdmin
        ? 'Pay way'
        : (restaurant?.customization?.nom || restaurant?.nom || 'Pay way');
    const restaurantLogo = isSuperAdmin
        ? null
        : (restaurant?.customization?.logo || null);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild tooltip={restaurantName}>
                            <Link href={dashboard()} prefetch>
                                {restaurantLogo ? (
                                    <>
                                        <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground overflow-hidden">
                                            <img
                                                src={restaurantLogo}
                                                alt={restaurantName}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <span className="truncate font-semibold">{restaurantName}</span>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                                            <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
                                        </div>
                                        <span className="truncate font-semibold">{restaurantName}</span>
                                    </>
                                )}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {filteredSections.map((section) => (
                    <SidebarGroup key={section.title} className="px-2 py-0">
                        <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
                        <SidebarMenu>
                            {section.items.map((item) => {
                                const isActive = page.url.startsWith(resolveUrl(item.href));
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            tooltip={{ children: item.title }}
                                        >
                                            <Link href={item.href} prefetch>
                                                {item.icon && <item.icon />}
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
