import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

export default function FaqSection() {
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    const faqs = [
        {
            q: 'Berapa lama proses setup dan bisa mulai operasional?',
            a: 'Akun tenant bisa dibuat dalam 2 menit. Import daftar SKU via CSV, buat layout rak, dan Anda sudah bisa mulai mencatat inbound/outbound di hari yang sama. Tidak perlu IT khusus atau konsultan implementasi.',
        },
        {
            q: 'Bisakah saya kelola lebih dari satu gudang dalam satu akun?',
            a: 'Ya. Platform kami mendukung pengelolaan multi-lokasi gudang dalam satu tenant. Setiap lokasi memiliki layout rak, zona, dan laporan tersendiri yang bisa diakses dari satu dashboard.',
        },
        {
            q: 'Apakah data stok perusahaan saya aman dan tidak bercampur dengan perusahaan lain?',
            a: 'Data setiap perusahaan diisolasi secara teknis di level database — tidak ada kemungkinan data bocor ke tenant lain. Sistem kami dirancang khusus untuk keamanan data multi-perusahaan.',
        },
        {
            q: 'Apakah bisa upgrade atau downgrade paket kapan saja?',
            a: 'Bisa. Perubahan paket bisa dilakukan langsung dari portal admin tanpa perlu menghubungi tim sales dan tanpa ada gangguan operasional atau kehilangan data.',
        },
        {
            q: 'Apakah ada biaya tambahan di luar harga langganan?',
            a: 'Tidak ada biaya tersembunyi. Harga yang tertera di halaman ini sudah mencakup seluruh fitur sesuai paket. Untuk kebutuhan integrasi custom atau pelatihan tim lapangan, tersedia paket Enterprise dengan konsultasi langsung.',
        },
    ];

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <section id="faq" className="py-24 px-6 border-t border-slate-100 bg-white dark:bg-slate-950 dark:border-slate-800/80 transition-colors duration-300">
            <div className="max-w-3xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-14">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#2B7FFF] dark:text-blue-400 mb-3">FAQ</p>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Pertanyaan umum</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-3">
                        Masih ada pertanyaan lain?{' '}
                        <a href="mailto:support@omniwarehouse.id" className="text-[#2B7FFF] dark:text-blue-400 font-semibold hover:underline">
                            Hubungi tim kami.
                        </a>
                    </p>
                </div>

                {/* FAQ Items Accordion */}
                <div className="space-y-3">
                    {faqs.map((faq, idx) => {
                        const isOpen = openFaq === idx;
                        return (
                            <div
                                key={idx}
                                className={`rounded-xl border transition-all duration-200 ${
                                    isOpen
                                        ? 'border-blue-200 bg-blue-50/40 dark:border-blue-900/50 dark:bg-blue-950/20'
                                        : 'border-slate-100 bg-white hover:border-slate-200 dark:border-slate-800/80 dark:bg-slate-900/50 dark:hover:border-slate-700'
                                }`}
                            >
                                <button
                                    onClick={() => toggleFaq(idx)}
                                    className="w-full text-left flex justify-between items-center font-bold text-sm text-slate-900 dark:text-slate-100 p-5 focus:outline-hidden"
                                >
                                    <span className="pr-4">{faq.q}</span>
                                    <span
                                        className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
                                            isOpen
                                                ? 'bg-[#2B7FFF] text-white dark:bg-blue-600'
                                                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                        }`}
                                    >
                                        {isOpen ? <Minus size={13} /> : <Plus size={13} />}
                                    </span>
                                </button>
                                {isOpen && (
                                    <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
