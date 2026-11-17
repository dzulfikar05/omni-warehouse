USER STORY & SYSTEM SPECIFICATION (OMNIWAREHOUSE)

EPIC 1: Manajemen Pengguna & Hak Akses (RBAC)
US-101: Login Pengguna Multi-Platform
Status: Core MVP
User Story: Sebagai pengguna OmniWarehouse (Staf/Supervisor/Manager), saya ingin melakukan login menggunakan akun yang diberikan, sehingga saya dapat mengakses platform yang sesuai (Mobile App / Web Console) dengan peran saya.
Kriteria Penerimaan:
Pengguna memasukkan kredensial valid (Username/Email & Password). Sistem mengautentikasi dan mengarahkan Staf Gudang ke Mobile App (Flutter), serta Supervisor/Manager ke Web Console (Next.js).
Jika kredensial salah, sistem menampilkan pesan error "Kredensial tidak valid".
US-102: Role-Based Access Control (RBAC)
Status: Core MVP
User Story: Sebagai pengelola sistem, saya ingin membatasi hak akses pengguna berdasarkan 3 peran utama (Admin/Manager, Supervisor, Staf Gudang), sehingga operasional gudang dan data keuangan tetap terproteksi.
Kriteria Penerimaan:
Role Staf Gudang (Mobile App Only): Akses ke Inbound, Outbound, Stock Transfer, Stock Opname, Barcode Scanner Engine, dan Offline Sync Queue.
Role Supervisor Gudang (Web Console & Mobile): Akses ke Approval Transaksi, Management Sesi Stock Opname, Discrepancy Reconciliation, FEFO Configuration, dan QC/Triage.
Role Admin / Manager / Finance (Web Console Only): Akses ke Master Data (Produk, SKU, Gudang, Rak), User Access Management, Single Table Inventory Dashboard, Real-Time Valuation, dan Immutable Audit Trail.
Pengguna yang mencoba mengakses fitur di luar perannya akan ditolak secara otomatis oleh server NestJS (Forbidden 403).
EPIC 2: Mobile Plain Interface (Staf Gudang)
US-201: Single-Screen Core Action (Plain UI)
Status: Core MVP
User Story: Sebagai Staf Gudang, saya ingin menjalankan transaksi operasional utama dari satu layar mobile yang ergonomis, sehingga saya dapat bekerja dengan cepat tanpa navigasi menu yang rumit.
Kriteria Penerimaan:
Halaman utama Mobile App (Flutter) menampilkan 3 tombol aksi utama: Scan Barcode, AI Voice Command, dan Status Sinkronisasi.
Memilih Scan langsung membuka kamera untuk pemindaian instan ($\le 1$ detik).
Memilih AI Voice membuka antarmuka perintah suara.
US-202: Indikator Status Sinkronisasi Jaringan
Status: Core MVP
User Story: Sebagai Staf Gudang, saya ingin melihat indikator status koneksi dan antrean data lokal secara real-time, sehingga saya tahu apakah data sudah terkirim ke server pusat atau masih tersimpan di HP.
Kriteria Penerimaan:
Online & Terkirim: Indikator berwarna hijau menampilkan "Tersinkronisasi".
Offline Mode: Indikator berwarna kuning/abu-abu menampilkan status "Offline" beserta jumlah antrean data di SQLite (misal: "3 Antrean Menunggu").
Setelah sinkronisasi selesai, jumlah antrean otomatis kembali ke $0$.
EPIC 3: True Offline-First & Auto-Synchronization
US-301: Pencatatan Transaksi Saat Offline (SQLite Local DB)
Status: Fitur Unggulan Utama (Killer Feature)
User Story: Sebagai Staf Gudang, saya ingin tetap dapat melakukan transaksi penerimaan, pengeluaran, dan opname saat berada di area blank spot (tanpa sinyal), sehingga operasional pergudangan tidak terhenti.
Kriteria Penerimaan:
Saat perangkat offline, seluruh pembuatan transaksi tetap berhasil diproses tanpa lag.
Transaksi lokal otomatis diberi kode unik UUID dan Timestamp presisi tinggi, lalu disimpan pada database lokal SQLite.
Sistem menjamin $0\%$ Transaction Loss (hingga 5.000 data transaksi lokal).
US-302: Sinkronisasi Otomatis Berbasis FIFO (WorkManager)
Status: Core MVP
User Story: Sebagai Staf Gudang, saya ingin data transaksi offline otomatis terkirim ke server begitu koneksi internet pulih, tanpa perlu menekan tombol sinkronisasi manual.
Kriteria Penerimaan:
Ketika koneksi terhubung kembali, WorkManager di latar belakang otomatis mengirim data ke NestJS API secara berurutan (First In, First Out / FIFO).
Sync Latency ditargetkan $\le 2$ detik untuk pemrosesan antrean standar.
Jika sinkronisasi gagal karena koneksi terputus kembali, data tetap aman tersimpan di SQLite dan sistem akan mencoba ulang (retry mechanism) secara otomatis.
US-303: Stock Conflict Handling & Invariant UUID
Status: Core MVP
User Story: Sebagai pengelola sistem, saya ingin server dapat mendeteksi transaksi ganda atau konflik stok akibat pengiriman antrean offline, sehingga data persediaan di PostgreSQL tetap konsisten.
Kriteria Penerimaan:
Server NestJS memvalidasi setiap transaksi masuk menggunakan UUID. Jika UUID sudah pernah tercatat di PostgreSQL, server menolak duplikasi (Idempotent API Processing).
Jika terjadi selisih urutan waktu transaksi lokal, server menggunakan algoritma Timestamp Conflict Resolution untuk menentukan saldo stok akhir yang valid.
EPIC 4: AI Capabilities & Smart Input (Add-on Tier)
US-401: Input Transaksi via AI Voice Command
Status: Premium Add-on
User Story: Sebagai Staf Gudang, saya ingin menyebutkan perintah transaksi menggunakan suara, sehingga saya dapat menginput data secara hands-free saat membawa barang fisik.
Kriteria Penerimaan:
Staf menekan tombol AI Voice dan mengucapkan perintah (contoh: "Masuk 10 kotak Modem Fiber di Rak A1").
Engine AI on-device mengekstrak perintah ($\le 1.5$ detik) menjadi format terstruktur:
Action: Inbound
Quantity: 10
Item: Modem Fiber
Location: Rak A1
Hasil ekstraksi ditampilkan di layar untuk dikonfirmasi staf sebelum disimpan. Akurasi pengenalan perintah suara $\ge 90\%$.
US-402: AI Visual & OCR Scanner Fallback
Status: Premium Add-on
User Story: Sebagai Staf Gudang, saya ingin memindai nomor seri fisik barang menggunakan kamera OCR ketika barcode atau QR code dalam kondisi tergores/rusak.
Kriteria Penerimaan:
Jika pemindaian barcode gagal, staf mengaktifkan OCR Scanner Engine (Google ML Kit).
Kamera mengenali dan mengekstrak teks Serial Number atau kode fisik barang secara otomatis.
Staf dapat mengonfirmasi atau mengedit teks hasil OCR jika terdapat ketidaksesuaian sebelum membuat transaksi.
EPIC 5: Core WMS Operations (Inbound, Outbound, Transfer & FEFO)
US-501: Pencatatan Barang Masuk (Inbound)
Status: Core MVP
User Story: Sebagai Staf Gudang, saya ingin memindai barang masuk dan menentukan lokasi simpan raknya, sehingga jumlah persediaan bertambah secara akurat.
Kriteria Penerimaan:
Staf memindai SKU/Barcode barang dan memindai Barcode Lokasi Rak tujuan.
Mengisi kuantitas barang, nomor batch, atau expiry date (opsional untuk Pro Tier).
Setelah transaksi dikonfirmasi, stok lokal/server bertambah dan riwayat mutasi tercatat.
US-502: Pencatatan Barang Keluar (Outbound) & FEFO Guidance
Status: Core MVP & Pro Tier
User Story: Sebagai Staf Gudang, saya ingin mendapatkan petunjuk lokasi barang yang harus diambil berdasarkan urutan kedaluwarsa (FEFO), sehingga barang tidak kedaluwarsa di gudang.
Kriteria Penerimaan:
Saat membuka instruksi Outbound, sistem secara otomatis memberikan panduan lokasi rak (FEFO Picking Guidance) yang memiliki expiry date paling dekat.
Staf memindai barcode barang pada rak tersebut untuk konfirmasi pengambilan. Jika stok mencukupi, transaksi memotong saldo persediaan secara otomatis.
US-503: Transfer Stok & Two-Way Handover Validation
Status: Pro Tier
User Story: Sebagai Staf Gudang, saya ingin memindahkan stok antar-rak atau antar-gudang menggunakan pemindaian verifikasi ganda, sehingga tanggung jawab mutasi barang tercatat secara transparan.
Kriteria Penerimaan:
Staf pengirim memindai barang yang dipindahkan dan menampilkan QR dinamis penyerahan di layar HP.
Staf penerima memindai QR dinamis tersebut serta melampirkan bukti foto fisik & lokasi GPS (Geotagged Proof of Delivery).
Lokasi barang di sistem resmi diperbarui ke lokasi rak/gudang yang baru.
EPIC 6: Stock Opname & Discrepancy Reconciliation
US-601: Audit Persediaan Fisik (Blind Stock Opname)
Status: Core MVP
User Story: Sebagai Supervisor Gudang, saya ingin membuka sesi audit stok fisik di mana staf memindai persediaan tanpa melihat jumlah stok sistem terlebih dahulu, sehingga hasil penghitungan bersifat obyektif.
Kriteria Penerimaan:
Supervisor membuka sesi Stock Opname area/rak tertentu melalui Web Console.
Staf Gudang mengelilingi rak membawa Mobile App (tetap bekerja di area blank spot) untuk memindai seluruh barang fisik.
Sistem membandingkan hasil hitungan fisik dengan catatan sistem dan menandai item yang "Sesuai" atau "Selisih (Discrepancy)".
US-602: Discrepancy Reconciliation & Stock Adjustment
Status: Core MVP
User Story: Sebagai Supervisor Gudang, saya ingin mengevaluasi dan melakukan penyesuaian stok (adjustment) atas hasil selisih opname, sehingga data sistem kembali cocok dengan fisik.
Kriteria Penerimaan:
Supervisor membuka laporan Discrepancy Alert di Web Console yang menampilkan jumlah stok sistem, hitungan fisik, dan selisih nilainya.
Supervisor memasukkan alasan penyesuaian dan memberikan persetujuan (Approval).
Sistem memperbarui saldo stok pusat dan mencatat tindakan adjustment secara permanen di Audit Trail.
EPIC 7: Management Dashboard, Valuation & Audit Trail
US-701: Single Table Inventory & Executive Dashboard
Status: Core MVP
User Story: Sebagai Manajemen / Supervisor, saya ingin melihat kondisi persediaan barang terpusat dan indikator performa utama (KPI) dalam satu dashboard Web Console, sehingga saya dapat mengambil keputusan bisnis dengan cepat.
Kriteria Penerimaan:
Dashboard menampilkan Single Table Inventory yang dapat difilter instan berdasarkan SKU, lokasi gudang/rak, batch, atau status barang.
Menampilkan Executive Summary: Total nilai aset persediaan (Real-time Valuation), total item, indikator Low Stock Alert, dan pergerakan Inbound/Outbound.
US-702: Immutable Audit Trail Log
Status: Core MVP
User Story: Sebagai Pihak Manajemen / Auditor, saya ingin melihat seluruh riwayat aktivitas transaksi gudang dalam catatan log yang tidak dapat diubah atau dihapus (immutable), sehingga memudahkan proses pemeriksaan dan audit digital.
Kriteria Penerimaan:
Setiap perubahan data (Inbound, Outbound, Transfer, Opname, Adjustment) secara otomatis mencatat ID Pengguna, Timestamp, Alamat IP/GPS, Jenis Transaksi, dan Perubahan Saldo.
Sistem tidak menyediakan fitur Delete atau Edit pada histori Audit Trail (hanya Read-Only).
Data Audit Trail dapat difilter dan diekspor ke dalam format Excel (.xlsx) atau PDF untuk laporan formal.


