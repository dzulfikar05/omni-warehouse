import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

export default function CtaBanner() {
    return (
        <section className="py-20 px-6 border-t border-slate-100 bg-white">
            <div className="max-w-6xl mx-auto">
                <div
                    className="w-full rounded-2xl px-10 sm:px-16 py-14 flex flex-col md:flex-row items-center justify-between gap-8"
                    style={{ backgroundColor: '#2B7FFF' }}
                >
                    {/* Left: Copy */}
                    <div className="flex-1 min-w-0 text-center md:text-left">
                        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                            Siap mengelola gudang dengan lebih efisien?
                        </h2>
                        <p className="mt-3 text-white/70 text-sm leading-relaxed max-w-md">
                            Setup dalam satu hari. Tanpa kontrak. Tanpa hardware tambahan.
                        </p>
                    </div>

                    {/* Right: Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                        {/* Primary */}
                        <Link
                            href="/register-tenant"
                            className="inline-flex items-center gap-2 bg-white font-bold text-sm px-6 py-3 rounded-lg transition-colors duration-150 active:scale-[0.98] whitespace-nowrap"
                            style={{ color: '#2B7FFF' }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f0f7ff')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#ffffff')}
                        >
                            Coba Gratis 14 Hari <ArrowRight size={15} strokeWidth={2.5} />
                        </Link>

                        {/* Secondary */}
                        <a
                            href="#demo"
                            className="inline-flex items-center gap-2 text-white font-semibold text-sm px-6 py-3 rounded-lg border border-white/30 hover:border-white hover:bg-white/10 transition-all duration-150 active:scale-[0.98] whitespace-nowrap"
                        >
                            Jadwalkan Demo
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
