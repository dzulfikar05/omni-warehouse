import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    Building2,
    ChevronDown,
    PackageCheck,
    Plus,
    Trash2,
    Truck,
    User,
    Users,
    X,
} from 'lucide-react';

interface CreateShippingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface PickItemRow {
    id: string;
    sku: string;
    product_name: string;
    pick_qty: number;
}

export const CreateShippingModal: React.FC<CreateShippingModalProps> = ({
    isOpen,
    onClose,
}) => {
    const { current_tenant, auth } = usePage().props as any;

    const currentPathSlug = window.location.pathname.split('/')[1];
    const tenantSlug = current_tenant?.slug || auth?.user?.tenant?.slug || currentPathSlug;

    // Mock Sales Order (SO) DB Data for Auto-Load Demonstration
    const AVAILABLE_SOS: Record<string, { customer: string; driver: string; phone: string; vehicle: string; items: PickItemRow[] }> = {
        'SO-2026-001': {
            customer: 'Toko Rejeki Jaya (Retail Jakarta)',
            driver: 'Budi Santoso',
            phone: '0812-9876-5432',
            vehicle: 'B 9901 KLS (Blind Van)',
            items: [
                { id: '101', sku: 'SKU-8849', product_name: 'Indomie Goreng Spesial 85g', pick_qty: 50 },
                { id: '102', sku: 'SKU-7721', product_name: 'Kopiko 78c Coffee Drink 240ml', pick_qty: 24 },
            ],
        },
        'SO-2026-002': {
            customer: 'Kedai Kopi Cap Enak (FnB Bandung)',
            driver: 'Ahmad Hidayat',
            phone: '0813-1122-3344',
            vehicle: 'D 8421 ABC (L300 Box)',
            items: [
                { id: '201', sku: 'SKU-7722', product_name: 'Torabika Cappuccino 25g (Pack 10)', pick_qty: 30 },
                { id: '202', sku: 'SKU-8850', product_name: 'Indomie Kuah Ayam Bawang 75g', pick_qty: 40 },
            ],
        },
        'SO-2026-003': {
            customer: 'CV Gemilang Utama (Distributor Surabaya)',
            driver: 'Eko Prasetyo',
            phone: '0856-7788-9900',
            vehicle: 'L 9310 UXZ (Wingbox 10T)',
            items: [
                { id: '301', sku: 'SKU-3310', product_name: 'Sabun Lifebuoy Total 10 110g', pick_qty: 100 },
                { id: '302', sku: 'SKU-3311', product_name: 'Pepsodent Herbal 190g', pick_qty: 60 },
            ],
        },
    };

    // Master SKU database list for bonus item selection
    const MASTER_SKUS = [
        { sku: 'SKU-8849', product_name: 'Indomie Goreng Spesial 85g' },
        { sku: 'SKU-8850', product_name: 'Indomie Kuah Ayam Bawang 75g' },
        { sku: 'SKU-7721', product_name: 'Kopiko 78c Coffee Drink 240ml' },
        { sku: 'SKU-7722', product_name: 'Torabika Cappuccino 25g (Pack 10)' },
        { sku: 'SKU-3310', product_name: 'Sabun Lifebuoy Total 10 110g' },
        { sku: 'SKU-3311', product_name: 'Pepsodent Herbal 190g' },
        { sku: 'SKU-9901', product_name: 'Bonus Sample Customer (Promo Gift)' },
    ];

    // Dynamic Form States (Auto-loaded from SO-2026-001 by default)
    const [soReference, setSoReference] = useState<string>('SO-2026-001');
    const [customerName, setCustomerName] = useState<string>(AVAILABLE_SOS['SO-2026-001'].customer);
    const [dockBay, setDockBay] = useState<string>('DOCK-OUT-01');
    const [vehicleNo, setVehicleNo] = useState<string>('B 9901 KLS');
    const [vehicleType, setVehicleType] = useState<string>('Blind Van');
    const [driverName, setDriverName] = useState<string>(AVAILABLE_SOS['SO-2026-001'].driver);
    const [driverPhone, setDriverPhone] = useState<string>(AVAILABLE_SOS['SO-2026-001'].phone);
    const [notes, setNotes] = useState<string>('');

    // Required Pick Items for Mobile Picker
    const [pickItems, setPickItems] = useState<PickItemRow[]>(AVAILABLE_SOS['SO-2026-001'].items);

    if (!isOpen) return null;

    // Handle SO Selection & Auto-Load Data
    const handleSoChange = (selectedSo: string) => {
        setSoReference(selectedSo);
        if (selectedSo && AVAILABLE_SOS[selectedSo]) {
            const data = AVAILABLE_SOS[selectedSo];
            setCustomerName(data.customer);
            setDriverName(data.driver);
            setDriverPhone(data.phone);
            setPickItems(data.items);
            toast.success(`Data SO ${selectedSo} & ${data.items.length} item picking otomatis dimuat!`);
        } else {
            setCustomerName('');
            setDriverName('');
            setDriverPhone('');
            setPickItems([]);
        }
    };

    const handleAddPickRow = () => {
        const newId = String(Date.now());
        const defaultMaster = MASTER_SKUS[6]; // Bonus sample
        setPickItems([
            ...pickItems,
            { id: newId, sku: defaultMaster.sku, product_name: defaultMaster.product_name, pick_qty: 5 },
        ]);
        toast.info('Baris barang bonus / ekstra ditambahkan.');
    };

    const handleRemovePickRow = (id: string) => {
        if (pickItems.length === 1) {
            toast.error('Manifest Outbound harus memiliki minimal 1 item barang yang di-pick!');
            return;
        }
        setPickItems(pickItems.filter((it) => it.id !== id));
    };

    const handleSelectSkuForBonusRow = (id: string, selectedSkuCode: string) => {
        const matched = MASTER_SKUS.find((m) => m.sku === selectedSkuCode);
        setPickItems(
            pickItems.map((it) =>
                it.id === id
                    ? {
                          ...it,
                          sku: selectedSkuCode,
                          product_name: matched ? matched.product_name : it.product_name,
                      }
                    : it,
            ),
        );
    };

    const handleQtyChange = (id: string, qty: number) => {
        setPickItems(
            pickItems.map((it) => (it.id === id ? { ...it, pick_qty: qty } : it)),
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const targetManifestCode = soReference
            ? `TX-OUT-${soReference}`
            : `TX-OUT-${Math.floor(100000 + Math.random() * 900000)}`;

        toast.success(`Manifest Outbound ${targetManifestCode} berhasil diterbitkan di ${dockBay} (${pickItems.length} SKU to Pick)!`);

        onClose();

        router.visit(`/${tenantSlug}/transactions/outbound/${targetManifestCode}`);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans animate-in fade-in duration-200">
            <div className="bg-card text-card-foreground border border-border rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
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
                                Tarik data Sales Order (SO) &amp; alokasi item untuk Mobile Picker Gudang
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
                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 text-xs overflow-y-auto">
                    {/* Referensi SO & Dock Bay */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="font-semibold text-foreground flex items-center gap-1.5">
                                <span>Pilih Dokumen SO</span>
                                <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold px-1.5 py-0.5 rounded">Auto-Load</span>
                            </label>
                            <div className="relative">
                                <select
                                    value={soReference}
                                    onChange={(e) => handleSoChange(e.target.value)}
                                    className="w-full h-9 pl-3 pr-8 bg-muted/50 hover:bg-muted border border-input rounded-lg text-foreground font-mono font-bold outline-none cursor-pointer appearance-none"
                                >
                                    <option value="SO-2026-001">SO-2026-001 (Toko Rejeki)</option>
                                    <option value="SO-2026-002">SO-2026-002 (Kedai Cap Enak)</option>
                                    <option value="SO-2026-003">SO-2026-003 (CV Gemilang)</option>
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="font-semibold text-foreground">Pintu Shipping Dock</label>
                            <div className="relative">
                                <select
                                    value={dockBay}
                                    onChange={(e) => setDockBay(e.target.value)}
                                    className="w-full h-9 pl-3 pr-8 bg-muted/50 hover:bg-muted border border-input rounded-lg text-foreground font-mono font-bold outline-none cursor-pointer appearance-none"
                                >
                                    <option value="DOCK-OUT-01">Pintu Depan / DOCK-01 (Default)</option>
                                    <option value="DOCK-OUT-02">DOCK-OUT-02 (Zona Container 20FT)</option>
                                    <option value="DOCK-OUT-03">DOCK-OUT-03 (Zona Truck Wingbox)</option>
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Customer Name */}
                    <div className="flex flex-col gap-1.5">
                        <label className="font-semibold text-foreground">Nama Pelanggan / Customer (Otomatis Terisi)</label>
                        <div className="relative">
                            <input
                                type="text"
                                readOnly
                                value={customerName}
                                className="w-full h-9 pl-9 pr-3 bg-muted/60 text-muted-foreground border border-input rounded-lg font-medium outline-none cursor-not-allowed"
                            />
                            <Users className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>

                    {/* Required Pick Items (Acuan Mobile Picker) */}
                    <div className="border border-border rounded-xl p-3 bg-muted/30 flex flex-col gap-2.5">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="font-bold text-foreground block">Daftar Barang Wajib Pick (Auto-Loaded)</span>
                                <span className="text-[11px] text-muted-foreground">Barang yang harus diambil Petugas Mobile Picker di rak gudang</span>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddPickRow}
                                className="h-7 px-2.5 bg-muted hover:bg-muted/80 text-foreground border border-input rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                                title="Tambah barang ekstra/bonus promo customer"
                            >
                                <Plus className="w-3.5 h-3.5 text-blue-600" />
                                <span>+ Bonus Customer (Opsional)</span>
                            </button>
                        </div>

                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                            {pickItems.map((item) => (
                                <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-card border border-border p-2 rounded-lg shadow-2xs">
                                    {/* SKU Selector */}
                                    <div className="col-span-4">
                                        <select
                                            value={item.sku}
                                            onChange={(e) => handleSelectSkuForBonusRow(item.id, e.target.value)}
                                            className="w-full h-7 px-1.5 bg-background border border-input rounded text-mono font-bold text-[11px] text-foreground cursor-pointer"
                                        >
                                            {MASTER_SKUS.map((m) => (
                                                <option key={m.sku} value={m.sku}>
                                                    {m.sku}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {/* Product Name Display */}
                                    <div className="col-span-5">
                                        <input
                                            type="text"
                                            readOnly
                                            value={item.product_name}
                                            className="w-full h-7 px-2 bg-muted/50 border border-input rounded text-[11px] text-muted-foreground truncate"
                                        />
                                    </div>
                                    {/* Pick Qty Input */}
                                    <div className="col-span-2">
                                        <input
                                            type="number"
                                            min={1}
                                            value={item.pick_qty}
                                            onChange={(e) => handleQtyChange(item.id, parseInt(e.target.value) || 1)}
                                            placeholder="Qty"
                                            className="w-full h-7 px-1.5 bg-background border border-input rounded text-center font-bold text-[11px] text-foreground"
                                        />
                                    </div>
                                    <div className="col-span-1 flex justify-center">
                                        <button
                                            type="button"
                                            onClick={() => handleRemovePickRow(item.id)}
                                            className="text-muted-foreground hover:text-red-500 cursor-pointer p-1 transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Armada Grid */}
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

                    {/* Driver Grid */}
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

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-9 px-4 bg-card hover:bg-muted border border-border rounded-xl text-xs font-semibold text-foreground transition-all cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="h-9 px-5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                        >
                            <PackageCheck className="w-4 h-4" />
                            <span>Terbitkan Manifest Outbound</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

