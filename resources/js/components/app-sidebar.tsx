import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { aide, dashboard } from '@/routes';
import * as venteRoutes from '@/routes/vente';
import * as stockRoutes from '@/routes/stock';
import * as rapportRoutes from '@/routes/rapport';
import * as printerRoutes from '@/routes/printer';
import * as userRoutes from '@/routes/user';
import * as restaurantRoutes from '@/routes/restaurant';
import * as serveurRoutes from '@/routes/serveur';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { HelpCircle, Info, History, LayoutGrid, Package, ShoppingCart, BarChart3, Printer as PrinterIcon, Users, Building2, UserPlus, Palette } from 'lucide-react';
import { useMemo } from 'react';
import AppLogoIcon from './app-logo-icon';

const allNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
        roles: ['admin', 'caisse', 'stock'], // Tous les rôles
    },
    {
        title: 'Vente',
        href: venteRoutes.create(),
        icon: ShoppingCart,
        roles: ['admin', 'caisse'], // Admin et Caisse
    },
    {
        title: 'Historique',
        href: venteRoutes.index(),
        icon: History,
        roles: ['admin', 'caisse'], // Admin et Caisse
    },
    {
        title: 'Stock',
        href: stockRoutes.index(),
        icon: Package,
        roles: ['admin', 'stock'], // Admin et Stock
    },
    {
        title: 'Rapports',
        href: rapportRoutes.index(),
        icon: BarChart3,
        roles: ['admin'], // Admin uniquement
    },
    {
        title: 'Imprimantes',
        href: printerRoutes.index(),
        icon: PrinterIcon,
        roles: ['admin'], // Admin uniquement
    },
    {
        title: 'Utilisateurs',
        href: userRoutes.index(),
        icon: Users,
        roles: ['admin'], // Admin uniquement
    },
    {
        title: 'Restaurants',
        href: restaurantRoutes.index(),
        icon: Building2,
        roles: ['super-admin'], // Super-admin uniquement
    },
    {
        title: 'Serveurs',
        href: serveurRoutes.index(),
        icon: UserPlus,
        roles: ['admin'], // Admin uniquement
    },
    {
        title: 'Personnalisation',
        href: '/restaurant/customization/edit',
        icon: Palette,
        roles: ['admin'], // Admin uniquement
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Aide & Support',
        href: aide(),
        icon: HelpCircle,
    },
    {
        title: 'À propos de JUVISY',
        href: '#',
        icon: Info,
    },
];

export function AppSidebar() {
    const { auth, restaurant } = usePage<SharedData>().props;
    const userRole = auth.user?.role || 'caisse'; // Par défaut caisse si non défini

    // Filtrer les items selon le rôle de l'utilisateur
    const mainNavItems = useMemo(() => {
        return allNavItems.filter((item) => {
            const itemRoles = item.roles || [];
            return itemRoles.includes(userRole as 'super-admin' | 'admin' | 'caisse' | 'stock' | 'serveur');
        });
    }, [userRole]);

    // Déterminer le nom et le logo à afficher
    const restaurantName = restaurant?.customization?.nom || restaurant?.nom || 'JUVISY';
    const restaurantLogo = restaurant?.customization?.logo || null;

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
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
