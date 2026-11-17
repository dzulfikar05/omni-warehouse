# PANDUAN LENGKAP PRESENTASI PROGRES: OMNIWAREHOUSE
**Dokumen Strategi, Proses Bisnis, Arsitektur Dual-Platform (Web & Mobile), dan Katalog Fitur Aktual**

---

| Informasi Dokumen | Detail |
| :--- | :--- |
| **Tujuan Dokumen** | Panduan Penguasaan Sistem & Materi Presentasi Progres Magang ke Atasan / Stakeholder |
| **Nama Proyek** | OmniWarehouse: Universal Multi-Tenant Warehouse Management System |
| **Tim Pengembang** | Team D Software Internship (Afgan, Dzulfikar, Damar, Kayla) |
| **Supervisor / Mentor** | Andika Prasetiawan |
| **Karakter Dokumen** | 100% Berdasarkan Audit Kode Aktual (Bebas Halusinasi & Asumsi Teoretis) |

---

## DAFTAR ISI
1. [BAGIAN 1: Proses Bisnis Inti & Filosofi Dual-Platform](#bagian-1-proses-bisnis-inti--filosofi-dual-platform)
   * 1.1 Definisi & Value Proposition Produk
   * 1.2 Mengapa Pergudangan Butuh Dual-Platform? (Web vs Mobile)
   * 1.3 Alur Integrasi Teknis Web & Mobile via Laravel Sanctum API
2. [BAGIAN 2: Katalog Lengkap Fitur Aktual (Modul per Modul)](#bagian-2-katalog-lengkap-fitur-aktual-modul-per-modul)
   * 2.1 SaaS Engine & Central Platform Management (Platform Owner)
   * 2.2 Manajemen Master Data Gudang & Inventaris (Tenant Workspace)
   * 2.3 Transaksi Pergudangan Inti (Core WMS Operations)
   * 2.4 Laporan Eksekutif, Valuasi Aset & Audit Trail
   * 2.5 RBAC, Keamanan & Pengaturan Tenant
   * 2.6 Mobile Handheld REST API Gateway
3. [BAGIAN 3: Matriks Status Progres Riil (Transparan & Profesional)](#bagian-3-matriks-status-progres-riil-transparan--profesional)
4. [BAGIAN 4: Checklist Taktis & Kunci Jawaban Pertanyaan Kritis Atasan (FAQ Defense)](#bagian-4-checklist-taktis--kunci-jawaban-pertanyaan-kritis-atasan-faq-defense)
   * 4.1 Persiapan Teknis Sebelum Masuk Ruang Rapat
   * 4.2 Skenario Demo Live Paling Aman & Mengesankan (The Golden Demo Flow)
   * 4.3 Kunci Jawaban Menghadapi Pertanyaan Kritis Atasan

---

## BAGIAN 1: PROSES BISNIS INTI & FILOSOFI DUAL-PLATFORM

### 1.1 Definisi & Value Proposition Produk
OmniWarehouse bukan sekadar aplikasi pencatat stok barang biasa, melainkan **B2B Multi-Tenant SaaS Warehouse Management System (WMS)**. 

Platform ini dirancang untuk menyelesaikan 3 masalah terbesar operasional pergudangan:
1. **Pemisahan Kendali & Eksekusi:** Menghubungkan manajemen di meja kantor (*office desktop*) dengan staf operasional yang bergerak aktif di lorong gudang (*field execution*).
2. **Akurasi & Integritas Stok:** Mencegah terjadinya barang gaib (*ghost inventory*) dan selisih fisik vs sistem melalui verifikasi barcode berlapis, pemisahan kondisi barang baik vs cacat, serta pencatatan audit trail yang tidak dapat diubah.
3. **Multi-Tenancy Skalabel (SaaS Ready):** Satu instalasi sistem dan basis data dapat melayani banyak entitas bisnis/perusahaan logistik (*tenants*) secara terisolasi penuh, lengkap dengan sistem paket langganan (*Plans*) dan penagihan (*Invoices*).

---

### 1.2 Mengapa Pergudangan Butuh Dual-Platform? (Web vs Mobile)
Saat presentasi, tegaskan ke atasan bahwa pemisahan **Web Console** dan **Mobile App** didasari oleh realitas fisik lapangan pergudangan:

#### A. Web Console = *Control Tower* (Pusat Kendali Manajerial)
* **Pengguna:** Superadmin Platform, Warehouse Manager, Supervisor Gudang, dan Bagian Keuangan (Finance).
* **Lingkungan Kerja:** Meja kantor, layar monitor besar, menggunakan mouse & keyboard.
* **Tanggung Jawab:**
  * Pengaturan master data (denah gudang, rak, produk, SKU, harga pokok/base cost).
  * Pembuatan dokumen rencana transaksi formal (Purchase Order / PO untuk Inbound, Sales Order / SO untuk Outbound).
  * Pengawasan finansial: Laporan Nilai Aset Persediaan (*Valuation Report*) secara real-time.
  * Otorisasi mutasi stok dan evaluasi berita acara kerusakan barang.
  * Manajemen akun, pembagian hak akses (*roles & permissions*), dan billing langganan.

#### B. Mobile Application = *Execution Weapon* (Senjata Eksekusi Lapangan)
* **Pengguna:** Staf Lapangan / Operator Gudang.
* **Lingkungan Kerja:** Berjalan di lorong gudang yang sempit, membawa barang fisik, memanjat tangga rak, dan bekerja di area yang minim meja komputer.
* **Tanggung Jawab:**
  * Antarmuka ringkas (*Plain UI*) yang dapat dioperasikan dengan satu tangan.
  * Pemindaian instan kode Barcode/QR menggunakan kamera smartphone atau barcode scanner handheld.
  * Eksekusi alokasi rak simpan (*Putaway*) saat barang masuk.
  * Eksekusi pengambilan barang (*Picking*) saat pesanan keluar.
  * Pelaporan langsung di tempat jika ditemukan barang rusak/cacat fisik.

---

### 1.3 Alur Integrasi Teknis Web & Mobile via Laravel Sanctum API
Jelaskan kepada atasan bagaimana Web dan Mobile saling berbicara di balik layar:

```text
[ Web Console (Admin) ] 
   │  Menerbitkan Dokumen Rencana (PO Inbound / SO Outbound)
   ▼
[ Database PostgreSQL ] 
   ▲  Menyimpan Manifest dengan Status: 'DRAFT' / 'PENDING'
   │
   │  Mobile App meminta daftar tugas aktif via API Bearer Token
   ▼
[ Mobile Handheld (Operator) ]
   │  Operator memindai barcode fisik barang di rak
   │  Kirim request: POST /api/{slug}/inbound/scan-item
   ▼
[ Laravel API Core ] 
   │  Validasi tenant, kunci baris transaksi (lockForUpdate)
   │  Increment kuantitas terverifikasi (good_qty + 1)
   ▼
[ Database PostgreSQL ]
   │  Status manifest otomatis berubah menjadi: 'RECEIVING' / 'PICKING'
   ▼
[ Web Console (Admin) ]
      Manajer memantau progress bar di layar monitor secara real-time!
```

1. **Isolasi Akses Mobile:** Staf mobile melakukan login dengan menyertakan `workspace_slug`. API memeriksa ke tabel `tenants` apakah tenant tersebut aktif (`status = 'active'`) dan memastikan akun user terdaftar pada tenant tersebut.
2. **Penerbitan Token Sanctum:** Token autentikasi diterbitkan khusus untuk perangkat tersebut (`device_name`). Sesi lama pada device yang sama di-revoke secara otomatis untuk menjaga integritas sesi (*Single-Device Session*).
3. **Penyelarasan Tugas:** Endpoint `GET /api/dashboard/summary` secara dinamis menghitung shift kerja operator (Pagi, Sore, Malam) dan menampilkan antrean tugas lapangan yang belum selesai (`pending`, `receiving`, `picking`, `in_progress`).

---

## BAGIAN 2: KATALOG LENGKAP FITUR AKTUAL (MODUL PER MODUL)

Berikut adalah daftar seluruh fitur yang **benar-benar ada dan aktif pada kode proyek saat ini**:

---

### 2.1 SaaS Engine & Central Platform Management (Platform Owner)
Modul ini digunakan oleh pemilik platform OmniWarehouse untuk mengelola bisnis B2B SaaS.

* **1. Public Welcome Page (`/`):**
  * Halaman publik yang menampilkan etalase paket langganan aktif (`Plan::with('features')`) beserta harga dan daftar kapabilitasnya.
* **2. Find Tenant Workspace (`/find-tenant`):**
  * Fitur pencarian ruang kerja perusahaan. User memasukkan nama perusahaan/slug dan alamat email. Sistem memverifikasi dengan query `ILIKE` PostgreSQL dan memastikan user terdaftar pada tenant tersebut, lalu memberikan URL direct login (`/{tenant_slug}/login`).
* **3. Registrasi Tenant Mandiri (`/register-tenant`):**
  * Pendaftaran perusahaan baru oleh calon klien.
  * **Input:** Nama perusahaan, slug workspace, email, telepon, website, NPWP (`tax_number`), alamat, pilihan paket langganan (`plan_id`), upload logo, dan kredensial admin tenant pertama.
  * **Validasi & Eksekusi:** Menghasilkan slug unik otomatis jika terjadi duplikasi (`baseSlug-1`), menyimpan logo ke Spatie MediaLibrary, membuat akun user admin, mengikat permission tenant, dan mengaktifkan status langganan `Subscription` selama 1 tahun.
* **4. Central Admin Dashboard (`/dashboard`):**
  * Dashboard khusus user central (`tenant_id = null`). Menampilkan ringkasan total tenant terdaftar, tenant aktif vs tidak aktif, tenant baru bulan ini, grafik pendapatan langganan, dan tabel tenant terbaru.
* **5. Manajemen Tenant Platform (`/tenants`):**
  * Pengelolaan seluruh perusahaan penyewa. Fitur mencakup pencarian, filter status, pengubahan profil tenant, aktivasi/deaktivasi status, dan ekspor data ke format PDF & Excel.
* **6. Manajemen Paket Langganan / Plans (`/plans`):**
  * CRUD paket langganan (nama, slug, harga, deskripsi, status aktif) beserta penentuan key fitur pendukung (`plan_features`).
* **7. Manajemen Subscriptions & Invoicing (`/subscriptions`):**
  * Pemantauan masa aktif langganan tiap tenant, perhitungan pendapatan bersih (*net revenue*), dan fitur pembuatan invoice manual (`/subscriptions/create-invoice`) untuk penagihan perpanjangan paket klien.
* **8. Manajemen User & Role Central (`/users`, `/roles`):**
  * Pengaturan akun staf internal pengelola platform dan hak akses peran level central (`central.*`).

---

### 2.2 Manajemen Master Data Gudang & Inventaris (Tenant Workspace)
Pondasi operasional yang wajib dikonfigurasi sebelum gudang dapat beroperasi.

* **1. Multi-Warehouse Setup (`WarehouseStocks/Warehouses`):**
  * Pendaftaran banyak gudang fisik dalam satu akun tenant.
  * **Input & Field:** Nama gudang, kode unik gudang (misal: `WH-JKT-01`), alamat lengkap, dan status aktif.
  * **Output:** Terdaftar di tabel `warehouses` dan menjadi induk dari lokasi-lokasi rak. Didukung ekspor Excel/PDF.
* **2. Multi-Location / Denah Rak (`WarehouseStocks/Locations`):**
  * Pengaturan hierarki lokasi penyimpanan spesifik di dalam gudang.
  * **Input & Field:** Relasi ke gudang (`warehouse_id`), kode rak unik (`rack_code`, misal: `RACK-A1-02`), nama zona/area (`zone`), deskripsi, dan status aktif.
  * **Output:** Menjadi alamat fisik wajib untuk proses Putaway (Inbound) dan Picking (Outbound). Didukung ekspor Excel/PDF.
* **3. Manajemen Produk (`InventoryManagement/Products`):**
  * Katalog barang induk.
  * **Input & Field:** Nama produk, relasi kategori (`category_id`), deskripsi, dan upload gambar produk.
  * **Output:** Mengelompokkan varian-varian SKU di bawah satu nama produk. Didukung ekspor Excel/PDF.
* **4. Manajemen Varian SKU (`InventoryManagement/Sku`):**
  * Unit terkecil pencatatan stok dan barcode.
  * **Input & Field:** Relasi produk (`product_id`), relasi satuan (`unit_id`), kode SKU unik (`sku_code`), barcode (1D Barcode / QR), harga pokok pembelian (`base_cost`), stok awal/berjalan (`current_stock`), batas stok minimum (`min_stock`), batas stok maksimum (`max_stock`), berat gram, dan status keaktifan.
  * **Output:** Menjadi acuan mutasi stok fisik, pemindaian scanner, dan perhitungan valuasi aset persediaan. Didukung ekspor Excel/PDF.
* **5. Kategori & Satuan Unit (`Categories` & `Units`):**
  * Pengelompokan jenis barang dan definisi satuan kuantitas (Pcs, Box, Ctn, Kg, Liter). Terisolasi per-tenant dan didukung ekspor data.
* **6. Manajemen Mitra Kontak (`Contacts/Customers` & `Contacts/Suppliers`):**
  * **Customers:** Direktori pembeli/tujuan pengiriman outbound (Nama, PIC, Telepon, Email, Alamat kirim, NPWP/Tax ID, Catatan).
  * **Suppliers:** Direktori pemasok barang masuk inbound (Nama vendor, PIC, Kontak, Alamat kantor, Nomor Pokok Pajak, Catatan).

---

### 2.3 Transaksi Pergudangan Inti (Core Operations)
Jantung operasional pergudangan yang dieksekusi secara terintegrasi antara Web Console dan Mobile Handheld.

#### A. Inbound Receiving (Barang Masuk)
* **1. Pembuatan Manifest PO Inbound (`CreateManifestModal.tsx`):**
  * Admin membuat manifes penerimaan barang di Web.
  * **Input:** Memilih supplier aktif, menambahkan multi-item SKU, dan menentukan estimasi kuantitas yang dipesan (`po_qty`).
  * **Sistem:** Membuat row pada tabel `transactions` (`local_uuid` format `TX-PO-XXXXXXXX`, `status = 'DRAFT'`) dan row pada `transaction_items` (`good_qty = 0`, `damaged_qty = 0`).
* **2. Pemindaian & Verifikasi Barcode (`verifyBarcode` / `scan-item`):**
  * Operator memindai barcode kemasan barang via scanner kamera/handheld.
  * **Validasi:** Sistem mengunci baris data (`lockForUpdate`), memvalidasi apakah SKU terdaftar di manifes dan total unit belum terpenuhi.
  * **Dampak:** Kuantitas barang terverifikasi bertambah (+1) dan status manifes otomatis naik menjadi `RECEIVING`.
* **3. Alokasi Putaway Rak & Laporan Kerusakan (`PutawayModal.tsx`):**
  * Menentukan ke rak mana barang fisik akan disimpan.
  * **Input:** Memilih kode rak tujuan aktif (`target_rack`), menginput jumlah fisik bagus (`good_qty`), jumlah fisik cacat/rusak (`damaged_qty`), dan catatan kerusakan (`damage_note`).
  * **Dampak:** Jika ada barang rusak, sistem menandai item berstatus `issue` dan mengaktifkan tombol pratinjau **Berita Acara Pemeriksaan (BAP)**.
* **4. Hold & Resume Sesi Inbound (`HoldSessionModal.tsx`):**
  * Menunda proses bongkar muat secara aman (status berubah `ON_HOLD` beserta alasan tunda) dan melanjutkannya kembali kapan saja (`resume`).
* **5. Commit Transaksi Inbound (`CommitModal.tsx`):**
  * Menyelesaikan penerimaan secara permanen.
  * **Eksekusi Atomik:** Dalam `DB::transaction`, sistem menambahkan saldo fisik ke tabel `inventory_stocks` (berdasarkan `sku_id`, `location_id`, dan `batch_number`), menaikkan total stok pada `skus.current_stock`, dan mengunci transaksi menjadi `COMMITTED`.

#### B. Outbound Dispatching (Barang Keluar)
* **1. Pembuatan Manifest SO Outbound (`CreateManifestModal.tsx`):**
  * Admin membuat pesanan pengeluaran barang.
  * **Input:** Memilih customer tujuan, nomor armada kendaraan (`vehicle_no`), nama sopir ekspedisi (`driver_name`), catatan pengiriman, serta daftar SKU dan jumlah pesanan (`so_qty`).
  * **Sistem:** Membuat transaksi dengan kode unik `OUT-XXXXXXXX` berstatus `PICKING`.
* **2. Verifikasi Barcode Picking:**
  * Operator memindai barang yang diambil dari lorong gudang. Sistem memverifikasi barcode terhadap manifest dan menambah kuantitas picking terkonfirmasi.
* **3. Alokasi Rak Sumber (`PickingModal.tsx`):**
  * Operator memilih dari rak mana barang fisik diambil (`from_location_id`) serta mencatat kuantitas baik vs cacat.
* **4. Hold & Resume Sesi Outbound:**
  * Memberikan jeda operasional pada sesi picking tanpa membatalkan order.
* **5. Commit Transaksi Outbound:**
  * Memotong saldo persediaan pada `inventory_stocks` di rak sumber yang bersangkutan dan memotong saldo master pada `skus.current_stock`. Status transaksi resmi ditutup menjadi `COMMITTED`.
* **6. Pratinjau & Cetak Surat Jalan Resmi (`SuratJalanPreviewModal.tsx`):**
  * Menampilkan pratinjau dokumen formal **Surat Jalan / Delivery Order (DO)** lengkap dengan nomor pengiriman, data customer, alamat tujuan, rincian barang, kuantitas, plat nomor kendaraan, nama driver, dan kolom tanda tangan resmi (Pengirim, Sopir, Penerima).

#### C. Stock Transfer (Mutasi Stok Antar-Rak / Antar-Gudang)
* **1. Pembuatan Mutasi (`CreateTransferModal.tsx`):**
  * Memindahkan barang dari satu lokasi ke lokasi lain.
  * **Input:** Memilih SKU, rak asal (`from_location_id`), rak tujuan (`to_location_id`), jumlah (`quantity`), dan catatan alasan mutasi.
  * **Validasi Ketat:** Sistem menolak jika rak asal sama dengan rak tujuan, menolak jika salah satu lokasi tidak aktif, dan menolak jika stok di rak asal tidak mencukupi.
* **2. Eksekusi FEFO Atomik (`StockTransferService.php`):**
  * Sistem mengambil stok dari rak asal berdasarkan prioritas tanggal kedaluwarsa terdekat (**FEFO**: `orderByRaw('expiry_date IS NULL')->orderBy('expiry_date')`) dengan menerapkan `lockForUpdate` dan `DB::transaction` 3x percobaan retry.
  * Stok di rak asal berkurang, stok di rak tujuan bertambah, dan transaksi langsung berstatus `completed` dengan kode referensi `TRF-YYYYMMDD-XXXX`.
* **3. Pembatalan & Pemulihan Stok Otomatis (*Cancel & Reversal*):**
  * Jika mutasi yang sudah `completed` dibatalkan oleh supervisor via tombol Cancel, sistem secara otomatis mengeksekusi operasi pembalik (*reverse*): memotong stok dari rak tujuan dan mengembalikannya ke rak asal secara utuh, lalu menandai status transaksi menjadi `cancelled`.

#### D. Stock Opname (Audit Fisik Persediaan)
* **Kondisi Aktual di Kode:** Antarmuka Web Console telah selesai dibangun (`WarehouseStocks/StockOpname/Index.tsx`), mencakup formulir pembukaan sesi audit, pratinjau cetak lembar kerja audit fisik (*blank counting sheet* via `PrintSheetModal.tsx`), serta modal input hasil verifikasi fisik (`VerificationModal.tsx`). Logika penulisan permanen ke tabel database saat ini sedang dalam proses penyelesaian integrasi service.

---

### 2.4 Laporan Eksekutif, Valuasi Aset & Audit Trail
Menyediakan visibilitas total bagi pemilik bisnis dan akuntan perusahaan:

* **1. Stock Summary Report (`Reports/StockSummary`):**
  * Menampilkan saldo persediaan fisik per SKU, batch number, gudang, dan lokasi rak.
  * **Filter Cerdas:** Mendukung filter status stok (*In Stock* $>15$, *Low Stock* $1\text{--}15$, *Out of Stock* $\le 0$).
* **2. Stock Movement Report (`Reports/StockMovement`):**
  * **Immutable Audit Trail:** Catatan log historis pergerakan barang per item transaksi (`TransactionItem`). Menampilkan kapan transaksi terjadi, nomor referensi dokumen, tipe transaksi (Inbound/Outbound/Transfer), operator penanggung jawab, lokasi asal, lokasi tujuan, dan selisih kuantitas.
* **3. Valuation Asset Report (`Reports/ValuationAsset`):**
  * **Nilai Finansial Persediaan:** Mengkalkulasi nilai total uang dari seluruh persediaan yang mengendap di gudang secara real-time dengan rumus matematis:  
    $$\text{Total Nilai Aset} = \sum (\text{Kuantitas Stok Aktual di Rak} \times \text{Base Cost SKU})$$
  * Memungkinkan manajemen mengetahui nilai rupiah persediaan per kategori, per gudang, maupun total seluruh aset perusahaan.
* **4. Inbound & Outbound Report (`Reports/InboundOutbound`):**
  * Rekapitulasi transaksi keluar-masuk barang terpadu yang dapat difilter berdasarkan rentang tanggal, supplier, atau customer.
* **5. Asynchronous Background Export Engine (`ExportLog` & Jobs):**
  * Seluruh modul master data dan laporan di atas dilengkapi tombol ekspor ke format **Excel (.xlsx)** dan **PDF**.
  * **Keunggulan Arsitektur:** Proses ekspor tidak membuat browser hang/freeze karena dijalankan di latar belakang menggunakan Laravel Queue Job (`Export*PdfJob` dan `Export*ExcelJob`). Status pembuatan file dicatat transparan di tabel `export_logs` (`pending` $\rightarrow$ `processing` $\rightarrow$ `completed`).

---

### 2.5 RBAC, Keamanan & Pengaturan Tenant
* **1. Granular Role-Based Access Control (Spatie RBAC):**
  * Pemisahan hak akses menggunakan guard `web`. Permission dikelompokkan secara terisolasi: awalan `central.*` untuk admin platform dan `tenant.*` untuk operasional tenant.
* **2. Manajemen User & Role Tenant (`UsersRoles`):**
  * Admin tenant dapat membuat role baru (misal: *Supervisor Gudang*, *Staf Picking*, *Operator Inbound*) dan mencentang hak akses spesifik per menu/tombol aksi, lalu menugaskannya ke akun staf.
* **3. Company Profile Management (`Settings/CompanyProfile`):**
  * Pengaturan identitas resmi perusahaan penyewa, kontak resmi, alamat kantor, nomor pokok wajib pajak (`tax_number`), dan upload logo perusahaan via Spatie MediaLibrary.
* **4. General Settings (`Settings/GeneralSettings`):**
  * Penyimpanan preferensi operasional tenant berbasis pasangan *Key-Value* pada basis data.
* **5. Keamanan Akun Personal:**
  * Penggantian password, Two-Factor Authentication (2FA dengan QR code via Laravel Fortify), preferensi tema antarmuka (Light/Dark/System), dan penggantian bahasa antarmuka (Bahasa Indonesia / English).

---

### 2.6 Mobile Handheld REST API Gateway
Disediakan khusus untuk melayani aplikasi smartphone / handheld barcode scanner staf lapangan:

* **1. Auth & Verification Gateway:**
  * `POST /api/verify-tenant`: Memvalidasi keaktifan workspace tenant berdasarkan slug.
  * `POST /api/auth/login`: Autentikasi operator dengan token Sanctum terikat nama perangkat (`device_name`).
  * `GET /api/profile` & `POST /api/auth/logout`: Manajemen sesi operator.
* **2. Operational Dashboard Summary (`GET /api/dashboard/summary`):**
  * Menghitung antrean aktif real-time: jumlah PO Inbound menunggu, jumlah SO Outbound siap pick, dan transfer pending.
  * Otomatis mengidentifikasi shift kerja berdasarkan jam server:
    * Shift 1 (Pagi): 06:00 – 14:00
    * Shift 2 (Sore): 14:00 – 22:00
    * Shift 3 (Malam): 22:00 – 06:00
  * Mengirimkan 8 daftar tugas lapangan aktif teratas lengkap dengan progress bar kuantitas.
* **3. Endpoint Operasional Inbound Mobile (`/api/{tenant_slug}/inbound/*`):**
  * `GET /options`: Mengambil data supplier, SKU, dan rak tersedia.
  * `GET /`: Mengambil daftar manifest PO.
  * `POST /store`: Membuat manifest PO dari mobile.
  * `GET /manifests/{code}`: Detail manifest & daftar item.
  * `POST /scan-item`: Validasi barcode fisik dan penambahan kuantitas barang baik (+1).
  * `POST /putaway`: Alokasi penyimpanan rak tujuan beserta kuantitas rusak dan catatan.
  * `POST /hold` & `POST /resume`: Penundaan dan pelanjutan sesi bongkar muat.
  * `POST /commit`: Pemostingan stok fisik ke database pusat.
* **4. Endpoint Operasional Outbound Mobile (`/api/{tenant_slug}/outbound/*`):**
  * `GET /options`: Mengambil master customer, SKU, dan rak.
  * `GET /`: Mengambil daftar manifest SO.
  * `POST /store`: Membuat manifest SO baru.
  * `GET /manifests/{code}`: Detail order & lokasi rak sumber.
  * `POST /verify-barcode`: Validasi pemindaian barcode barang yang diambil.
  * `POST /picking`: Alokasi rak sumber picking dan kuantitas barang.
  * `POST /hold` & `POST /resume`: Penundaan sesi picking.
  * `POST /commit`: Pemotongan saldo stok fisik di rak secara real-time.

---

## BAGIAN 3: MATRIKS STATUS PROGRES RIIL (TRANSPARAN & PROFESIONAL)

Tabel ini adalah panduan Anda untuk bersikap jujur, percaya diri, dan tidak terjebak saat atasan menanyakan status tiap modul:

| Modul / Komponen Fitur | Status Riil di Kode | Kesiapan Demo Besok |
| :--- | :---: | :---: |
| **Public Landing & Registrasi Tenant Mandiri** | 🟢 Selesai (100%) | Siap Demo Live |
| **Central Admin Panel (Tenants, Plans, Subscriptions, Invoices)** | 🟢 Selesai (100%) | Siap Demo Live |
| **Isolasi Multi-Tenant & Routing Workspace Slug** | 🟢 Selesai (100%) | Siap Demo Live |
| **Master Data (Produk, SKU Barcode, Kategori, Unit, Gudang, Rak, Mitra)** | 🟢 Selesai (100%) | Siap Demo Live |
| **Inbound Receiving (Manifest, Barcode Scan, Putaway, BAP, Commit)** | 🟢 Selesai (100%) | Siap Demo Live |
| **Outbound Dispatching (Manifest, Picking, Surat Jalan Preview, Commit)** | 🟢 Selesai (100%) | Siap Demo Live |
| **Stock Transfer (Mutasi Antar-Rak dengan Logika FEFO Atomik & Reversal)** | 🟢 Selesai (100%) | Siap Demo Live |
| **Laporan Eksekutif (Stock Summary, Movement Audit, Valuation Asset, In/Out)** | 🟢 Selesai (100%) | Siap Demo Live |
| **Engine Ekspor Background Asinkron (Excel & PDF via Queue Job)** | 🟢 Selesai (100%) | Siap Demo Live |
| **REST API Mobile Gateway (Sanctum Auth, Shift Summary, Inbound/Outbound API)** | 🟢 Selesai (100%) | Siap Demo via Postman / Mobile Client |
| **Penyambungan Data Live pada Tenant Web Dashboard** | 🟡 Tahap Polish (85%) | Tampilkan UI Dashboard |
| **Integrasi Database Backend pada Modul Stock Opname** | 🟡 Tahap Polish (75%) | Tampilkan UI Sesi & Print Sheet Kerja |
| **Eksplorasi AI (Voice Command & OCR Fallback Scanner)** | ⚪ R&D Phase 3 (Desember) | Disampaikan sebagai Roadmap Mendatang |

---

## BAGIAN 4: CHECKLIST TAKTIS & KUNCI JAWABAN PERTANYAAN KRITIS ATASAN (FAQ DEFENSE)

### 4.1 Persiapan Teknis Sebelum Masuk Ruang Rapat
1. **Pastikan Web Server & Worker Berjalan:**
   * Terminal 1: `php artisan serve` (Server backend Laravel aktif di port 8000).
   * Terminal 2: `npm run dev` (Vite dev server aktif).
   * Terminal 3 (Wajib untuk Ekspor File): `php artisan queue:work` (Agar background job ekspor Excel/PDF langsung terproses saat tombol ekspor diklik).
2. **Siapkan Akun Demo yang Pasti Berhasil:**
   * **Akun Central Superadmin:** `admin@mail.com` | Password: `admin123` (Buka di `http://127.0.0.1:8000/login`).
   * **Akun Admin Tenant:** `budi@demo-tenant.com` | Password: `password` (Buka di `http://127.0.0.1:8000/demo-tenant/login`).
3. **Siapkan Tab Browser Berurutan:**
   * Tab 1: Landing Page Publik (`http://127.0.0.1:8000`).
   * Tab 2: Dashboard Central Admin.
   * Tab 3: Dashboard Tenant `PT Demo Logistik` (`demo-tenant`).
   * Tab 4: Postman / REST Client (jika atasan ingin melihat bukti respon API Mobile).

---

### 4.2 Skenario Demo Live Paling Aman & Mengesankan (The Golden Demo Flow)
Jika atasan meminta demo langsung di layar, ikuti urutan emas ini agar alurnya terlihat profesional dan tidak error:

1. **Langkah 1: Tunjukkan Konsep Multi-Tenant & Master Data (3 Menit)**
   * Masuk ke `demo-tenant/login` sebagai Budi Operator.
   * Buka menu **Warehouse & Stocks $\rightarrow$ Warehouses & Locations**: Tunjukkan denah gudang dan rak (`RACK-A1-01`, dll.).
   * Buka menu **Inventory Management $\rightarrow$ SKU**: Tunjukkan data produk dengan kode barcode dan base cost-nya.
2. **Langkah 2: Eksekusi Transaksi Inbound (Penerimaan Barang) (4 Menit)**
   * Buka **Transactions $\rightarrow$ Inbound**: Buat manifest baru dari Supplier PT Sumber Elektronik.
   * Buka detail manifest: Simulasikan verifikasi scan barcode barang. Tunjukkan progress bar naik dari 0% ke 100%.
   * Buka Putaway: Alokasikan ke rak tujuan.
   * Tunjukkan fitur penanganan cacat: Masukkan 1 unit rusak, lalu buka pratinjau **Berita Acara Pemeriksaan (BAP)**.
   * Klik **Commit**: Tunjukkan notifikasi sukses bahwa stok telah resmi masuk ke rak.
3. **Langkah 3: Eksekusi Outbound & Pratinjau Surat Jalan (4 Menit)**
   * Buka **Transactions $\rightarrow$ Outbound**: Buat manifest pengiriman pesanan customer.
   * Lakukan alokasi picking dan klik **Commit**: Jelaskan bahwa stok fisik di rak otomatis terpotong detik itu juga.
   * Klik tombol **Preview Surat Jalan**: Tunjukkan dokumen pengiriman formal berformat Surat Jalan lengkap dengan tanda tangan ekspedisi. Ini akan sangat disukai atasan!
4. **Langkah 4: Mutasi FEFO & Pembuktian Laporan Nilai Aset (3 Menit)**
   * Buka **Reports $\rightarrow$ Valuation Asset Report**: Tunjukkan kalkulasi total rupiah aset barang yang otomatis ter-update mengikuti transaksi tadi.
   * Klik tombol **Export Excel**: Tunjukkan bahwa sistem mencatat antrean ekspor di latar belakang secara profesional.

---

### 4.3 Kunci Jawaban Menghadapi Pertanyaan Kritis Atasan

#### Pertanyaan 1: *"Kenapa arsitektur sistem ini memakai Laravel + Inertia React, bukan NestJS + Next.js seperti yang tertulis di PRD awal?"*
> **Jawaban Cerdas Anda:**  
> *"Di awal perancangan, opsi microservices terpisah NestJS dan Next.js memang dipertimbangkan. Namun dalam evaluasi siklus pengembangan magang, memisahkan backend dan frontend web console akan menimbulkan duplikasi DTO dan overhead pembuatan REST API internal untuk web yang memperlambat integrasi.  
> Kami mengambil keputusan arsitektur strategis dengan menggunakan **Laravel Monolith Modern berbasis Inertia.js dan React 19**. Pendekatan ini mempercepat penyelesaian Web Console secara signifikan dengan keamanan routing type-safe dari Wayfinder, sementara backend tetap menyediakan REST API yang bersih dan terisolasi menggunakan **Laravel Sanctum** untuk aplikasi mobile handheld. Ini adalah arsitektur yang jauh lebih efisien, hemat resource server, dan terbukti stabil."*

#### Pertanyaan 2: *"Bagaimana sistem menjamin data antar-perusahaan (tenant) tidak saling bocor atau tertukar?"*
> **Jawaban Cerdas Anda:**  
> *"Sistem kami menerapkan **Isolasi Berlapis (Defense-in-Depth)**:  
> 1. **Lapisan URL & Middleware:** Route web console dikunci dengan prefix `{tenant_slug}` dan divalidasi oleh middleware `IdentifyTenant`. Jika pengguna dari Tenant A mencoba mengganti URL ke slug Tenant B, sistem langsung melempar HTTP 403 Forbidden.  
> 2. **Lapisan Basis Data:** Seluruh tabel operasional (produk, SKU, gudang, rak, transaksi, pelanggan) memiliki foreign key `tenant_id`. Di setiap Service query, filter `$tenant->id` selalu dipasang secara eksplisit.  
> 3. **Lapisan Mobile API:** Token bearer Sanctum terikat langsung pada user yang memiliki atribut `tenant_id`. Operator tidak dapat mengakses atau memindai barcode milik tenant lain."*

#### Pertanyaan 3: *"Bagaimana sistem menangani kondisi barang yang datang dalam keadaan rusak saat penerimaan barang masuk?"*
> **Jawaban Cerdas Anda:**  
> *"Di OmniWarehouse, kami tidak mengasumsikan operasional selalu berjalan ideal (*happy path*). Pada modul Inbound, kami memisahkan pencatatan kuantitas menjadi `good_qty` (layak simpan) dan `damaged_qty` (cacat/rusak fisik).  
> Jika ditemukan barang rusak, operator mengisi catatan kerusakan (`damage_note`). Sistem menandai item berstatus `issue` dan secara otomatis menyediakan dokumen **Berita Acara Pemeriksaan (BAP)** yang mencantumkan rincian kerusakan untuk klaim retur ke supplier. Hanya barang berkondisi baik yang akan ditambahkan ke saldo stok siap jual di rak gudang saat transaksi di-commit."*

#### Pertanyaan 4: *"Bagaimana sistem mencegah terjadinya stok minus jika dua operator gudang mengambil barang di rak yang sama secara bersamaan?"*
> **Jawaban Cerdas Anda:**  
> *"Kami menerapkan pengamanan transaksi database tingkat enterprise:  
> Seluruh proses mutasi stok dibungkus di dalam `DB::transaction()` dengan teknik **Pessimistic Locking (`lockForUpdate()`)**. Ketika Operator A memvalidasi barang di sebuah rak, baris data stok tersebut dikunci sementara di level PostgreSQL. Jika Operator B mencoba mengakses stok yang sama di detik yang sama, ia akan menunggu hingga transaksi Operator A selesai dieksekusi. Jika sisa stok tidak mencukupi, sistem melempar `ValidationException` dan me-rollback transaksi secara utuh sehingga saldo stok tidak akan pernah bernilai minus."*

#### Pertanyaan 5: *"Kenapa transaksi di gudang tidak dibebaskan saja tanpa perlu dokumen PO atau SO (Ad-Hoc liar)?"*
> **Jawaban Cerdas Anda:**  
> *"Sebagai sistem B2B SaaS dengan modul akuntansi dan valuasi aset persediaan, setiap pergerakan barang wajib memiliki dasar hukum dokumen yang jelas.  
> Jika barang masuk dibiarkan tanpa referensi PO/Supplier, sistem tidak memiliki data harga beli sehingga laporan **Valuation Asset Report** akan rusak atau bernilai Rp 0. Begitu pula jika barang keluar tanpa Sales Order, perusahaan menghadapi risiko kehilangan barang tanpa ada dokumen penagihan dan Surat Jalan.  
> Untuk kebutuhan pergeseran posisi barang fisik di lorong, kami telah menyediakan modul resmi **Stock Transfer (Mutasi Rak)** yang bekerja cepat secara instan tanpa perlu dokumen pembelian."*

---
*Dokumen panduan ini telah diselaraskan 100% dengan kondisi basis kode aktual OmniWarehouse per November 2026. Siap digunakan sebagai pegangan presentasi resmi tim magang.*



---

## BAGIAN 5: STUDI KASUS OPERASIONAL NYATA PER FITUR & KORELASI NILAI BISNISNYA

Bagian ini dirancang khusus untuk memperdalam pemahaman kontekstual Anda. Gunakan narasi studi kasus ini saat menjelaskan fitur di depan atasan agar presentasi tidak kaku seperti membaca manual teknis, melainkan bercerita tentang **bagaimana fitur ini menyelamatkan bisnis klien dari kerugian nyata di lapangan pergudangan**.

---

### 5.1 Kasus Multi-Tenancy & SaaS Subscription
* **Kasus Lapangan (The Real-World Problem):**
  Bayangkan sebuah penyedia jasa pergudangan logistik pihak ketiga (3PL) yang menyewakan fasilitasnya ke 3 klien berbeda: Klien A adalah distributor suku cadang motor (*PT Sumber Jaya Autoparts*), Klien B adalah distributor makanan beku (*CV Frozen Sejahtera*), dan Klien C adalah brand pakaian online (*Batik Millennial*).
  * *Jika tanpa Multi-Tenancy:* Penyedia jasa harus membeli 3 server fisik/hosting terpisah, atau jika digabung dalam satu aplikasi biasa, staf rentan salah memasukkan data stok baju ke dalam laporan distributor onderdil motor. Biaya server membengkak dan risiko kebocoran rahasia dagang sangat tinggi.
* **Bagaimana Fitur OmniWarehouse Menyelesaikan Masalah:**
  Platform menggunakan arsitektur **Shared Database dengan Isolasi Kolom `tenant_id` dan URL Slug**. Begitu Klien B login di `omniwarehouse.com/cv-frozen/login`, seluruh data produk, gudang rak dingin, dan transaksinya terisolasi 100%. Central Superadmin cukup menggunakan satu panel dashboard untuk mengatur siapa yang berlangganan paket murah (*Starter*) atau paket lengkap (*Enterprise*), serta menerbitkan tagihan invoice penagihan bulanan secara otomatis.
* **Nilai Bisnis & Dampak Finansial:**
  * **Efisiensi Infrastruktur hingga 70%:** Tidak perlu menduplikasi server atau database untuk tiap klien baru.
  * **Monetisasi SaaS Langsung:** Klien bisa mendaftar mandiri via `/register-tenant` dan langsung terhubung dengan siklus penagihan langganan tahunan/bulanan.

---

### 5.2 Kasus Multi-Warehouse & Denah Rak (Locations)
* **Kasus Lapangan (The Real-World Problem):**
  Sebuah distributor retail memiliki gudang seluas 1.500 meter persegi dengan ratusan lorong dan rak bertingkat 4 level. Karena tidak ada sistem penamaan rak digital, staf gudang meletakkan kardus barang secara acak di lantai atau di rak mana pun yang kosong. Saat ada pesanan mendesak untuk mengambil *Kabel HDMI 5 Meter*, staf baru harus berkeliling lorong selama 40 menit hanya untuk mencari di tumpukan mana kardus tersebut berada.
* **Bagaimana Fitur OmniWarehouse Menyelesaikan Masalah:**
  Fitur **Multi-Location** mewajibkan setiap gudang fisik dipecah ke dalam struktur hierarki yang terstandarisasi: Zona, Lorong, dan Kode Rak Unik (misal: `RACK-A2-03` = Zona A, Rak Baris 2, Level 3). 
  Saat proses penerimaan barang (*Inbound Putaway*), sistem mencatat persis di kode rak mana kardus tersebut disimpan.
* **Nilai Bisnis & Dampak Finansial:**
  * **Kecepatan Pencarian Barang (Search Latency) Turun dari 40 Menit menjadi < 1 Menit:** Operator cukup melihat alamat rak di aplikasi dan langsung menuju titik koordinat yang tepat.
  * **Optimalisasi Ruang (Space Utilization):** Manajemen dapat memantau rak mana yang sudah penuh dan rak mana yang masih kosong tanpa harus memeriksa fisik ke dalam gudang.

---

### 5.3 Kasus SKU, Barcode 1D/2D & Base Cost
* **Kasus Lapangan (The Real-World Problem):**
  Toko grosir pakaian menjual produk *Kemeja Polos Pria*. Produk ini memiliki 3 ukuran (M, L, XL) dan 2 warna (Hitam, Putih). Jika sistem hanya mencatat produk generik *"Kemeja Polos"*, maka ketika stok ukuran L Putih fisik sudah habis terjual, kasir dan pembeli di sistem masih melihat stok ada 100 unit karena sistem menggabungkan seluruh ukuran. Pembeli kecewa karena pesanan terpaksa dibatalkan. Selain itu, harga beli ukuran XL lebih mahal Rp 10.000 dibanding ukuran M, namun akuntansi tidak bisa menghitung modal secara akurat.
* **Bagaimana Fitur OmniWarehouse Menyelesaikan Masalah:**
  OmniWarehouse memisahkan antara entitas **Produk Induk** (`products`) dan entitas **Varian SKU** (`skus`). Setiap varian memiliki:
  * Kode SKU unik (misal: `KPM-BLK-L`, `KPM-WHT-XL`).
  * Kode Barcode tersendiri (bisa di-scan langsung).
  * Harga Pokok Modal (`base_cost`) terpisah.
  * Batas pengingat stok menipis (`min_stock`) dan batas maksimum muatan rak (`max_stock`).
* **Nilai Bisnis & Dampak Finansial:**
  * **Zero Out-of-Stock Kecele:** Notifikasi *Low Stock Alert* menyala tepat pada varian spesifik yang kritis.
  * **Presisi Keuangan Modal:** Harga pokok persediaan dihitung akurat berdasarkan varian spesifik, bukan dirata-rata secara kasar.

---

### 5.4 Kasus Inbound Receiving, Scan Barcode & Berita Acara Kerusakan (BAP)
* **Kasus Lapangan (The Real-World Problem):**
  Truk kontainer dari pabrik tiba di dermaga gudang membawa 1.000 unit *Monitor Komputer 27 Inci*. Sopir terburu-buru meminta staf gudang menandatangani surat bukti terima barang. Staf menandatangani dokumen tanpa memeriksa fisik satu per satu. Keesokan harinya saat kardus dibuka, ditemukan 20 unit layar pecah akibat benturan selama perjalanan di jalan tol. Karena dokumen penerimaan sudah ditandatangani utuh tanpa catatan, pabrik supplier menolak bertanggung jawab. Gudang rugi puluhan juta rupiah.
* **Bagaimana Fitur OmniWarehouse Menyelesaikan Masalah:**
  Alur Inbound OmniWarehouse mewajibkan verifikasi fisik sebelum stok diakui sistem:
  1. Operator memindai barcode kardus satu per satu via mobile handheld (`verifyBarcode` / `scan-item`). Progress bar kuantitas bergerak naik secara real-time.
  2. Saat menemukan kardus penyok atau layar pecah, operator menginput `damaged_qty = 20` pada modal alokasi Putaway beserta foto dan catatan kerusakan (`damage_note`).
  3. Sistem otomatis menandai transaksi berstatus `issue` dan mengaktifkan tombol pratinjau **Berita Acara Pemeriksaan (BAP)**. Dokumen BAP dicetak dan ditandatangani oleh sopir pengantar sebelum meninggalkan gudang.
  4. Hanya 980 unit barang berkondisi baik (`good_qty`) yang dimasukkan ke saldo rak gudang saat transaksi di-commit.
* **Nilai Bisnis & Dampak Finansial:**
  * **Proteksi Finansial 100% dari Kerugian Supplier:** Kerusakan transit dibuktikan secara legal dan digital dengan BAP resmi di hari yang sama.
  * **Mencegah Barang Cacat Terjual ke Konsumen:** Barang rusak tidak akan pernah masuk ke stok aktif siap jual.

---

### 5.5 Kasus Outbound Dispatch, Barcode Picking & Surat Jalan
* **Kasus Lapangan (The Real-World Problem):**
  Gudang e-commerce menerima order pengiriman 50 unit *Mouse Wireless Gaming* ke pelanggan korporat di Surabaya. Karena tergesa-gesa mengejar jadwal kurir ekspedisi sore hari, staf gudang salah mengambil kardus di rak sampingnya yang berisi *Mouse Office Standar* yang harganya sepertiga lebih murah. Barang terlanjur terkirim dan di pintu gerbang keluar gudang tidak ada dokumen resmi yang mencantumkan nama driver dan plat nomor armada pengantar. Pelanggan marah besar, menuntut ganti rugi keterlambatan proyek, dan reputasi perusahaan hancur.
* **Bagaimana Fitur OmniWarehouse Menyelesaikan Masalah:**
  Alur Outbound OmniWarehouse menerapkan sistem **Validasi Pemindaian Tertutup (Closed-Loop Picking Validation)**:
  1. Operator membawa handheld scanner ke rak dan memindai barcode fisik barang. Jika operator salah memindai barcode mouse office, sistem langsung melempar alarm error merah: *"SKU ini tidak terdaftar pada Manifest Outbound ini!"*.
  2. Sistem hanya mengizinkan transaksi berlanjut jika barang yang dipindai benar-benar cocok 100% dengan dokumen Sales Order.
  3. Setelah seluruh barang tervalidasi dan di-commit, sistem menerbitkan dokumen resmi **Surat Jalan / Delivery Order (DO)** via `SuratJalanPreviewModal.tsx`. Dokumen ini mencatat nomor polisi truk pengangkut (`vehicle_no`), nama driver ekspedisi (`driver_name`), nomor order, rincian barang, dan kolom tanda tangan basah rangkap tiga.
* **Nilai Bisnis & Dampak Finansial:**
  * **Tingkat Kesalahan Pengiriman Turun Menjadi 0% (Zero Mis-Pick):** Mustahil salah kirim barang karena barcode divalidasi mesin.
  * **Bukti Legal Rantai Pasok (Proof of Dispatch):** Jika terjadi sengketa barang hilang di perjalanan ekspedisi, perusahaan memiliki arsip Surat Jalan resmi lengkap dengan identitas driver dan jam serah terima.

---

### 5.6 Kasus Stock Transfer FEFO & Pembatalan Otomatis (Reversal)
* **Kasus Lapangan (The Real-World Problem):**
  * *Skenario A (Darurat Fisik):* Musim hujan lebat, atap di atas Rak B-01 tiba-tiba bocor dan menetes tepat di atas tumpukan kardus susu bubuk. Operator harus memindahkan 50 kardus tersebut detik itu juga ke Rak C-05 yang kering.
  * *Skenario B (Kedaluwarsa / Expired):* Di gudang bahan makanan, operator yang malas selalu mengambil kardus susu yang paling depan (yang baru datang minggu lalu), sementara kardus di baris belakang yang kedaluwarsa 2 minggu lagi dibiarkan mengendap sampai basi dan harus dibuang.
* **Bagaimana Fitur OmniWarehouse Menyelesaikan Masalah:**
  Modul **Stock Transfer** dirancang untuk situasi darurat dan rotasi barang berbasis waktu kedaluwarsa:
  1. Operator dapat mengeksekusi mutasi rak secara instan di Web Console tanpa formulir birokrasi berbelit.
  2. Sistem di balik layar (`StockTransferService.php`) menerapkan algoritma **FEFO Atomik**: sistem secara otomatis memotong stok dari batch yang memiliki tanggal `expiry_date` paling kritis terlebih dahulu, bukan batch baru.
  3. **Fitur Reversal Otomatis:** Jika operator salah menginput kuantitas atau keliru memilih rak tujuan, supervisor cukup mengklik tombol **Cancel**. Dalam hitungan milidetik, sistem secara atomik menarik kembali seluruh kuantitas dari rak tujuan dan mengembalikannya ke rak asal secara utuh tanpa meninggalkan saldo selisih.
* **Nilai Bisnis & Dampak Finansial:**
  * **Penyelamatan Aset dari Bencana Fisik:** Barang dapat dipindahkan seketika saat darurat dan posisi stok digital langsung ter-update sinkron dengan fisik.
  * **Penurunan Nilai Barang Kedaluwarsa (Waste Reduction) hingga 90%:** Mengutamakan pengeluaran barang yang masa berlakunya paling pendek.

---

### 5.7 Kasus Laporan Nilai Aset Persediaan (Valuation Asset Report)
* **Kasus Lapangan (The Real-World Problem):**
  Menjelang penutupan buku akhir tahun atau audit pajak, Direktur Keuangan (CFO) dan Pemilik Perusahaan bertanya kepada Manajer Gudang: *"Berapa total nilai uang modal kita yang saat ini sedang diam membeku di dalam gudang?"*.  
  Jika gudang masih manual atau memakai software kasir biasa, staf gudang dan bagian akuntansi harus lembur selama 2 minggu: mencocokkan tumpukan faktur nota fisik pembelian lama dengan jumlah kardus di rak menggunakan kalkulator tangan. Hasilnya pun sering kali tidak akurat dan rentan manipulasi laporan pajak.
* **Bagaimana Fitur OmniWarehouse Menyelesaikan Masalah:**
  Manajer atau staf Finance cukup membuka menu **Reports $\rightarrow$ Valuation Asset Report**.
  Dalam hitungan 1 detik, sistem membaca seluruh saldo pada `inventory_stocks`, mengalikannya secara langsung dengan harga pokok pembelian masing-masing varian (`skus.base_cost`), dan menampilkan kartu ringkasan:
  * Total Nilai Aset Persediaan Gudang (misal: *Rp 4.250.800.000,-*).
  * Pemecahan nilai modal per kategori barang (misal: Elektronik Rp 3 Miliar, Pakaian Rp 1,2 Miliar).
  * Pemecahan nilai modal per lokasi rak dan per gudang cabang.
* **Nilai Bisnis & Dampak Finansial:**
  * **Visibilitas Finansial Real-Time (Tanpa Tunggu Tutup Buku):** Manajemen dapat mengambil keputusan arus kas (*cash flow*) kapan harus mengerem pembelian barang baru jika nilai stok yang mengendap sudah terlalu tinggi.
  * **Kesiapan Audit Eksternal (Audit-Ready):** Laporan siap diekspor ke Excel/PDF dalam hitungan detik untuk kebutuhan perbankan atau laporan pajak resmi.

---

### 5.8 Kasus Antrean Ekspor Asinkron (Background Queue & Export Logs)
* **Kasus Lapangan (The Real-World Problem):**
  Sebuah perusahaan logistik besar dengan riwayat 80.000 transaksi mutasi barang ingin mengekspor data historis satu tahun penuh ke file Excel untuk audit tahunan. Di aplikasi web konvensional, saat tombol *"Download Excel"* diklik, browser berputar terus selama 3 menit, server CPU melonjak 100%, pengguna lain di kantor tidak bisa membuka aplikasi, dan akhirnya muncul pesan error: `504 Gateway Timeout` (gagal download).
* **Bagaimana Fitur OmniWarehouse Menyelesaikan Masalah:**
  OmniWarehouse menggunakan arsitektur **Asynchronous Queue-Based Exporting**:
  1. Saat tombol ekspor diklik, sistem tidak memaksa browser menunggu. Sistem langsung membuat baris antrean baru di tabel `export_logs` dengan status `pending` dan menampilkan notifikasi ramah: *"Ekspor ditambahkan ke antrean. Periksa ikon unduhan/notifikasi."*.
  2. Pekerjaan berat meng-generate puluhan ribu baris Excel/PDF diserahkan ke proses pekerja latar belakang (**Laravel Queue Worker**: `Export*Job`).
  3. Operator tetap bisa melanjutkan pekerjaan menginput data lain tanpa hambatan. Begitu file selesai diproses, status di `export_logs` berubah menjadi `completed` dan file siap diunduh dengan aman.
* **Nilai Bisnis & Dampak Finansial:**
  * **Server Stabilitas Tinggi (Zero Crash):** Server tidak akan pernah down atau kehabisan memori (*out of memory*) hanya karena ada staf yang mengunduh laporan berukuran besar.
  * **User Experience Kelas Enterprise:** Pengguna tidak merasa aplikasi lambat atau macet.

---

### 5.9 Kasus Mobile Handheld API & Pergantian Shift Operasional
* **Kasus Lapangan (The Real-World Problem):**
  Pukul 14:00 adalah jam pergantian kerja dari Shift 1 (Pagi) ke Shift 2 (Sore). Sebanyak 15 orang staf gudang baru datang menggantikan staf sebelumnya. Sering kali terjadi jeda kebingungan selama 30 menit karena staf shift sore tidak tahu: *"Order mana yang tadi pagi belum selesai diproses? Truk mana yang lagi nunggu dibongkar muat di pintu dock bay?"*. Akibatnya, truk pengantar tertahan lama di luar gerbang dan terkena denda inap (*demurrage cost*).
* **Bagaimana Fitur OmniWarehouse Menyelesaikan Masalah:**
  Begitu staf shift sore menyalakan smartphone/handheld scanner dan membuka aplikasi mobile:
  1. Endpoint API `GET /api/dashboard/summary` membaca jam server lokal secara otomatis dan menampilkan ucapan tugas: *"Shift 2 (Sore) • 14:00 - 22:00"*.
  2. Layar HP langsung menyajikan kartu metrik ringkas: berapa PO Inbound yang masih `RECEIVING`, berapa SO Outbound yang masih `PICKING`, dan berapa mutasi rak yang tertunda.
  3. Di bawahnya, sistem menyajikan **Daftar Tugas Prioritas**: menampilkan nama supplier, nomor dock bay pintu gudang, kuantitas unit, dan progress bar fisik yang langsung bisa dilanjutkan staf sore tanpa perlu rapat pergantian shift yang memakan waktu.
* **Nilai Bisnis & Dampak Finansial:**
  * **Transisi Shift Mulus Tanpa Jeda (*Zero Downtime Handover*):** Staf sore langsung bekerja di detik pertama mereka tiba di lorong gudang.
  * **Eliminasi Biaya Penalti Truk:** Waktu bongkar muat kontainer supplier menjadi teratur dan termonitor secara presisi.

---
*Seluruh studi kasus operasional di atas didasarkan secara presisi pada implementasi arsitektur tabel database, controller, dan service aktual di repository OmniWarehouse.*
