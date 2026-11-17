Berikut teks Use Case Diagram kamu yang sudah saya transkripsikan agar bisa langsung disalin.

### 1. Daftar aktor

1. All User
2. Staf Gudang
3. Supervisor
4. Manager / Finance
5. System

### 2. Daftar use case

```
UC-01: Autentikasi & Kelola Peran
       (Login & RBAC)

UC-02: Kelola Barang Masuk
       (Inbound Receiving)

UC-03: Kelola Barang Keluar
       (Outbound & FEFO)

UC-04: Mutasi Stok & Serah Terima
       (Transfer & Handover)

UC-05: Audit Persediaan & Rekonsiliasi
       (Stock Opname)

UC-06: Quality Control & Retur
       (QC & Triage)

UC-07: Sinkronisasi Data Transaksi
       (Offline Auto-Sync)

UC-08: Pengoperasian Fitur AI
       (AI Voice & OCR Scanner)

UC-09: Pemantauan Dashboard dan Laporan
       (Analytics & Audit)
```

### 3. Relasi antar-use case

```
UC-08 --<<extend>>--> UC-02
UC-08 --<<extend>>--> UC-03

UC-02 --<<include>>--> UC-07
UC-03 --<<include>>--> UC-07
UC-04 --<<include>>--> UC-07
UC-05 --<<include>>--> UC-07
```

Catatan: Nama UC-03, UC-06, dan UC-09 serta beberapa teks kecil saya transkripsikan berdasarkan pembacaan gambar. Sebaiknya cocokkan kembali dengan diagram aslinya sebelum dimasukkan ke dokumen final.