import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import FlashMessages from '@/components/flash-message';
import SubscriptionExpiredDialog from '@/components/subscription-expired-dialog';
import SubscriptionNotifications from '@/components/subscription-notifications';
import { TypographyProvider } from '@/contexts/typography-context';
import { useTheme } from '@/hooks/use-theme';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { type PropsWithChildren } from 'react';
import { usePage } from '@inertiajs/react';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const { restaurant } = usePage<SharedData>().props;
    const customization = restaurant?.customization as any;
    
    // Initialiser le thème pour qu'il soit appliqué à tous les utilisateurs
    useTheme();

    return (
        <TypographyProvider
            initialSettings={
                customization
                    ? {
                          font_family: customization.font_family,
                          font_size: customization.font_size,
                      }
                    : undefined
            }
        >
            <AppShell variant="sidebar">
                <AppSidebar />
                <AppContent variant="sidebar" className="overflow-x-hidden">
                    <AppSidebarHeader breadcrumbs={breadcrumbs} />
                    <FlashMessages />
                    <SubscriptionExpiredDialog />
                    <div className="fixed top-20 left-4 right-4 z-40 max-w-2xl mx-auto">
                        <SubscriptionNotifications />
                    </div>
                    {children}
                </AppContent>
            </AppShell>
        </TypographyProvider>
    );
}
