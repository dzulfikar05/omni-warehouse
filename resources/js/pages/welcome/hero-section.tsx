import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowRight, CheckCircle } from 'lucide-react';

// Inline product mockup — simulates the WMS dashboard UI
function DashboardMockup() {
    return (
        <div className="w-full max-w-3xl mx-auto mt-14 rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/80 overflow-hidden select-none pointer-events-none">
            {/* Window chrome */}
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <div className="ml-3 flex-1 bg-slate-100 rounded-md px-3 py-1 text-[10px] text-slate-400 font-mono">
                    app.omniwarehouse.id/dashboard
                </div>
            </div>

            {/* Dashboard content */}
            <div className="p-5 bg-slate-50 flex gap-4">
                {/* Left sidebar stub */}
                <div className="w-32 shrink-0 space-y-1">
                    {['Dashboard', 'Inventory', 'Rak & Lokasi', 'Inbound', 'Outbound', 'Laporan'].map((item, i) => (
                        <div
                            key={i}
                            className={`rounded-lg px-3 py-2 text-[10px] font-semibold ${i === 0 ? 'bg-[#2B7FFF] text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                        >
                            {item}
                        </div>
                    ))}
                </div>

                {/* Main content */}
                <div className="flex-1 space-y-3 min-w-0">
                    {/* Metric cards */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: 'Total SKU Aktif', value: '4.827', delta: '+12 hari ini', up: true },
                            { label: 'Akurasi Stok', value: '99.4%', delta: 'vs 94% kemarin', up: true },
                            { label: 'Picking Selesai', value: '183', delta: '12 pending', up: false },
                        ].map((m, i) => (
                            <div key={i} className="bg-white rounded-xl border border-slate-100 p-3">
                                <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wide">{m.label}</p>
                                <p className="text-lg font-black text-slate-900 mt-0.5">{m.value}</p>
                                <p className={`text-[9px] font-semibold mt-0.5 ${m.up ? 'text-emerald-500' : 'text-amber-500'}`}>{m.delta}</p>
                            </div>
                        ))}
                    </div>

                    {/* Rack map stub */}
                    <div className="bg-white rounded-xl border border-slate-100 p-3">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-bold text-slate-700">Denah Rak — Gudang A</p>
                            <span className="text-[9px] text-[#2B7FFF] font-semibold">Live</span>
                        </div>
                        <div className="grid grid-cols-10 gap-1">
                            {Array.from({ length: 40 }).map((_, i) => {
                                const filled = [2, 3, 7, 8, 9, 12, 15, 16, 22, 23, 24, 30, 31, 35, 38];
                                const active = [5, 19, 27];
                                const isFilled = filled.includes(i);
                                const isActive = active.includes(i);
                                return (
                                    <div
                                        key={i}
                                        className={`h-4 rounded-sm ${
                                            isActive ? 'bg-[#2B7FFF]' :
                                            isFilled ? 'bg-slate-200' :
                                            'bg-slate-100'
                                        }`}
                                    />
                                );
                            })}
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="flex items-center gap-1 text-[9px] text-slate-400"><span className="w-2 h-2 rounded-sm bg-[#2B7FFF] inline-block" /> Proses Picking</span>
                            <span className="flex items-center gap-1 text-[9px] text-slate-400"><span className="w-2 h-2 rounded-sm bg-slate-200 inline-block" /> Terisi</span>
                            <span className="flex items-center gap-1 text-[9px] text-slate-400"><span className="w-2 h-2 rounded-sm bg-slate-100 inline-block" /> Kosong</span>
                        </div>
                    </div>

                    {/* Recent activity */}
                    <div className="bg-white rounded-xl border border-slate-100 p-3">
                        <p className="text-[10px] font-bold text-slate-700 mb-2">Aktivitas Terakhir</p>
                        <div className="space-y-1.5">
                            {[
                                { action: 'Inbound 200 unit — SKU-7723 (Baju Polo)', time: '2 mnt lalu', type: 'in' },
                                { action: 'Picking Order #2841 selesai — Rak B3/4', time: '5 mnt lalu', type: 'pick' },
                                { action: 'Stok rendah — SKU-4419 tersisa 3 unit', time: '11 mnt lalu', type: 'warn' },
                            ].map((a, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${a.type === 'in' ? 'bg-emerald-400' : a.type === 'warn' ? 'bg-amber-400' : 'bg-[#2B7FFF]'}`} />
                                    <p className="text-[9px] text-slate-600 flex-1 truncate">{a.action}</p>
                                    <span className="text-[9px] text-slate-400 shrink-0">{a.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function HeroSection() {
    return (
        <section id="overview" className="relative pt-36 pb-20 px-6 overflow-hidden bg-white">
            {/* Very subtle top-only gradient tint — no harsh grid */}
            <div
                className="absolute top-0 left-0 right-0 h-80 pointer-events-none"
                style={{
                    background: 'linear-gradient(to bottom, #EEF5FF 0%, transparent 100%)',
                }}
            />

            <div className="relative max-w-4xl mx-auto text-center">
                {/* Eyebrow */}
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#2B7FFF] mb-5">
                    Warehouse Management System — Multi-Tenant SaaS
                </p>

                {/* Headline — outcome-first, not feature-first */}
                <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-[1.08]">
                    Eliminasi Selisih Stok.{' '}
                    <br className="hidden sm:block" />
                    Pangkas Waktu Picking{' '}
                    <span
                        className="relative inline-block"
                        style={{ color: '#2B7FFF' }}
                    >
                        hingga 40%.
                        <svg
                            className="absolute -bottom-1 left-0 w-full"
                            viewBox="0 0 300 8"
                            fill="none"
                            preserveAspectRatio="none"
                        >
                            <path d="M2 6 C60 2, 140 7, 200 4 S270 1, 298 5" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                    </span>
                </h1>

                {/* Subtext — pain-point language */}
                <p className="mt-7 text-slate-500 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                    Tidak ada lagi barang hilang, stock opname berhari-hari, atau kesalahan picking.
                    OmniWarehouse memberi kontrol penuh atas setiap rak, SKU, dan pergerakan stok gudang Anda — secara real-time.
                </p>

                {/* CTAs */}
                <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                        href="/register-tenant"
                        className="inline-flex items-center gap-2 font-bold text-sm px-7 py-3.5 rounded-xl text-white transition-all duration-150 active:scale-[0.98] shadow-md"
                        style={{ backgroundColor: '#2B7FFF' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1a6fee')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#2B7FFF')}
                    >
                        Coba Gratis 14 Hari <ArrowRight size={16} />
                    </Link>
                    <a
                        href="#demo"
                        className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 font-semibold text-sm px-7 py-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition-all duration-150 active:scale-[0.98]"
                    >
                        Jadwalkan Live Demo 15 Menit
                    </a>
                </div>

                {/* Proof points — specific, not generic claims */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                    {[
                        'Dipercaya oleh 50+ gudang distribusi di Indonesia',
                        'Setup dalam 5 menit',
                        'Tanpa kontrak jangka panjang',
                    ].map((item, i) => (
                        <span key={i} className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                            <CheckCircle size={12} className="text-emerald-500" />
                            {item}
                        </span>
                    ))}
                </div>
            </div>

            {/* Product mockup below CTA */}
            <DashboardMockup />
        </section>
    );
}
