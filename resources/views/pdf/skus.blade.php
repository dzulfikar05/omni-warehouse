<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Master Data SKU & Stocks</title>
    <style>
        body { font-family: sans-serif; font-size: 11px; margin: 20px; color: #1e293b; }
        .header { text-align: center; margin-bottom: 20px; border-b: 2px solid #e2e8f0; padding-bottom: 10px; }
        .header h2 { margin: 0; color: #0f172a; text-transform: uppercase; }
        .header p { margin: 4px 0 0; color: #64748b; font-size: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
        th { background-color: #f1f5f9; color: #334155; font-weight: bold; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-mono { font-family: monospace; }
    </style>
</head>
<body>
    <div class="header">
        <h2>Master Data Stock Keeping Unit (SKU)</h2>
        <p>{{ $tenant->name ?? 'Tenant' }} — Dicetak pada: {{ date('d-m-Y H:i') }}</p>
    </div>
    <table>
        <thead>
            <tr>
                <th class="text-center" style="width: 30px;">#</th>
                <th>Kode SKU / Barcode</th>
                <th>Nama Produk</th>
                <th>Kategori</th>
                <th>Satuan</th>
                <th class="text-right">Base Cost</th>
                <th class="text-right">Stok Aktual</th>
            </tr>
        </thead>
        <tbody>
            @foreach($skus as $index => $sku)
            @php $sku = (array) $sku; @endphp
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td class="font-mono">
                    <strong>{{ $sku['sku_code'] ?? '-' }}</strong><br>
                    <small style="color: #64748b;">{{ $sku['barcode'] ?? '-' }}</small>
                </td>
                <td>{{ $sku['product']['name'] ?? '-' }}</td>
                <td>{{ $sku['product']['category']['name'] ?? '-' }}</td>
                <td>{{ $sku['unit']['name'] ?? ($sku['unit']['symbol'] ?? '-') }}</td>
                <td class="text-right font-mono">Rp {{ number_format($sku['base_cost'] ?? 0, 0, ',', '.') }}</td>
                <td class="text-right font-mono"><strong>{{ $sku['current_stock'] ?? 0 }}</strong></td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
