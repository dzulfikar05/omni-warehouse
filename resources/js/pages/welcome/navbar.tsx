import React from 'react';
import { Link } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import { ArrowRight } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                    <AppLogo size="sm" tenantName="OmniWarehouse" />
                </Link>

                <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-500">
                    <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
                    <a href="#solutions" className="hover:text-slate-900 transition-colors">Solutions</a>
                    <a href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</a>
                    <a href="#faq" className="hover:text-slate-900 transition-colors">FAQ</a>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/login" className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                        Sign In
                    </Link>
                    <Link
                        href="/register-tenant"
                        className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold h-9 px-4 rounded-lg transition-all"
                    >
                        Get Started <ArrowRight size={13} />
                    </Link>
                </div>
            </div>
        </nav>
    );
}
