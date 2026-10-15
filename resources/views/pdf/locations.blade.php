<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Daftar Rack & Stock Location</title>
    <style>
        body { font-family: sans-serif; font-size: 11px; margin: 20px; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h2 { margin: 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .text-center { text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <h2>Daftar Rack & Stock Location</h2>
        <p>{{ $tenant->name ?? 'Tenant' }} - Tanggal: {{ date('d-m-Y H:i') }}</p>
    </div>
    <table>
        <thead>
            <tr>
                <th class="text-center">#</th>
                <th>Gudang</th>
                <th>Kode Rak</th>
                <th>Zona Area</th>
                <th>Deskripsi</th>
                <th class="text-center">Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($locations as $index => $loc)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td>{{ $loc->warehouse->name ?? '-' }}</td>
                <td><strong>{{ $loc->rack_code }}</strong></td>
                <td>{{ $loc->zone ?? '-' }}</td>
                <td>{{ $loc->desc ?? '-' }}</td>
                <td class="text-center">{{ $loc->is_active ? 'Active' : 'Inactive' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
