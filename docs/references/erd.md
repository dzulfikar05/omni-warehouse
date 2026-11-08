






















transaction_items



id
BigInt
Primary Key, Auto Increment
ID item transaksi
transaction_id
BigInt
Foreign Key -> transactions.id
Relasi ke transaksi induk

sku_id
BigInt
Foreign Key -> skus.id
Relasi ke item SKU
from_location_id
BigInt
Foreign Key -> locations.id, Nullable
Rak asal (jika OUT/TRANSFER)
to_location_id
BigInt
Foreign Key -> locations.id, Nullable
Rak tujuan (jika IN/TRANSFER)
quantity
Int
Not Null
Jumlah item
locations



inventory_stocks



unit_price
Decimal(10,2)
Not Null
Harga per unit
id
BigInt
Primary Key, Auto Increment
ID rak/lokasi spesifik
id
BigInt
Primary Key, Auto Increment
ID posisi stok fisik
serial_number
Varchar(255)
Nullable
Nomor seri unik item
warehouse_id
BigInt
Foreign Key -> warehouses.id
Relasi ke gudang
created_by
BigInt
Nullable
ID pembuat data
rack_code
Varchar(100)
Not Null
Kode rak
sku_id
BigInt
Foreign Key -> skus.id
Relasi ke varian SKU
created_at
Timestamp
Not Null
Timestamp buat
zone
Varchar(100)
Nullable
Area/zona lokasi
location_id
BigInt
Foreign Key -> locations.id
Relasi ke rak lokasi
updated_at
Timestamp
Not Null
Timestamp ubah
created_by
BigInt
Nullable
ID pembuat data
created_at
Timestamp
Not Null
Timestamp buat
quantity
Int
Not Null, Default: 0
Jumlah stok barang
transactions



updated_at
Timestamp
Not Null
Timestamp ubah
batch_number
Varchar(100)
Nullable
Nomor batch produksi
id
BigInt
Primary Key, Auto Increment
ID dokumen transaksi
expiry_date
Date
Nullable
Tanggal kedaluwarsa
warehouses



created_by
BigInt
Nullable
ID pembuat data
tenant_id
BigInt
Foreign Key -> tenants.id
Isolasi per tenant
id
BigInt
Primary Key, Auto Increment
ID gudang
created_at
Timestamp
Not Null
Timestamp buat
user_id
BigInt
Foreign Key -> users.id
Operator transaksi
tenant_id
BigInt
Foreign Key -> tenants.id
Isolasi per tenant
updated_at
Timestamp
Not Null
Timestamp ubah
permissions



name
Varchar(255)
Not Null
Nama gudang
id
BigInt
Primary Key, Auto Increment
ID menu navigasi
supplier_id
BigInt
Foreign Key -> suppliers.id, Nullable
Pemasok (jika IN)
code
Varchar(100)
Not Null
Kode gudang
title
Varchar(255)
Not Null
Judul menu
desc
Varchar(100)
Not Null

roles



customer_id
BigInt
Foreign Key -> customers.id, Nullable
Pelanggan (jika OUT)
is_active
Boolean
Not Null, Default: true
Status aktif/nonaktif
url
Varchar(255)
Not Null
Route/path URL
id
BigInt
Primary Key, Auto Increment
ID role
icon
Varchar(255)
Nullable
Nama icon
local_uuid
Varchar(255)
Not Null, Unique
UUID transaksi offline
created_by
BigInt
Nullable
ID pembuat data
parent_id
BigInt
Nullable
ID parent menu jika submenu
tenant_id
BigInt
Foreign Key -> tenants.id, Nullable
Null jika role global
status
Varchar(50)
Not Null
Status (completed, pending)
created_at
Timestamp
Not Null
Timestamp buat
sort_order
Int
Not Null, Default: 0
Urutan tampilan
name
Varchar(255)
Not Null
Nama role (ADMIN, STAFF)
updated_at
Timestamp
Not Null
Timestamp ubah
is_active
Boolean
Not Null, Default: true
Status aktif/nonaktif
desc
Text
Nullable
Deskripsi role
sync_status
Varchar(50)
Not Null
Status sync offline/online
created_at
Timestamp
Not Null
Timestamp buat
created_by
BigInt
Nullable
ID pembuat data
transaction_type
Varchar(50)
Not Null
Jenis (IN, OUT, TRANSFER)
customers



updated_at
Timestamp
Not Null
Timestamp ubah
created_at
Timestamp
Not Null
Timestamp buat
created_by
BigInt
Nullable
ID pembuat data
id
BigInt
Primary Key, Auto Increment
ID pelanggan
updated_at
Timestamp
Not Null
Timestamp ubah
created_at
Timestamp
Not Null
Timestamp buat
tenant_id
BigInt
Foreign Key -> tenants.id
Isolasi per tenant
role_has_permissions



updated_at
Timestamp
Not Null
Timestamp ubah
name
Varchar(255)
Not Null
Nama pelanggan
role_id
BigInt
Primary Key, Foreign Key -> roles.id
Relasi ke role
users



phone
varchar
Nullable
Detail kontak
permission_id
BigInt
Primary Key, Foreign Key -> menus.id
Relasi ke menu
id
BigInt
Primary Key, Auto Increment
ID akun user
tenants



email
varchar


id
BigInt
Primary Key, Auto Increment
ID entitas perusahaan
notes
text


plans



