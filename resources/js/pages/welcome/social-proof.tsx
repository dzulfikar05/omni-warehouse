import React from 'react';

// Simulate realistic testimonials from warehouse decision makers
const testimonials = [
    {
        quote: 'Selisih stok kami turun dari 6% ke 0,4% dalam tiga bulan pertama. Stock opname yang biasanya tiga hari sekarang selesai dalam empat jam.',
        name: 'Budi Santoso',
        role: 'Kepala Logistik, PT. Mitra Distribusi Nusantara',
        initial: 'BS',
    },
    {
        quote: 'Tim picking kami yang 12 orang sekarang bisa menangani order dua kali lipat tanpa tambahan karyawan. Denah rak digitalnya benar-benar mengubah cara kerja di lapangan.',
        name: 'Rini Kusuma',
        role: 'Warehouse Manager, CV. Agro Prima Sejahtera',
        initial: 'RK',
    },
    {
        quote: 'Setup-nya cepat sekali. Dalam satu hari kerja kami sudah bisa input 800 SKU dan langsung operasional. Tidak perlu IT internal sama sekali.',
        name: 'Dedi Pramono',
        role: 'Operational Director, UD. Cahaya Logistik',
        initial: 'DP',
    },
];

export default function SocialProof() {
    return (
        <section className="py-20 px-6 border-t border-slate-100 bg-slate-50/50">
            <div className="max-w-6xl mx-auto">
                {/* Section header */}
                <div className="text-center mb-14">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#2B7FFF] mb-3">Dipakai di Lapangan</p>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900">
                        Dipercaya oleh 50+ gudang distribusi di Indonesia
                    </h2>
                    <p className="text-slate-500 text-sm mt-3 max-w-md mx-auto">
                        Dari depot FMCG, gudang fashion, hingga 3PL fulfillment center.
                    </p>
                </div>

                {/* Metrics bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
                    {[
                        { value: '99.4%', label: 'Rata-rata akurasi stok' },
                        { value: '−62%', label: 'Waktu stock opname' },
                        { value: '10 jt+', label: 'Transaksi stok/bulan' },
                        { value: '< 1 hari', label: 'Waktu implementasi' },
                    ].map((m, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 text-center">
                            <div className="text-2xl font-black text-slate-900" style={{ color: i % 2 === 0 ? '#2B7FFF' : '#0f172a' }}>
                                {m.value}
                            </div>
                            <div className="text-xs text-slate-500 font-medium mt-1">{m.label}</div>
                        </div>
                    ))}
                </div>

                {/* Testimonials */}
                <div className="grid md:grid-cols-3 gap-5">
                    {testimonials.map((t, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col gap-4">
                            {/* Quote mark */}
                            <span className="text-4xl leading-none font-black text-slate-100 select-none">&ldquo;</span>
                            <p className="text-sm text-slate-700 leading-relaxed -mt-3 flex-1">
                                {t.quote}
                            </p>
                            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-black shrink-0"
                                    style={{ backgroundColor: '#2B7FFF' }}
                                >
                                    {t.initial}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-900">{t.name}</p>
                                    <p className="text-[10px] text-slate-400">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
