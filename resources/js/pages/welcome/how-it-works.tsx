import React from 'react';

export default function HowItWorks() {
    const steps = [
        {
            step: '01',
            title: 'Daftar & Setup Gudang',
            desc: 'Buat akun tenant Anda dalam 2 menit. Masukkan nama gudang, lokasi, dan zona rak. Tidak perlu hardware khusus — cukup browser.',
        },
        {
            step: '02',
            title: 'Import SKU & Petakan Rak',
            desc: 'Upload daftar produk via CSV atau input manual. Tentukan lokasi penyimpanan tiap SKU di rak yang sudah Anda buat. Staf Anda langsung bisa mulai bekerja.',
        },
        {
            step: '03',
            title: 'Operasikan & Pantau Real-Time',
            desc: 'Catat inbound, proses picking order, dan pantau pergerakan stok secara langsung. Laporan akurasi stok tersedia setiap saat.',
        },
    ];

    return (
        <section id="solutions" className="py-24 px-6 border-t border-slate-100 bg-white">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#2B7FFF] mb-3">Cara Kerja</p>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900">Aktif dan siap pakai dalam satu hari kerja</h2>
                    <p className="text-slate-500 text-sm mt-3 max-w-md mx-auto">
                        Tanpa migrasi berbulan-bulan. Tanpa konsultan implementasi mahal.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 relative">
                    {/* Connector */}
                    <div className="hidden md:block absolute top-9 left-[22%] right-[22%] h-px bg-slate-200" />

                    {steps.map((s, i) => (
                        <div key={i} className="relative flex flex-col items-center text-center px-4 group">
                            <div className="w-16 h-16 rounded-2xl bg-white border-2 border-slate-200 group-hover:border-[#2B7FFF] flex items-center justify-center mb-6 shadow-sm transition-all duration-200 relative z-10">
                                <span className="font-black text-xl text-[#2B7FFF]">{s.step}</span>
                            </div>
                            <h3 className="font-bold text-sm text-slate-900 mb-2">{s.title}</h3>
                            <p className="text-slate-500 text-xs leading-relaxed">{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
