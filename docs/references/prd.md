PRODUCT REQUIREMENT DOCUMENT (PRD)
Project Name: OmniWarehouse: Universal Inventory & Warehouse Management Platform
Team: Team D Software Internship (Afgan, Dzulfikar, Damar, Kayla)
Supervisor / Mentor: Andika Prasetiawan
Target Release: Desember 2026 (Agile 8 Sprint: September – Desember)

1. PROJECT OVERVIEW & TARGET AUDIENCE
OmniWarehouse adalah platform manajemen pergudangan serbaguna (Universal WMS) berbasis SaaS-Ready Architecture. Platform ini hadir dengan pendekatan Dual-Platform yang menghubungkan dua profil pengguna utama dalam satu ekosistem terintegrasi:
Web Console Target: Supervisor, & Manajemen (Fokus pada pengawasan stok terpusat, analitik, dan kontrol multi-gudang).
Mobile App Target: Staf Operasional Pergudangan (Fokus pada kecepatan pemindaian barcode/QR, Plain UI, dan operasional Offline-First).
2. PROBLEM STATEMENT & BUSINESS MISSION
Problem Statement
Antarmuka Rumit: Aplikasi WMS konvensional memiliki navigasi padat formulir yang membutuhkan pelatihan lama dan memperlambat transaksi operasional.
Blank Spot Sinyal: Konstruksi fisik bangunan gudang yang tebal sering memutus koneksi internet, membuat aplikasi berbasis cloud murni terhenti.
Visibilitas Terfragmentasi: Data stok antar-lokasi terpisah-pisah, menyulitkan pemantauan persediaan secara real-time.
Traceability Lemah: Mutasi barang tidak terverifikasi digital secara ketat, memicu risiko selisih stok fisik.
Business Mission
Membangun platform ganda (Dual-Platform) SaaS-Ready yang menggabungkan kemudahan antarmuka Plain UI pada Mobile App berbasis True Offline-First dengan ketajaman pengawasan terpusat pada Web Console.



3. CORE ARCHITECTURE & TECH STACK
Component
Technology / Framework
Role & Scope
Mobile App
Flutter (Dart)
Antarmuka staf gudang, pemindaian barcode, dan transaksi lapangan.
Local Offline DB
SQLite + WorkManager FIFO Queue
Database lokal untuk True Offline-First & antrean auto-sync.
Backend API
NestJS (TypeScript)
REST API, manajemen logika bisnis, role-permission, dan sync engine.
Main Database
PostgreSQL + Prisma ORM
Database pusat relasional untuk persediaan, mutasi, dan audit trail.
Web Console
Next.js (TypeScript)
Dashboard pengawasan terpusat, laporan, dan konfigurasinya.
Vision Engine
Google ML Kit
Scanner Barcode/QR instan & OCR Fallback label rusak.

4. FUNCTIONAL REQUIREMENTS (11 CORE WMS MODULES + SAAS TIERING)
4.1. Core / MVP Tier (Target: UMKM & Retail D2C)
Modul 1: Manajemen Barang / Product
Katalog master data produk terpusat dengan dukungan atribut fleksibel.
Modul 2: SKU dan Barcode (Barcode-First Operation)
Pemindaian barcode/QR instan via mobile kamera untuk pencatatan tanpa sentuh manual.
Modul 3: User dan Role / Permission (RBAC)
Pengaturan hak akses berbasis Role-Based Access Control (Supervisor, Staf Gudang, Finance).
Modul 4: Barang Masuk (Inbound Transaction)
Transaksi penerimaan barang yang berjalan 100% offline via SQLite lokal.
Modul 5: Barang Keluar (Outbound Transaction)
Transaksi pengeluaran barang dengan pemotongan stok otomatis dan validasi instan.
Modul 6: Stock Opname (Offline Audit Persistence)
Pencatatan audit fisik persediaan di lapangan tanpa bergantung pada sinyal internet.
Modul 7: Riwayat / Pergerakan Stok (Inventory Traceability)
Pencatatan log transaksi dan mutasi stok secara transparan dan immutable.
4.2. Advanced Capability / Pro Tier (Target: Distributor FnB & Logistik 3PL)
Modul 8: Warehouse / Gudang (Multi-Warehouse Management)
Pengawasan dan pengelolaan stok di berbagai lokasi gudang fisik dalam satu dashboard terpusat.
Modul 9: Lokasi Penyimpanan (Multi-Location & Rak Tracking)
Pelacakan spesifik posisi barang hingga tingkat area, zona, dan rak.
Fitur Lanjutan Lainnya:
FEFO Picking Guidance: Rekomendasi otomatis rak dan batch barang yang mendekati masa kedaluwarsa.
Custom QR Label Generator: Pembuatan dan pencetakan label QR custom untuk barang tanpa barcode bawaan.
4.3. Premium / AI Add-on Tier (Target: Manufaktur & FMCG Skala Besar)
Modul 11: Laporan Stok Dasar & Business Insights
Single Table Inventory Dashboard, laporan nilai persediaan (Real-time Valuation), dan laporan selisih stok.
Fitur AI Lanjutan:
AI Visual & OCR Scanner: Ekstraksi teks otomatis untuk membaca label fisik atau nomor seri yang tergores/rusak via Google ML Kit.
AI Voice Command: Navigasi dan input data bebas genggaman (hands-free) dengan respon <= 3 detik.
5. NON-FUNCTIONAL REQUIREMENTS & SUCCESS CRITERIA
Offline Reliability: 0% Transaction Loss saat terjadi perpindahan kondisi dari offline ke online.
System Usability Scale (SUS): Nilai evaluasi kemudahan antarmuka >= 70% (kategori Good/Acceptable).
Sync Latency: Waktu sinkronisasi data lokal (SQLite) ke server pusat (PostgreSQL) < 2 detik setelah koneksi internet kembali pulih.
AI Voice Accuracy: Akurasi keberhasilan AI Voice Command dalam mengenali instruksi sebesar >= 90%.
6. PROJECT ROADMAP & SPRINT TIMELINE
Periode & Sprint
Kategori Prioritas
Fokus Utama Pengembangan PDF
Tech Stack Utama PDF
September
(Sprint 1 & 2)
Core / MVP
Master Data & Scanning Engine
• Manajemen Produk, SKU & Barcode
• User & Role Permission Access (RBAC)
• Single Table Inventory & Barcode Scanner Engine
• Flutter
• Figma
• Google ML Kit Barcode
Oktober
(Sprint 3 & 4)
Core / MVP
Offline Engine, Transaksi & Audit
• Barang Masuk (Inbound) & Barang Keluar (Outbound)
• Perpindahan Stok & Stock Opname
• True Offline Persistence & WorkManager Sync Queue
• SQLite Local DB
• NestJS REST API
• Prisma ORM
November
(Sprint 5 & 6)
Advanced
Multi-Location & Advanced Ops
• Multi-Warehouse & Multi-Location (Rak)
• FEFO Picking Guidance & Expiry Tracking
• Next.js Web Console
• NestJS Service
• PostgreSQL DB
Desember
(Sprint 7 & 8)
Advanced & Future AI
Quality Baseline & Release
• Laporan Stok Dasar & Real-Time Valuation
• Stress Testing Transaksi & Evaluasi SUS ($\ge 70$)
• Feasibility Study AI OCR & Voice Command Add-on
• ML Kit OCR Fallback
• AI Voice Engine
• Staging Baseline




