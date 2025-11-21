import { AppContent } from '@/components/app-content';
import { AppHeader } from '@/components/app-header';
import { AppShell } from '@/components/app-shell';
import FlashMessages from '@/components/flash-message';
import { TypographyProvider } from '@/contexts/typography-context';
import { useTheme } from '@/hooks/use-theme';
import { type BreadcrumbItem, type SharedData } from '@/types';
import type { PropsWithChildren } from 'react';
import { usePage } from '@inertiajs/react';

export default function AppHeaderLayout({
    children,
    breadcrumbs,
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
            <AppShell>
                <AppHeader breadcrumbs={breadcrumbs} />
                <AppContent>
                    <FlashMessages />
                    {children}
                </AppContent>
            </AppShell>
        </TypographyProvider>
    );
}
