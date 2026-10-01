import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    Building2,
    ChevronDown,
    FileCheck2,
    Plus,
    Trash2,
    Truck,
    User,
    X,
} from 'lucide-react';

interface CreateManifestModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface SkuItemRow {
    id: string;
    sku: string;
    product_name: string;
    po_qty: number;
}

export const CreateManifestModal: React.FC<CreateManifestModalProps> = ({
    isOpen,
    onClose,
}) => {
    const { current_tenant, auth } = usePage().props as any;

    const currentPathSlug = window.location.pathname.split('/')[1];
    const tenantSlug = current_tenant?.slug || auth?.user?.tenant?.slug || currentPathSlug;

    // Mock Purchase Order DB Data for Auto-Load Demonstration
    const AVAILABLE_POS: Record<string, { supplier: string; items: SkuItemRow[] }> = {
        'PO-2026-001': {
            supplier: 'PT Indofood Sukses Makmur Tbk',
            items: [
                { id: '101', sku: 'SKU-8849', product_name: 'Indomie Goreng Spesial 85g', po_qty: 120 },
                { id: '102', sku: 'SKU-8850', product_name: 'Indomie Kuah Ayam Bawang 75g', po_qty: 80 },
            ],
        },
        'PO-2026-002': {
            supplier: 'PT Mayora Indah Tbk',
            items: [
                { id: '201', sku: 'SKU-7721', product_name: 'Kopiko 78c Coffee Drink 240ml', po_qty: 200 },
                { id: '202', sku: 'SKU-7722', product_name: 'Torabika Cappuccino 25g (Pack 10)', po_qty: 150 },
            ],
        },
        'PO-2026-003': {
            supplier: 'PT Unilever Indonesia Tbk',
            items: [
                { id: '301', sku: 'SKU-3310', product_name: 'Sabun Lifebuoy Total 10 110g', po_qty: 300 },
                { id: '302', sku: 'SKU-3311', product_name: 'Pepsodent Herbal 190g', po_qty: 180 },
            ],
        },
    };

    // Master SKU database list for selection
    const MASTER_SKUS = [
        { sku: 'SKU-8849', product_name: 'Indomie Goreng Spesial 85g' },
        { sku: 'SKU-8850', product_name: 'Indomie Kuah Ayam Bawang 75g' },
        { sku: 'SKU-7721', product_name: 'Kopiko 78c Coffee Drink 240ml' },
        { sku: 'SKU-7722', product_name: 'Torabika Cappuccino 25g (Pack 10)' },
        { sku: 'SKU-3310', product_name: 'Sabun Lifebuoy Total 10 110g' },
        { sku: 'SKU-3311', product_name: 'Pepsodent Herbal 190g' },
        { sku: 'SKU-9901', product_name: 'Bonus Sample Supplier (Unplanned)' },
    ];

    // Form States
    const [poReference, setPoReference] = useState<string>('PO-2026-001');
    const [supplierName, setSupplierName] = useState<string>(AVAILABLE_POS['PO-2026-001'].supplier);
    const [dockBay, setDockBay] = useState<string>('BAY-01');
    const [vehicleNo, setVehicleNo] = useState<string>('B 9382 UXZ');
    const [vehicleType, setVehicleType] = useState<string>('Wingbox 20T');
    const [notes, setNotes] = useState<string>('');

    // Pre-defined Expected SKU items for Mobile Operator Scan (Auto-loaded from PO-2026-001 by default)
    const [skuItems, setSkuItems] = useState<SkuItemRow[]>(AVAILABLE_POS['PO-2026-001'].items);

    if (!isOpen) return null;

    // Handle PO selection & Auto-load items
    const handlePoChange = (selectedPo: string) => {
        setPoReference(selectedPo);
        if (selectedPo && AVAILABLE_POS[selectedPo]) {
            setSupplierName(AVAILABLE_POS[selectedPo].supplier);
            setSkuItems(AVAILABLE_POS[selectedPo].items);
            toast.success(`Data PO ${selectedPo} & ${AVAILABLE_POS[selectedPo].items.length} item otomatis dimuat!`);
        } else {
            setSupplierName('');
            setSkuItems([]);
        }
    };

    const handleAddSkuRow = () => {
        const newId = String(Date.now());
        const defaultMaster = MASTER_SKUS[6]; // Bonus item
        setSkuItems([
            ...skuItems,
            { id: newId, sku: defaultMaster.sku, product_name: defaultMaster.product_name, po_qty: 10 },
        ]);
        toast.info('Baris barang ekstra / bonus ditambahkan.');
    };

    const handleRemoveSkuRow = (id: string) => {
        if (skuItems.length === 1) {
            toast.error('Manifest harus memiliki minimal 1 item barang!');
            return;
        }
        setSkuItems(skuItems.filter((it) => it.id !== id));
    };

    const handleSelectSkuForBonusRow = (id: string, selectedSkuCode: string) => {
        const matched = MASTER_SKUS.find((m) => m.sku === selectedSkuCode);
        setSkuItems(
            skuItems.map((it) =>
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
        setSkuItems(
            skuItems.map((it) => (it.id === id ? { ...it, po_qty: qty } : it)),
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const targetManifestCode = poReference
            ? `TX-INB-${poReference}`
            : `TX-INB-${Math.floor(100000 + Math.random() * 900000)}`;

        toast.success(`Manifest Inbound ${targetManifestCode} berhasil diinisiasi (${skuItems.length} SKU Registered)!`);

        onClose();

        // Navigate to the receiving workspace
        router.visit(`/${tenantSlug}/transactions/inbound/${targetManifestCode}`);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans animate-in fade-in duration-200">
            <div className="bg-card text-card-foreground border border-border rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-2xs">
                            <FileCheck2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-foreground tracking-tight">
                                Inisiasi Manifest Inbound PO Baru
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Tarik data PO resmi &amp; registrasi kedatangan armada supplier
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
                    {/* Referensi PO & Dock Bay */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="font-semibold text-foreground flex items-center gap-1.5">
                                <span>Pilih Dokumen PO</span>
                                <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold px-1.5 py-0.5 rounded">Auto-Load</span>
                            </label>
                            <div className="relative">
                                <select
                                    value={poReference}
                                    onChange={(e) => handlePoChange(e.target.value)}
                                    className="w-full h-9 pl-3 pr-8 bg-muted/50 hover:bg-muted border border-input rounded-lg text-foreground font-mono font-bold outline-none cursor-pointer appearance-none"
                                >
                                    <option value="PO-2026-001">PO-2026-001 (PT Indofood)</option>
                                    <option value="PO-2026-002">PO-2026-002 (PT Mayora)</option>
                                    <option value="PO-2026-003">PO-2026-003 (PT Unilever)</option>
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="font-semibold text-foreground">Pintu Dock Unloading</label>
                            <div className="relative">
                                <select
                                    value={dockBay}
                                    onChange={(e) => setDockBay(e.target.value)}
                                    className="w-full h-9 pl-3 pr-8 bg-muted/50 hover:bg-muted border border-input rounded-lg text-foreground font-mono font-bold outline-none cursor-pointer appearance-none"
                                >
                                    <option value="BAY-01">Pintu Depan / BAY-01 (Default)</option>
                                    <option value="BAY-02">BAY-02 (Zona Fast-Moving)</option>
                                    <option value="BAY-03">BAY-03 (Zona High Density)</option>
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Supplier Name */}
                    <div className="flex flex-col gap-1.5">
                        <label className="font-semibold text-foreground">Pemasok / Supplier (Otomatis Terisi)</label>
                        <div className="relative">
                            <input
                                type="text"
                                readOnly
                                value={supplierName}
                                className="w-full h-9 pl-9 pr-3 bg-muted/60 text-muted-foreground border border-input rounded-lg font-medium outline-none cursor-not-allowed"
                            />
                            <Building2 className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
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
                                    placeholder="Cth: B 9382 UXZ"
                                    className="w-full h-9 pl-9 pr-3 bg-muted/50 hover:bg-card focus:bg-card border border-input focus:border-blue-600 rounded-lg text-foreground font-mono font-bold uppercase outline-none transition-all"
                                />
                                <Truck className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="font-semibold text-foreground">Jenis Kendaraan</label>
                            <input
                                type="text"
                                value={vehicleType}
                                onChange={(e) => setVehicleType(e.target.value)}
                                placeholder="Cth: Wingbox 20T, Box Container"
                                className="w-full h-9 px-3 bg-muted/50 hover:bg-card focus:bg-card border border-input focus:border-blue-600 rounded-lg text-foreground font-medium outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Expected Item SKUs for Mobile Operator Reference */}
                    <div className="border border-border rounded-xl p-3 bg-muted/30 flex flex-col gap-2.5">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="font-bold text-foreground block">Daftar Barang Acuan PO (Auto-Loaded)</span>
                                <span className="text-[11px] text-muted-foreground">Admin tidak perlu ngetik manual, cukup verifikasi kuantitas</span>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddSkuRow}
                                className="h-7 px-2.5 bg-muted hover:bg-muted/80 text-foreground border border-input rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                                title="Tambah barang sampel/bonus dari supplier"
                            >
                                <Plus className="w-3.5 h-3.5 text-blue-600" />
                                <span>+ Barang Ekstra (Opsional)</span>
                            </button>
                        </div>

                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                            {skuItems.map((item) => (
                                <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-card border border-border p-2 rounded-lg shadow-2xs">
                                    {/* SKU Selector / Display */}
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
                                    {/* Qty Input */}
                                    <div className="col-span-2">
                                        <input
                                            type="number"
                                            min={1}
                                            value={item.po_qty}
                                            onChange={(e) => handleQtyChange(item.id, parseInt(e.target.value) || 1)}
                                            placeholder="Qty"
                                            className="w-full h-7 px-1.5 bg-background border border-input rounded text-center font-bold text-[11px] text-foreground"
                                        />
                                    </div>
                                    <div className="col-span-1 flex justify-center">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSkuRow(item.id)}
                                            className="text-muted-foreground hover:text-red-500 cursor-pointer p-1 transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Modal Footer Actions */}
                    <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-9 px-4 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-semibold cursor-pointer transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="h-9 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md cursor-pointer transition-all"
                        >
                            Inisiasi Manifest PO
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
