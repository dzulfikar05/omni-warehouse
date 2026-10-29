import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { LanguageDropdown } from '@/components/language-dropdown';
import { useTranslation } from '@/context/language-context';

export default function Navbar() {
    const { t } = useTranslation();
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 dark:bg-slate-950/95 dark:border-slate-800/80 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                    <AppLogo size="sm" tenantName="OmniWarehouse" />
                </Link>

                <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t("Features")}</a>
                    <a href="#solutions" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t("Solutions")}</a>
                    <a href="#pricing" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t("Pricing")}</a>
                    <a href="#faq" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t("FAQ")}</a>
                </div>

                <div className="flex items-center gap-4">
                    {/* <LanguageDropdown /> */}
                    <Link
                        href="/find-tenant"
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
                    >
                        {t("Sign In")}
                    </Link>
                    <Link
                        href="/register-tenant"
                        className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-bold h-9 px-4 rounded-lg transition-all shadow-sm"
                    >
                        {t("Get Started")}{' '}<ArrowRight size={13} />
                    </Link>
                </div>
            </div>
        </nav>
    );
}
