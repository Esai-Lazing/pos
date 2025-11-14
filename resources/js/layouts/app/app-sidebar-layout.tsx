import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import FlashMessages from '@/components/flash-message';
import SubscriptionNotifications from '@/components/subscription-notifications';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <FlashMessages />
                <div className="fixed top-20 left-4 right-4 z-40 max-w-2xl mx-auto">
                    <SubscriptionNotifications />
                </div>
                {children}
            </AppContent>
        </AppShell>
    );
}
