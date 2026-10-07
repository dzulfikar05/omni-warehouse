import React from 'react';
import { ShieldCheck, Map, RefreshCw, Users, BarChart3, Plug } from 'lucide-react';

export default function FeatureGrid() {
    const features = [
        {
            icon: <ShieldCheck size={18} />,
            title: 'Keamanan Data Stok 100% Terenkripsi',
            desc: 'Data inventori setiap klien terisolasi sepenuhnya. Tidak ada kebocoran data lintas tenant, dijamin secara arsitektur database.',
        },
        {
            icon: <Map size={18} />,
            title: 'Denah Rak & Jalur Picking Visual',
            desc: 'Petakan lokasi fisik gudang Anda — zona, lorong, rak, dan slot bin — dan panduan rute picking terpendek untuk operator.',
        },
        {
            icon: <RefreshCw size={18} />,
            title: 'Update Stok Instan, Nol Selisih',
            desc: 'Setiap pergerakan barang (masuk, keluar, penyesuaian) langsung tercatat dan dapat diaudit. Akhiri era stock opname berhari-hari.',
        },
        {
            icon: <Users size={18} />,
            title: 'Hak Akses Admin, Supervisor & Picker',
            desc: 'Tentukan siapa yang bisa melihat, mencatat, atau menyetujui transaksi stok. Kontrol penuh dengan manajemen peran berjenjang.',
        },
        {
            icon: <BarChart3 size={18} />,
            title: 'Laporan & KPI Operasional Harian',
            desc: 'Pantau akurasi stok, kecepatan picking, dan status kapasitas rak setiap hari dalam satu dashboard terpusat.',
        },
        {
            icon: <Plug size={18} />,
            title: 'Terintegrasi dengan ERP & OMS Anda',
            desc: 'API terbuka untuk sambungkan OmniWarehouse dengan sistem ERP, marketplace, atau platform logistik yang sudah Anda gunakan.',
        },
    ];

    return (
        <section id="features" className="py-20 px-6 border-t border-slate-100 bg-slate-50/50 dark:bg-slate-950/80 dark:border-slate-800/80 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-14">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#2B7FFF] dark:text-blue-400 mb-3">Fitur Platform</p>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                        Semua yang dibutuhkan kepala gudang Anda
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 max-w-lg mx-auto">
                        Dirancang untuk operasional nyata — dari depot kecil hingga jaringan distribusi multi-lokasi.
                    </p>
                </div>

                {/* Grid Feature Cards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {features.map((f, i) => (
                        <div
                            key={i}
                            className="group p-6 rounded-2xl bg-white border border-slate-100 hover:border-blue-100 hover:shadow-md dark:bg-slate-900/60 dark:border-slate-800/80 dark:hover:border-blue-500/30 dark:hover:bg-slate-900 transition-all duration-200"
                        >
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4 transition-all duration-200 bg-[#EEF5FF] text-[#2B7FFF] group-hover:bg-[#2B7FFF] group-hover:text-white dark:bg-blue-950/60 dark:text-blue-400 dark:group-hover:bg-blue-600 dark:group-hover:text-white">
                                {f.icon}
                            </div>
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1.5 leading-snug">{f.title}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
