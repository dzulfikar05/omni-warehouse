import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2, AlertTriangle, X } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface Tenant {
    id: number;
    name: string;
    slug: string;
    phone?: string;
    address?: string;
    users_count?: number;
    created_at?: string;
    updated_at?: string;
    subscription?: {
        status: string;
        plan?: {
            name: string;
        };
    };
}

interface Props {
    tenant: Tenant;
}

export default function TenantShow({ tenant }: Props) {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const formattedId = `TNT-${String(tenant.id).padStart(3, '0')}`;
    const usageCount = tenant.users_count || 0;
    const usagePercent = Math.min(Math.round((usageCount / 25) * 100), 100);
    const planName = tenant.subscription?.plan?.name || 'Standard Plan';
    const subStatus = tenant.subscription?.status ? ` (${tenant.subscription.status.toUpperCase()})` : '';

    const confirmDelete = () => {
        setIsDeleting(true);
        router.delete(`/admin/tenants/${tenant.id}`, {
            onSuccess: () => {
                setIsDeleting(false);
                router.visit('/admin/tenants');
            },
            onError: () => setIsDeleting(false)
        });
    };

    return (
        <>
            <Head title={`Tenant Details - ${tenant.name}`} />

            <div className="p-6 flex flex-col gap-6 text-foreground min-h-screen bg-background">
                {/* PAGE HEADER */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Tenant Details</h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Viewing detailed information and system status for {tenant.name}.
                        </p>
                    </div>

                    <Link
                        href="/admin/tenants"
                        className="h-9 px-4 bg-muted hover:bg-muted/80 border border-border text-foreground rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                    </Link>
                </div>

                {/* DETAILS CARD */}
                <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-border space-y-6">
                        <div className="mb-2">
                            <h2 className="text-base font-bold text-foreground">Tenant Profile</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                General company details and unique identifier.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-muted-foreground">Tenant ID</label>
                                <div className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-xs font-mono text-foreground">
                                    {formattedId}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-muted-foreground">Company Name</label>
                                <div className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-xs font-semibold text-foreground">
                                    {tenant.name}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-muted-foreground">Company Slug</label>
                                <div className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-xs font-mono text-muted-foreground">
                                    {tenant.slug}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-muted-foreground">Phone Number</label>
                                <div className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-xs text-foreground">
                                    {tenant.phone || '-'}
                                </div>
                            </div>

                            <div className="md:col-span-2 flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-muted-foreground">Address</label>
                                <div className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-xs text-foreground">
                                    {tenant.address || '-'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SUBSCRIPTION & USAGE STATUS */}
                    <div className="p-6 border-b border-border space-y-6">
                        <div className="mb-2">
                            <h2 className="text-base font-bold text-foreground">Subscription & Usage Status</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Current active subscription tier and resource allocation.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-muted-foreground">Current Plan Tier</label>
                                <div className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-xs font-medium text-foreground">
                                    {planName}{subStatus}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-muted-foreground">Total Registered Users</label>
                                <div className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-xs text-foreground flex items-center justify-between">
                                    <span className="font-mono">{usageCount} / 25 Users</span>
                                    <div className="w-32 bg-muted rounded-full h-2 overflow-hidden flex items-center">
                                        <div className="bg-primary h-2 rounded-full" style={{ width: `${usagePercent}%` }}></div>
                                    </div>
                                    <span className="text-[11px] font-mono text-muted-foreground">{usagePercent}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AUDIT TIMESTAMPS */}
                    <div className="p-6 border-b border-border space-y-6">
                        <div className="mb-2">
                            <h2 className="text-base font-bold text-foreground">Audit Timestamps</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Historical records of record creation and updates.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-muted-foreground">Registered Date</label>
                                <div className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-xs font-mono text-foreground">
                                    {tenant.created_at || '-'}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-muted-foreground">Last Updated Date</label>
                                <div className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-xs font-mono text-foreground">
                                    {tenant.updated_at || '-'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FOOTER ACTIONS */}
                    <div className="p-4 bg-muted/30 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="h-9 px-4 bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete Tenant</span>
                        </button>

                        <Link
                            href={`/admin/tenants/${tenant.id}/edit`}
                            className="h-9 px-4 bg-primary hover:bg-primary/95 text-primary-foreground rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                        >
                            <Pencil className="w-4 h-4" />
                            <span>Edit Tenant Data</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* MODAL KONFIRMASI HAPUS (Ditempatkan di luar container utama, tepat sebelum penutup fragmen </>) */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full overflow-hidden p-6 flex flex-col gap-5">
                        <div className="flex items-start justify-between">
                            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <h3 className="text-base font-bold text-foreground">
                                Hapus Tenant "{tenant.name}"?
                            </h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Tindakan ini bersifat permanen. Seluruh data dan informasi terkait tenant ini akan dihapus dari sistem.
                            </p>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="h-9 px-4 bg-muted hover:bg-muted/80 border border-border text-foreground rounded-lg text-xs font-medium transition-all cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={confirmDelete}
                                className="h-9 px-4 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                            >
                                <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus Tenant'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

TenantShow.layout = (page: React.ReactNode) => (
    <AppLayout
        children={page}
        breadcrumbs={[
            { title: 'Tenants Management', href: '/admin/tenants' },
            { title: 'Tenant Details', href: '#' },
        ]}
    />
);