tenant_id
BigInt
Foreign Key -> tenants.id
Relasi ke tenant/perusahaan
name
Varchar(255)
Not Null
Nama perusahaan
created_by
BigInt
Nullable
ID pembuat data
id
BigInt
Primary Key, Auto Increment
ID master plan
role_id
BigInt
Foreign Key -> roles.id
Relasi ke role internal
slug
Varchar(255)
Not Null, Unique
Subdomain/identifier
created_at
Timestamp
Not Null
Timestamp buat
name
Varchar(255)
Not Null
Nama paket (misal: Pro Plan)
email
Varchar(255)
Not Null, Unique
Email login
logo
Varchar(255)
Nullable
Path/URL logo
updated_at
Timestamp
Not Null
Timestamp ubah
slug
Varchar(255)
Not Null, Unique
Slug URL paket
username
Varchar(255)
Not Null, Unique
Username login
phone
Varchar(50)
Nullable
Nomor telepon
desc
Text
Nullable
Deskripsi paket
name
Varchar(255)
Not Null
Nama lengkap user
address
Text
Nullable
Alamat kantor
price
Decimal(10,2)
Not Null
Harga paket
password
Varchar(255)
Not Null
Password terenkripsi
created_by
BigInt
Nullable
ID user pendaftar awal
categories



products



is_active
Boolean
Not Null, Default: true
Status aktif/nonaktif
photo
Varchar(255)
Nullable
Path foto profil
created_at
Timestamp
Not Null
Timestamp buat
id
BigInt
Primary Key, Auto Increment
ID kategori produk
id
BigInt
Primary Key, Auto Increment
ID barang
created_by
BigInt
Nullable
ID pembuat data
created_by
BigInt
Nullable
ID pembuat data
updated_at
Timestamp
Not Null
Timestamp ubah
tenant_id
BigInt
Foreign Key -> tenants.id
Isolasi per tenant
tenant_id
BigInt
Foreign Key -> tenants.id
Isolasi per tenant
created_at
Timestamp
Not Null
Timestamp buat
created_at
Timestamp
Not Null
Timestamp buat
name
Varchar(255)
Not Null
Nama kategori
category_id
BigInt
Foreign Key -> categories.id
Relasi ke kategori
updated_at
Timestamp
Not Null
Timestamp ubah
updated_at
Timestamp
Not Null
Timestamp ubah
general settings



desc
Text
Nullable
Deskripsi kategori
name
Varchar(255)
Not Null
Nama produk
id
BigInt
Primary Key, Auto Increment
ID entitas perusahaan
created_by
BigInt
Nullable
ID pembuat data
created_by
BigInt
Nullable
ID pembuat data
plan_features



subscriptions



tenant_id
BigInt
Foreign Key -> tenants.id
Relasi ke tenant/perusahaan
created_at
Timestamp
Not Null
Timestamp buat
created_at
Timestamp
Not Null
Timestamp buat
id
BigInt
Primary Key, Auto Increment
ID fitur plan
id
BigInt
Primary Key, Auto Increment
ID transaksi langganan
name
Varchar(255)
Not Null
Nama perusahaan
updated_at
Timestamp
Not Null
Timestamp ubah
updated_at
Timestamp
Not Null
Timestamp ubah
plan_id
BigInt
Foreign Key -> plans.id
Relasi ke plan
tenant_id
BigInt
Foreign Key -> tenants.id, Unique
Relasi ke tenant
value
Varchar(255)
Not Null, Unique
Subdomain/identifier
feature_key
Varchar(255)
Not Null
Key fitur (misal: max_users)
plan_id
BigInt
Foreign Key -> plans.id
Relasi ke plan aktif
created_by
BigInt
Nullable
ID user pendaftar awal
units



skus



value
Varchar(255)
Not Null
Nilai/limit (misal: 10, true)
status
Varchar(50)
Not Null
Status (active, cancelled, expired)
created_at
Timestamp
Not Null
Timestamp buat
id
BigInt
Primary Key, Auto Increment
ID satuan
id
BigInt
Primary Key, Auto Increment
ID varian/SKU
created_by
BigInt
Nullable
ID pembuat data
ends_at
Datetime
Nullable
Tanggal berakhir langganan
updated_at
Timestamp
Not Null
Timestamp ubah
name
Varchar(255)
Not Null
Nama satuan (Pcs, Box, Kg)
product_id
BigInt
Foreign Key -> products.id
Relasi ke produk induk
created_at
Timestamp
Not Null
Timestamp buat
created_by
BigInt
Nullable
ID pembuat data
symbol
Varchar(50)
Not Null
Simbol (pcs, box, kg)
unit_id
BigInt
Foreign Key -> units.id
Relasi ke satuan
updated_at
Timestamp
Not Null
Timestamp ubah
created_at
Timestamp
Not Null
Timestamp buat
created_by
BigInt
Nullable
ID pembuat data
sku_code
Varchar(255)
Not Null, Unique
Kode unik SKU
updated_at
Timestamp
Not Null
Timestamp ubah
created_at
Timestamp
Not Null
Timestamp buat
barcode
Varchar(255)
Nullable
Kode barcode
updated_at
Timestamp
Not Null
Timestamp ubah
base_cost
Decimal(10,2)
Not Null
Harga modal/dasar
created_by
BigInt
Nullable
ID pembuat data
suppliers



created_at
Timestamp
Not Null
Timestamp buat
id
BigInt
Primary Key, Auto Increment
ID pemasok
updated_at
Timestamp
Not Null
Timestamp ubah
tenant_id
BigInt
Foreign Key -> tenants.id
Isolasi per tenant
name
Varchar(255)
Not Null
Nama supplier
pic


Nama pic dari supplier
phone
Text
Nullable
Detail kontak
email



notes



created_by
BigInt
Nullable
ID pembuat data
created_at
Timestamp
Not Null
Timestamp buat
updated_at
Timestamp
Not Null
Timestamp ubah