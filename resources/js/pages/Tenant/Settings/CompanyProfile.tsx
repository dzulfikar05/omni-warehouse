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
    Lock,
    Save,
    Image as ImageIcon,
} from 'lucide-react';

interface CompanyData {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
    phone: string | null;
    address: string | null;
}

export default function CompanyProfile({ company }: { company: CompanyData }) {
    const { flash, current_tenant } = usePage().props as any;
    const tenantSlug = current_tenant?.slug || company.slug;

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [previewLogo, setPreviewLogo] = useState<string | null>(company.logo);

    const { data, setData, post, processing, errors } = useForm({
        _method: 'POST',
        name: company.name || '',
        phone: company.phone || '',
        address: company.address || '',
        logo: null as File | null,
    });

    // Menampilkan toast tunggal dari Flash Session Laravel
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
    }, [flash?.success]);

    // Menyesuaikan preview jika props company.logo diperbarui dari server
    useEffect(() => {
        setPreviewLogo(company.logo);
    }, [company.logo]);

    // Handle Upload File Logo
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('logo', file);
            setPreviewLogo(URL.createObjectURL(file));
        }
    };

    // Handle Hapus Logo
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

    // Handle Submit Form Profile
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
                    description="Kelola informasi identitas perusahaan dan logo tenant Anda."
                />

                <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
                    {/* Card 1: Logo Management */}
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm text-card-foreground space-y-4">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <div>
                                <h2 className="text-sm font-bold text-foreground">
                                    Company Logo
                                </h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Upload logo tenant yang diproses via Spatie MediaLibrary.
                                </p>
                            </div>
                            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600">
                                <ImageIcon size={18} />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
                            {/* Box Preview Logo */}
                            <div className="h-28 w-28 rounded-2xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center shrink-0 overflow-hidden relative">
                                {previewLogo ? (
                                    <img
                                        src={previewLogo}
                                        alt="Company Logo"
                                        className="h-full w-full object-contain p-2"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                                        <Building2 size={28} />
                                        <span className="text-[10px] font-medium">No Logo</span>
                                    </div>
                                )}
                            </div>

                            {/* Tombol Aksi Logo */}
                            <div className="space-y-3 w-full">
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
                                        className="text-xs h-9 border-border rounded-xl gap-2"
                                    >
                                        <Upload size={14} /> Upload New Logo
                                    </Button>

                                    {previewLogo && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={handleRemoveLogo}
                                            className="text-xs h-9 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl gap-2"
                                        >
                                            <Trash2 size={14} /> Remove
                                        </Button>
                                    )}
                                </div>

                                <p className="text-[11px] text-muted-foreground">
                                    Format yang diperbolehkan: <strong>PNG, JPG, SVG</strong>. Ukuran maks: <strong>2MB</strong>.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Field Database Tenant */}
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm text-card-foreground space-y-5">
                        <div className="border-b border-border pb-3">
                            <h2 className="text-sm font-bold text-foreground">
                                Tenant Information
                            </h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Perbarui informasi sesuai dengan kolom database perusahaan.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Field: name */}
                            <div className="space-y-1.5">
                                <Label htmlFor="name" className="text-xs font-semibold">
                                    Company Name <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setData('name', e.target.value)}
                                        placeholder="Nama Perusahaan"
                                        required
                                        className="h-10 text-xs border-border bg-background rounded-xl"
                                    />
                                </div>
                                {errors.name && (
                                    <span className="text-xs text-destructive">{errors.name}</span>
                                )}
                            </div>

                            {/* Field: slug (Readonly) */}
                            <div className="space-y-1.5">
                                <Label htmlFor="slug" className="text-xs font-semibold">
                                    Tenant Slug
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="slug"
                                        value={company.slug}
                                        disabled
                                        className="pl-9 h-10 text-xs border-border bg-muted/50 font-mono text-muted-foreground rounded-xl cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Field: phone */}
                        <div className="space-y-1.5">
                            <Label htmlFor="phone" className="text-xs font-semibold">
                                Phone
                            </Label>
                            <div className="relative">
                                <Input
                                    id="phone"
                                    value={data.phone}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setData('phone', e.target.value)}
                                    placeholder="Nomor Telepon"
                                    className="h-10 text-xs border-border bg-background rounded-xl"
                                />
                            </div>
                            {errors.phone && (
                                <span className="text-xs text-destructive">{errors.phone}</span>
                            )}
                        </div>

                        {/* Field: address */}
                        <div className="space-y-1.5">
                            <Label htmlFor="address" className="text-xs font-semibold">
                                Address
                            </Label>
                            <div className="relative">
                                <Textarea
                                    id="address"
                                    rows={3}
                                    value={data.address}
                                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setData('address', e.target.value)}
                                    placeholder="Alamat Perusahaan..."
                                    className="text-xs border-border bg-background rounded-xl p-3"
                                />
                            </div>
                            {errors.address && (
                                <span className="text-xs text-destructive">{errors.address}</span>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="border-t border-border pt-4 flex justify-end">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2"
                            >
                                <Save size={16} />
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
