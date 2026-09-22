import React from 'react';
import { Link } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';

// Social media icon components (inline SVG — no extra library needed)
function LinkedInIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
    );
}

function WhatsAppIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
        </svg>
    );
}

function YouTubeIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
    );
}

function XIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
        </svg>
    );
}

export default function Footer() {
    const socialLinks = [
        {
            label: 'LinkedIn',
            href: 'https://linkedin.com',
            icon: <LinkedInIcon />,
        },
        {
            label: 'WhatsApp',
            href: 'https://wa.me/6281234567890',
            icon: <WhatsAppIcon />,
        },
        {
            label: 'YouTube',
            href: 'https://youtube.com',
            icon: <YouTubeIcon />,
        },
        {
            label: 'X / Twitter',
            href: 'https://x.com',
            icon: <XIcon />,
        },
    ];

    return (
        <footer className="border-t border-slate-100 bg-white pt-16 pb-10 text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">

                    {/* Brand column */}
                    <div className="col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <AppLogo size="sm" tenantName="OmniWarehouse" />
                        </Link>
                        <p className="text-slate-500 text-xs leading-relaxed max-w-sm mb-5">
                            Sistem Manajemen Gudang Multi-Tenant Enterprise. Dirancang untuk otomasi logistik, pemetaan rak spasial, dan isolasi data yang ketat.
                        </p>

                        {/* Social media icons */}
                        <div className="flex items-center gap-3">
                            {socialLinks.map((s) => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={s.label}
                                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-sky-500 hover:border-sky-200 transition-colors duration-150"
                                >
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Product links */}
                    <div>
                        <h4 className="font-black text-slate-900 text-[11px] uppercase tracking-wider mb-4">Produk</h4>
                        <ul className="space-y-2.5 font-medium">
                            <li><a href="#features" className="hover:text-sky-500 transition-colors">Fitur</a></li>
                            <li><a href="#pricing" className="hover:text-sky-500 transition-colors">Harga</a></li>
                            <li><a href="#solutions" className="hover:text-sky-500 transition-colors">Cara Kerja</a></li>
                            <li><a href="#faq" className="hover:text-sky-500 transition-colors">FAQ</a></li>
                        </ul>
                    </div>

                    {/* Solutions */}
                    <div>
                        <h4 className="font-black text-slate-900 text-[11px] uppercase tracking-wider mb-4">Solusi</h4>
                        <ul className="space-y-2.5 font-medium">
                            <li><span className="text-slate-400">Depot Multi-Lokasi</span></li>
                            <li><span className="text-slate-400">Penerimaan Otomatis</span></li>
                            <li><span className="text-slate-400">Fulfillment 3PL</span></li>
                            <li><span className="text-slate-400">Integrasi ERP</span></li>
                        </ul>
                    </div>

                    {/* Account */}
                    <div>
                        <h4 className="font-black text-slate-900 text-[11px] uppercase tracking-wider mb-4">Akun</h4>
                        <ul className="space-y-2.5 font-medium">
                            <li><Link href="/login" className="hover:text-sky-500 transition-colors">Masuk</Link></li>
                            <li><Link href="/register-tenant" className="hover:text-sky-500 transition-colors">Daftar Tenant</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 font-medium text-[11px]">
                    <div>
                        &copy; {new Date().getFullYear()}{' '}
                        <span className="text-slate-700 font-bold">OmniWarehouse SaaS</span>. Seluruh hak cipta dilindungi.
                    </div>
                    <div className="flex gap-6">
                        <span className="hover:text-slate-800 cursor-pointer transition-colors">Kebijakan Privasi</span>
                        <span className="hover:text-slate-800 cursor-pointer transition-colors">Syarat Layanan</span>
                        <span className="hover:text-slate-800 cursor-pointer transition-colors">Jaminan SLA</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
