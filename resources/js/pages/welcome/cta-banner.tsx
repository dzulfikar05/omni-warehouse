import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

export default function CtaBanner() {
    return (
        <section className="py-20 px-6 border-t border-slate-100 bg-white dark:bg-slate-950 dark:border-slate-800/80 transition-colors duration-300">
            <div className="max-w-6xl mx-auto">
                <div
                    className="w-full rounded-2xl px-10 sm:px-16 py-14 flex flex-col md:flex-row items-center justify-between gap-8 bg-blue-600 dark:bg-gradient-to-r dark:from-blue-600 dark:to-indigo-700 shadow-xl shadow-blue-500/10 dark:shadow-none transition-colors duration-300"
                >
                    {/* Left: Copy */}
                    <div className="flex-1 min-w-0 text-center md:text-left">
                        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                            Siap mengelola gudang dengan lebih efisien?
                        </h2>
                        <p className="mt-3 text-blue-100/80 text-sm leading-relaxed max-w-md">
                            Setup dalam satu hari. Tanpa kontrak. Tanpa hardware tambahan.
                        </p>
                    </div>

                    {/* Right: Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                        {/* Primary Button */}
                        <Link
                            href="/register-tenant"
                            className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800 font-bold text-sm px-6 py-3 rounded-lg transition-colors duration-150 active:scale-[0.98] whitespace-nowrap shadow-sm"
                        >
                            Coba Gratis 14 Hari <ArrowRight size={15} strokeWidth={2.5} />
                        </Link>

                        {/* Secondary Button */}
                        <a
                            href="#demo"
                            className="inline-flex items-center gap-2 text-white font-semibold text-sm px-6 py-3 rounded-lg border border-white/30 hover:border-white hover:bg-white/10 dark:border-white/20 dark:hover:bg-white/10 transition-all duration-150 active:scale-[0.98] whitespace-nowrap"
                        >
                            Jadwalkan Demo
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
