DAFTAR FITUR WEB CONSOLE
Target User: Super Admin, Warehouse Manager, Supervisor, & Finance (Management)

A. Manajemen Master Data & Konfigurasi
User & Role Management (RBAC): Menambah, mengedit, dan mengelola akun serta hak akses peran (Admin, Supervisor, Staf Gudang).
Master Product & SKU Management: Mengelola katalog barang, kategori, kode SKU, atribut unit/kemasan, dan kriteria pencatatan.
Multi-Warehouse Setup: Pendaftaran dan konfigurasi denah banyak gudang fisik dalam satu akun platform.
Multi-Location & Rak Structure: Pengaturan hierarki area penyimpanan (Zona, Lorong, Rak, Level, dan Bin).
Custom QR Label Generator: Pembuatan dan pencetakan label barcode/QR custom (format PDF/Thermal) untuk barang tanpa kode bawaan.

B. Pengawasan Transaksi & Pengendalian Operasional
Inbound & Outbound Order Management: Pembuatan dan penerbitan instruksi perintah barang masuk (PO/Receiving) dan barang keluar (Picking List).
Stock Transfer Approval: Pengajuan dan persetujuan mutasi barang antar-rak maupun antar-gudang.
Stock Opname Session Management: Pembukaan dan penutupan sesi audit persediaan fisik (Stock Opname).
Discrepancy Reconciliation & Approval: Evaluasi dan persetujuan penyesuaian (adjustment) jika terjadi selisih stok antara hitungan fisik dan catatan sistem.

C. Pelaporan, Analitik & Audit
Single Table Inventory Dashboard: Visualisasi persediaan terpusat dengan fitur filter/search instan berdasarkan lokasi rak, nomor seri, batch, dan status barang.
Real-time Inventory Valuation: Laporan estimasi total nilai persediaan barang berbasis perhitungan aktual.
Immutable Audit Trail Log: Catatan histori pergerakan stok yang tidak dapat diubah untuk kebutuhan pemeriksaan/audit digital.
Smart Insights & Forecasting (Roadmap Add-on): Analitik prediksi kebutuhan stok (reorder point) dan deteksi anomali mutasi barang.
DAFTAR FITUR MOBILE APP 
Target User: Staf Operasional Gudang & Supervisor Lapangan

A. Pemindaian & Identification Engine
Barcode-First Scanner Engine: Pemindaian instan kode Barcode/QR menggunakan kamera smartphone dengan respon cepat.
AI Visual & OCR Fallback Scanner (Add-on): Ekstraksi teks otomatis via Google ML Kit untuk membaca nomor seri atau label fisik yang rusak/tergores.
AI Voice Command (Add-on): Navigasi antarmuka dan instruksi perintah input data berbasis suara on-device (<=3 detik).

B. Eksekusi Transaksi Lapangan
Inbound Receiving (Barang Masuk): Pemindaian barang masuk, verifikasi jumlah, dan penetapan lokasi simpan rak (bekerja 100% offline).
Outbound Picking (Barang Keluar): Eksekusi pengeluaran barang berbasis urutan order.
FEFO Picking Guidance: Panduan navigasi otomatis di layar mobile yang mengarahkan staf ke lokasi rak dengan barang yang memiliki tanggal kedaluwarsa paling dekat.
Tracking Detail Capture: Input nomor seri unik (Serial Number), Batch Number, dan tanggal kedaluwarsa (Expiry Date).
Blind Count Stock Opname: Pencatatan fisik hitungan persediaan di lapangan tanpa menampilkan jumlah stok sistem terlebih dahulu untuk menjaga netralitas audit.

C. Core Engine & Offline Mechanics
True Offline Persistence: Penyimpanan seluruh catatan transaksi sementara di database SQLite lokal saat berada di area blank spot tanpa jaringan internet.
WorkManager FIFO Sync Queue: Antrean latar belakang yang mengirimkan data transaksi lokal secara otomatis ke server pusat (NestJS/PostgreSQL) segera setelah koneksi internet kembali pulih.
Timestamp Conflict Resolution: Mekanisme penanganan konflik data stok secara otomatis jika terdapat ganda transaksi offline.