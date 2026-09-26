import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    ChevronDown,
    PackageCheck,
    Plus,
    Truck,
    User,
    Users,
    X,
} from 'lucide-react';

interface CreateShippingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateShippingModal: React.FC<CreateShippingModalProps> = ({
    isOpen,
    onClose,
}) => {
    const { current_tenant, auth } = usePage().props as any;

    const currentPathSlug = window.location.pathname.split('/')[1];
    const tenantSlug = current_tenant?.slug || auth?.user?.tenant?.slug || currentPathSlug;

    // Dynamic Form States
    const [soReference, setSoReference] = useState<string>('');
    const [customerName, setCustomerName] = useState<string>('');
    const [dockBay, setDockBay] = useState<string>('DOCK-OUT-01');
    const [vehicleNo, setVehicleNo] = useState<string>('');
    const [vehicleType, setVehicleType] = useState<string>('');
    const [driverName, setDriverName] = useState<string>('');
    const [driverPhone, setDriverPhone] = useState<string>('');
    const [notes, setNotes] = useState<string>('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const targetManifestCode = soReference
            ? `TX-OUT-${soReference}`
            : `TX-OUT-${Math.floor(100000 + Math.random() * 900000)}`;

        toast.success(`Manifest Outbound ${targetManifestCode} berhasil diterbitkan di ${dockBay}!`);

        onClose();

        router.visit(`/${tenantSlug}/transactions/outbound/${targetManifestCode}`);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans animate-in fade-in duration-200">
            <div className="bg-card text-card-foreground border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-2xs">
                            <PackageCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-foreground tracking-tight">
                                Inisiasi Pengiriman Outbound SO Baru
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Registrasi Surat Jalan / Sales Order &amp; penunjukan Shipping Dock
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="font-semibold text-foreground">No. Sales Order (SO)</label>
                            <input
                                type="text"
                                value={soReference}
                                onChange={(e) => setSoReference(e.target.value)}
                                placeholder="Cth: SO-2026-001"
                                className="w-full h-9 px-3 bg-muted/50 hover:bg-card focus:bg-card border border-input focus:border-blue-600 rounded-lg text-foreground font-mono font-medium outline-none transition-all"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="font-semibold text-foreground">Pintu Shipping Dock</label>
                            <div className="relative">
                                <select
                                    value={dockBay}
                                    onChange={(e) => setDockBay(e.target.value)}
                                    className="w-full h-9 pl-3 pr-8 bg-muted/50 hover:bg-muted border border-input rounded-lg text-foreground font-mono font-bold outline-none cursor-pointer appearance-none"
                                >
                                    <option value="DOCK-OUT-01">DOCK-OUT-01 (Zona Kurir Express)</option>
                                    <option value="DOCK-OUT-02">DOCK-OUT-02 (Zona Container 20FT)</option>
                                    <option value="DOCK-OUT-03">DOCK-OUT-03 (Zona Truck Wingbox)</option>
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="font-semibold text-foreground">Nama Pelanggan / Customer</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="Nama Customer / Toko Penerima..."
                                className="w-full h-9 pl-9 pr-3 bg-muted/50 hover:bg-card focus:bg-card border border-input focus:border-blue-600 rounded-lg text-foreground font-medium outline-none transition-all"
                            />
                            <Users className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="font-semibold text-foreground">No. Polisi Armada</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={vehicleNo}
                                    onChange={(e) => setVehicleNo(e.target.value)}
                                    placeholder="Cth: B 9901 KLS"
                                    className="w-full h-9 pl-9 pr-3 bg-muted/50 hover:bg-card focus:bg-card border border-input focus:border-blue-600 rounded-lg text-foreground font-mono font-bold uppercase outline-none transition-all"
                                />
                                <Truck className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="font-semibold text-foreground">Jenis Kendaraan / Ekspedisi</label>
                            <input
                                type="text"
                                value={vehicleType}
                                onChange={(e) => setVehicleType(e.target.value)}
                                placeholder="Cth: Blind Van, Wingbox"
                                className="w-full h-9 px-3 bg-muted/50 hover:bg-card focus:bg-card border border-input focus:border-blue-600 rounded-lg text-foreground font-medium outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="font-semibold text-foreground">Nama Kurir / Driver</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={driverName}
                                    onChange={(e) => setDriverName(e.target.value)}
                                    placeholder="Nama supir pengirim..."
                                    className="w-full h-9 pl-9 pr-3 bg-muted/50 hover:bg-card focus:bg-card border border-input focus:border-blue-600 rounded-lg text-foreground font-medium outline-none transition-all"
                                />
                                <User className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="font-semibold text-foreground">No. HP Kurir</label>
                            <input
                                type="text"
                                value={driverPhone}
                                onChange={(e) => setDriverPhone(e.target.value)}
                                placeholder="Cth: 0812-3456-7890"
                                className="w-full h-9 px-3 bg-muted/50 hover:bg-card focus:bg-card border border-input focus:border-blue-600 rounded-lg text-foreground font-mono outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="font-semibold text-foreground">Instruksi Khusus Packing &amp; Shipping</label>
                        <input
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Cth: Fragile / Bubble wrap tebal..."
                            className="w-full h-8 px-3 bg-muted/50 hover:bg-card focus:bg-card border border-input rounded-lg text-foreground outline-none"
                        />
                    </div>

                    <div className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-9 px-4 bg-card hover:bg-muted border border-border rounded-lg text-xs font-semibold text-foreground transition-all cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="h-9 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Terbitkan Manifest &amp; Mulai Picking</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
