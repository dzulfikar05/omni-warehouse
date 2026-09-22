import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        const pageName = name.toLowerCase();
        switch (true) {
            // case pageName === 'welcome':
            case pageName === 'welcome' || pageName.endsWith('/welcome') || pageName.endsWith('/registersuccess'):
                return null;
            case pageName.includes('tenant/auth/login') || pageName.includes('auth/login') || pageName.includes('tenant/auth/register') || pageName.includes('auth/register'):
                return null;
            // case pageName.startsWith('auth/'):
            case pageName.startsWith('auth/') || pageName.includes('/auth/'):
                return AuthLayout;
            case pageName.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
