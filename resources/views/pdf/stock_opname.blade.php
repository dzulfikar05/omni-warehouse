<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Rekonsiliasi Stock Opname</title>
    <style>
        body { font-family: sans-serif; font-size: 11px; margin: 20px; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h2 { margin: 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
    </style>
</head>
<body>
    <div class="header">
        <h2>Laporan Rekonsiliasi Stock Opname</h2>
        <p>{{ $tenant->name ?? 'Tenant' }} - Sesi: {{ $session['session_code'] ?? '-' }} - Tanggal: {{ date('d-m-Y H:i') }}</p>
    </div>
    <table>
        <thead>
            <tr>
                <th class="text-center">#</th>
                <th>SKU</th>
                <th>Nama Barang</th>
                <th>Rak</th>
                <th class="text-right">Stok Sistem</th>
                <th class="text-right">Fisik Lapangan</th>
                <th class="text-center">Selisih</th>
                <th class="text-center">Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($items as $index => $item)
            @php $item = (array) $item; @endphp
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td><strong>{{ $item['sku'] ?? '-' }}</strong></td>
                <td>{{ $item['name'] ?? '-' }}</td>
                <td class="text-center">{{ $item['rack'] ?? '-' }}</td>
                <td class="text-right">{{ $item['system_qty'] ?? 0 }} {{ $item['unit'] ?? '' }}</td>
                <td class="text-right">{{ $item['physical_qty'] ?? 0 }} {{ $item['unit'] ?? '' }}</td>
                <td class="text-center">{{ ($item['variance'] ?? 0) > 0 ? '+'.$item['variance'] : $item['variance'] }} {{ $item['unit'] ?? '' }}</td>
                <td class="text-center">{{ $item['status'] ?? '-' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
