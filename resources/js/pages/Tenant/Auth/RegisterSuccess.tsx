import React from 'react';
import { Head } from '@inertiajs/react';
import { CheckCircle2, ArrowRight, Building2, UserCheck } from 'lucide-react';

interface Props {
    tenant: {
        id: number;
        name: string;
        slug: string;
    };
    user: {
        name: string;
        email: string;
    };
}

export default function RegisterSuccess({ tenant, user }: Props) {
    const tenantUrl = `/${tenant.slug}`;
    const loginUrl = `/${tenant.slug}/login`;

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100 font-sans">
            <Head title="Registration Successful" />

            <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
                    <CheckCircle2 size={36} />
                </div>

                <div>
                    <h1 className="text-2xl font-extrabold text-white">Company Registered!</h1>
                    <p className="text-slate-400 text-xs mt-2">
                        Your multi-tenant warehouse environment has been successfully created.
                    </p>
                </div>

                {/* Details Box */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-left space-y-3">
                    <div className="flex items-center gap-3">
                        <Building2 size={18} className="text-indigo-400 shrink-0" />
                        <div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Company</div>
                            <div className="text-sm font-semibold text-white">{tenant.name}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 border-t border-slate-800/80 pt-3">
                        <UserCheck size={18} className="text-indigo-400 shrink-0" />
                        <div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Admin Account</div>
                            <div className="text-sm font-medium text-slate-200">{user.email}</div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-2">
                    <a
                        href={loginUrl}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/25"
                    >
                        Go to Sign In Portal <ArrowRight size={16} />
                    </a>

                    <a
                        href={tenantUrl}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-medium text-xs block transition"
                    >
                        Visit Tenant Public Page ({tenantUrl})
                    </a>
                </div>
            </div>
        </div>
    );
}
