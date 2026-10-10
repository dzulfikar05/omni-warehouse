<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Inbound / Outbound Report</title>
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

    <h3 style="text-align: center; margin-bottom: 10px;">LAPORAN RINGKASAN INBOUND & OUTBOUND</h3>

    <table class="content-table">
        <thead>
            <tr>
                <th style="width: 3%;">#</th>
                <th style="width: 11%;">Tanggal</th>
                <th style="width: 13%;">Transaction Ref</th>
                <th style="width: 9%;">Flow</th>
                <th style="width: 17%;">Kontak (Supplier / Customer)</th>
                <th style="width: 12%;">SKU Code</th>
                <th style="width: 18%;">Nama Produk</th>
                <th style="width: 7%;" class="text-right">Qty</th>
                <th style="width: 10%;">Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($items as $index => $item)
                @php
                    $rawType = strtoupper($item->transaction?->transaction_type ?? 'IN');
                    $isInbound = str_contains($rawType, 'IN');
                    $contact = $item->transaction?->supplier?->name ?? $item->transaction?->customer?->name ?? '-';
                @endphp
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>{{ $item->created_at?->format('Y-m-d H:i') ?? '-' }}</td>
                    <td style="font-family: monospace;">{{ $item->transaction?->local_uuid ?? '-' }}</td>
                    <td><strong>{{ $isInbound ? 'INBOUND' : 'OUTBOUND' }}</strong></td>
                    <td>{{ $contact }}</td>
                    <td style="font-family: monospace;">{{ $item->sku?->sku_code ?? '-' }}</td>
                    <td><strong>{{ $item->sku?->product?->name ?? '-' }}</strong></td>
                    <td class="text-right font-bold">{{ number_format($item->quantity ?? 0) }} {{ $item->sku?->unit?->symbol ?? '' }}</td>
                    <td>{{ strtoupper($item->transaction?->status ?? 'COMPLETED') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="9" class="text-center" style="color: #777;">Tidak ada data transaksi inbound / outbound.</td>
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
