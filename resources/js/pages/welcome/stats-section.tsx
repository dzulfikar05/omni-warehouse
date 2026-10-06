import React from 'react';

export default function StatsSection() {
    const stats = [
        { value: '10,000+', label: 'SKUs managed per tenant' },
        { value: '< 50ms', label: 'Avg. stock query latency' },
        { value: '99.9%', label: 'Platform uptime guaranteed' },
    ];

    return (
        <section className="py-16 px-6 border-t border-slate-100 bg-white dark:bg-slate-950 dark:border-slate-800/80 transition-colors duration-300">
            <div className="max-w-4xl mx-auto">
                <div className="grid sm:grid-cols-3 gap-8 text-center">
                    {stats.map((s, i) => (
                        <div key={i}>
                            <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mb-1">{s.value}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
