START OPERASIONAL WMS
1. MASTER DATA & SETUP
(Web Console: Admin/Manager)
TRANSAKSI INBOUND
(Mobile App: Staf Gudang)

. Scan Barcode Barang/SKU
· Scan / Pilih Barcode Lokasi Rak
. Input Batch / Expiry (Opsional)
TRANSAKSI OUTBOND
(Mobile App: Staf Gudang)

. Terima Instruksi Order Pemenuhan
. Rekomendasi Rak via FEFO Engine
. Scan Barcode Barang untuk Validasi
TERSEDIA SINYAL?
Simpan Transaksi di Local SQLite
(True Offline - 0% Data Loss)
UPDATE/ ADD DATA LANGSUNG KE SERVER
Auto-Sync via WorkManager FIFO
(Sync Latency <= 2 Detik)

by Timestamps & Unique ID
STOCK TRANSFER & HANDOVER
(Antar Rak / Antar Gudang)

. Request Pindah Barang
. Scan Barang Out + Scan QR Handover
. Capture Photo & GPS Geotagged
AUDIT STOCK OPNAME
(Supervisor & Staf Gudang)

. Supervisor Buka Sesi Opname (Web)
. Staf Scan Fisik Barang (Mobile)
. Sistem Hitung Selisih (Discrepancy)
. Approval Adjust Stok oleh Supervisor
MONITORING & VALUATION
(Web Console: Manajemen)  
Single Table Inventory Dashboard 
• Laporan Nilai Persediaan Real-time 
• Immutable Audit Trail Log
END