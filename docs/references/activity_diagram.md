Acticity Digram UC-01: Autentikasi & Kelola Peran (Login & RBAC)







UC-01: Autentikasi & Kelola Peran (Login & RBAC)
User (All Users)
System

Membuka Aplikasi
Input Username & Password
Validasi Kredensial



NO
Data Valid?
YES
Akses Ditolak
Identifikasi Role & Hak akses
Tampilkan Dashboard



Acticity Digram UC-02: Kelola Barang Masuk (Inbound)








UC-02: Kelola Barang Masuk (Inbound)
Staff Operasional (MOB)
System

Buka Form Inbound & Pilih No. PO
Scan QR & Barcode Barang
Konfirmasi Fisik & Qty



Akses Internet
NO
Verifikasi Data PO di DB Lokal
YES
Verifikasi Data di Server Backend
Simpan ke DB Lokal dg status: Antrian Sync
Simpan pada DB Utama


Acticity Digram UC-03: Kelola Barang Keluar (Outrbond & FEFO)





UC-03: Kelola Peran (Login & RBAC)
Staff Gudang
System

Menerima Order pengeluaran dan menampilkannya di aplikasi User


Memindai barcode sebagai konfirmasi pengambilan.

Menampilkan panduan lokasi rak berdasarkan prinsip FEFO
Memvalidasi barang yang diambil dan memotong stok secara otomatis.


Acticity Digram UC-03: Kelola Barang Keluar (Outrbond & FEFO)







UC-04: Mutasi Stok & Serah Terima
Staff
System

Membuka Menu Handover
Scan QR Code Item yang akan dipindahkan

Memilih/memindai lokasi rak asal dan rak/gudang tujuan
Menyimpan data draft pemindahan


Scan rak / upload bukti jika pemindahan sudah selesai
Menyimpan data perpindahan beserta detail dan merubah status menjadi done












Acticity Digram UC-05: Audit Persediaan (Stock Opname)
UC-05: Audit Persediaan (Stock Opname)
Staff Gudang
System
Supervisor


Mengaktifkan Blind Count Mode

Input hasil perhitungan
Menghitung selisih (discrepancy)




Ada selisih?
tidak
ya
Update status selesai
Kirim Laporan
Meninjau Laporan
ya
Laporan Disetujui?
tidak


Update Stok






Acticity Digram UC-06: Quality Control & Return Barang
UC-01: Autentikasi & Kelola Peran (Login & RBAC)
Supervisor Gudang
System


Input/Scan Barang Return

Penilaian Kelayakan (Fisik/Masa Kelayakan) barang yang sudah di input



Menentukan Status Asset sesuai kriteria
Update data status asset
Update penyesuaian data valuasi stok







UC-07: Sinkronisasi Data (True Offline-First)
SQLite Lokal (Mobile)
System


Koneksi Terhubung

Mengirimkan data antrean bedasarkan FIFO
Menerima data



Update data bedasarkan timestamp
no
success
Kirim respon update success
yes
Hapus data antrean lokal




Acticity Digram UC-08: Operasional Fitur AI (Voice & OCR)
UC-08: Operasional Fitur AI (Voice & OCR)
Staff
System

Aktifkan Mic (Voice) / Kamera (OCR)
Proses NLP / Ekstraksi Teks dalam < 3 Detik




Konfirmasi Hasil Ekstraksi

Teruskan ke Form Transaksi




