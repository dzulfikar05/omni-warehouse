import React, { useRef, useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { PageHeader } from '@/components/page-header';
import {
    Building2,
    Upload,
    Trash2,
    Phone,
    Save,
    Image as ImageIcon,
    Mail,
    FileCheck,
    Link2,
} from 'lucide-react';

interface CompanyData {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
    phone: string | null;
    email: string | null;
    tax_number: string | null;
    address: string | null;
}

export default function CompanyProfile({ company }: { company: CompanyData }) {
    const { flash, current_tenant } = usePage().props as any;
    const tenantSlug = current_tenant?.slug || company.slug;

    // Mengambil baseUrl dari ENV (VITE_APP_URL) atau dari origin browser saat ini
    const baseUrl = import.meta.env.VITE_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost');

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [previewLogo, setPreviewLogo] = useState<string | null>(company.logo);

    const { data, setData, post, processing, errors } = useForm({
        _method: 'POST',
        name: company.name || '',
        slug: company.slug || '',
        phone: company.phone || '',
        email: company.email || '',
        tax_number: company.tax_number || '',
        address: company.address || '',
        logo: null as File | null,
    });

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
    }, [flash?.success]);

    useEffect(() => {
        setPreviewLogo(company.logo);
    }, [company.logo]);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('logo', file);
            setPreviewLogo(URL.createObjectURL(file));
        }
    };

    const handleRemoveLogo = () => {
        if (confirm('Apakah Anda yakin ingin menghapus logo ini?')) {
            router.delete(`/${tenantSlug}/settings/company-profile/logo`, {
                onSuccess: () => {
                    setPreviewLogo(null);
                    setData('logo', null);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                },
            });
        }
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(`/${tenantSlug}/settings/company-profile`, {
            forceFormData: true,
        });
    };

    return (
        <>
            <Head title={`Company Profile - ${company.name}`} />

            <div className="space-y-6 p-4">
                <PageHeader
                    title="Company Profile"
                    description="Kelola informasi identitas legalitas perusahaan, logo, dan URL domain tenant Anda."
                />

                <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
                    {/* Card 1: Logo Management */}
                    <div className="rounded-xl border border-border bg-card p-5 shadow-xs text-card-foreground space-y-4">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <div>
                                <h2 className="text-sm font-semibold text-foreground">
                                    Company Logo
                                </h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Upload logo tenant resmi untuk dasbor dan header laporan cetak.
                                </p>
                            </div>
                            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                                <ImageIcon size={18} />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-5 pt-1">
                            <div className="h-24 w-24 rounded-xl border border-dashed border-border bg-muted/20 flex items-center justify-center shrink-0 overflow-hidden relative">
                                {previewLogo ? (
                                    <img
                                        src={previewLogo}
                                        alt="Company Logo"
                                        className="h-full w-full object-contain p-2"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                                        <Building2 size={24} />
                                        <span className="text-[10px]">No Logo</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2.5 w-full">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/png, image/jpeg, image/jpg, image/svg+xml"
                                    className="hidden"
                                />

                                <div className="flex flex-wrap items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-xs h-8 rounded-lg gap-1.5"
                                    >
                                        <Upload size={14} /> Upload Logo
                                    </Button>

                                    {previewLogo && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={handleRemoveLogo}
                                            className="text-xs h-8 text-destructive hover:bg-destructive/10 rounded-lg gap-1.5"
                                        >
                                            <Trash2 size={14} /> Remove
                                        </Button>
                                    )}
                                </div>

                                <p className="text-[11px] text-muted-foreground">
                                    Format: <strong>PNG, JPG, SVG</strong> (Maks: 2MB)
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Tenant Information */}
                    <div className="rounded-xl border border-border bg-card p-5 shadow-xs text-card-foreground space-y-4">
                        <div className="border-b border-border pb-3">
                            <h2 className="text-sm font-semibold text-foreground">
                                Tenant & Portal Information
                            </h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Detail legalitas, informasi kontak, dan alamat URL portal tenant.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Field: Company Name */}
                            <div className="space-y-1.5">
                                <Label htmlFor="name" className="text-xs font-medium">
                                    Company Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="PT. Logistik Jaya Abadi"
                                    required
                                    className="h-9 text-xs bg-background rounded-lg"
                                />
                                {errors.name && <span className="text-[11px] text-destructive">{errors.name}</span>}
                            </div>

                            {/* Field: Tenant Slug (Editable Website/URL Identifier) */}
                            <div className="space-y-1.5">
                                <Label htmlFor="slug" className="text-xs font-medium">
                                    Tenant Portal Slug (URL Identifier) <span className="text-destructive">*</span>
                                </Label>
                                <div className="relative">
                                    <Link2 className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input
                                        id="slug"
                                        value={data.slug}
                                        onChange={(e) =>
                                            setData(
                                                'slug',
                                                e.target.value
                                                    .toLowerCase()
                                                    .replace(/\s+/g, '-')
                                                    .replace(/[^a-z0-9-]/g, '')
                                            )
                                        }
                                        placeholder="demo-tenant"
                                        required
                                        className="pl-8 h-9 text-xs bg-background font-mono rounded-lg"
                                    />
                                </div>
                                <p className="text-[11px] text-muted-foreground">
                                    URL Portal: <code className="text-blue-600 dark:text-blue-400 font-mono">{baseUrl}/{data.slug || 'slug'}</code>
                                </p>
                                {errors.slug && <span className="text-[11px] text-destructive">{errors.slug}</span>}
                            </div>

                            {/* Field: Phone */}
                            <div className="space-y-1.5">
                                <Label htmlFor="phone" className="text-xs font-medium">
                                    Phone Number
                                </Label>
                                <div className="relative">
                                    <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="+62 812-3456-7890"
                                        className="pl-8 h-9 text-xs bg-background rounded-lg"
                                    />
                                </div>
                                {errors.phone && <span className="text-[11px] text-destructive">{errors.phone}</span>}
                            </div>

                            {/* Field: Official Email */}
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-xs font-medium">
                                    Official Email
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="contact@company.com"
                                        className="pl-8 h-9 text-xs bg-background rounded-lg"
                                    />
                                </div>
                                {errors.email && <span className="text-[11px] text-destructive">{errors.email}</span>}
                            </div>

                            {/* Field: Tax Number (NPWP) */}
                            <div className="space-y-1.5 sm:col-span-2">
                                <Label htmlFor="tax_number" className="text-xs font-medium">
                                    NPWP / Tax ID
                                </Label>
                                <div className="relative">
                                    <FileCheck className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input
                                        id="tax_number"
                                        value={data.tax_number}
                                        onChange={(e) => setData('tax_number', e.target.value)}
                                        placeholder="01.234.567.8-901.000"
                                        className="pl-8 h-9 text-xs bg-background font-mono rounded-lg"
                                    />
                                </div>
                                {errors.tax_number && <span className="text-[11px] text-destructive">{errors.tax_number}</span>}
                            </div>
                        </div>

                        {/* Field: Address */}
                        <div className="space-y-1.5">
                            <Label htmlFor="address" className="text-xs font-medium">
                                Complete Address
                            </Label>
                            <Textarea
                                id="address"
                                rows={3}
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                placeholder="Jl. Raya Boulevard No. 123, Jakarta..."
                                className="text-xs bg-background rounded-lg p-2.5"
                            />
                            {errors.address && <span className="text-[11px] text-destructive">{errors.address}</span>}
                        </div>

                        {/* Submit Action */}
                        <div className="border-t border-border pt-3.5 flex justify-end">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-5 h-9 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                            >
                                <Save size={15} />
                                {processing ? 'Saving...' : 'Save Profile'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

CompanyProfile.layout = {
    breadcrumbs: [
        { title: 'Settings', href: '#' },
        { title: 'Company Profile', href: '#' },
    ],
};
