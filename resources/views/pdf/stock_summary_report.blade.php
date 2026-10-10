<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Stock Summary Report</title>
    <style>
        body { font-family: sans-serif; font-size: 10px; color: #333; line-height: 1.3; }
        .kop-table { width: 100%; border-collapse: collapse; border-bottom: 2px solid #000; margin-bottom: 12px; }
        .kop-table td { vertical-align: middle; }
        .logo { max-height: 45px; width: auto; }
        .content-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .content-table th, .content-table td { border: 1px solid #ccc; padding: 5px 6px; text-align: left; }
        .content-table th { background-color: #f2f2f2; font-weight: bold; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .footer-note { margin-top: 15px; font-size: 9px; color: #666; border-top: 1px solid #ddd; padding-top: 5px; }
    </style>
</head>
<body>

    <table class="kop-table">
        <tr>
            @if(!empty($settings['doc_show_logo']) && $settings['doc_show_logo'] == '1' && !empty($logoUrl))
                <td style="width: 15%;">
                    <img src="{{ $logoUrl }}" class="logo" alt="Logo">
                </td>
            @endif

            <td style="text-align: center;">
                {!! $settings['doc_header_html'] ?? '<h2>'.$tenant->name.'</h2>' !!}
            </td>

            @if(!empty($settings['doc_show_npwp']) && $settings['doc_show_npwp'] == '1' && $tenant->tax_number)
                <td style="width: 20%; text-align: right; font-size: 8px;">
                    <strong>NPWP / TAX ID:</strong><br>{{ $tenant->tax_number }}
                </td>
            @endif
        </tr>
    </table>

    <h3 style="text-align: center; margin-bottom: 10px;">LAPORAN RINGKASAN STOK</h3>

    <table class="content-table">
        <thead>
            <tr>
                <th style="width: 3%;">#</th>
                <th style="width: 12%;">SKU Code</th>
                <th style="width: 22%;">Product Name</th>
                <th style="width: 10%;">Batch No</th>
                <th style="width: 13%;">Warehouse</th>
                <th style="width: 7%;" class="text-right">Qty</th>
                <th style="width: 6%;">Unit</th>
                <th style="width: 12%;" class="text-right">Base Cost</th>
                <th style="width: 15%;" class="text-right">Total Value</th>
            </tr>
        </thead>
        <tbody>
            @forelse($stocks as $index => $item)
                @php
                    $qty = $item->quantity ?? 0;
                    $cost = $item->sku?->base_cost ?? 0;
                    $totalVal = $qty * $cost;
                @endphp
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td style="font-family: monospace;">{{ $item->sku?->sku_code ?? '-' }}</td>
                    <td><strong>{{ $item->sku?->product?->name ?? '-' }}</strong></td>
                    <td>{{ $item->batch_number ?? '-' }}</td>
                    <td>{{ $item->location?->warehouse?->name ?? '-' }}</td>
                    <td class="text-right font-bold">{{ number_format($qty) }}</td>
                    <td>{{ $item->sku?->unit?->symbol ?? '-' }}</td>
                    <td class="text-right">Rp {{ number_format($cost, 0, ',', '.') }}</td>
                    <td class="text-right font-bold">Rp {{ number_format($totalVal, 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="9" class="text-center" style="color: #777;">Tidak ada data stok.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    @if(!empty($settings['doc_footer_html']))
        <div class="footer-note">
            {!! $settings['doc_footer_html'] !!}
        </div>
    @endif

</body>
</html>
