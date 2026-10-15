<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Master Gudang</title>
    <style>
        body { font-family: sans-serif; font-size: 10px; color: #333; line-height: 1.3; }
        .kop-table { width: 100%; border-collapse: collapse; border-bottom: 2px solid #000; margin-bottom: 12px; }
        .kop-table td { vertical-align: middle; }
        .logo { max-height: 45px; width: auto; }
        .content-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .content-table th, .content-table td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
        .content-table th { background-color: #f2f2f2; font-weight: bold; }
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

    <h3 style="text-align: center; margin-bottom: 10px;">LAPORAN MASTER GUDANG (WAREHOUSES)</h3>

    <table class="content-table">
        <thead>
            <tr>
                <th style="width: 5%;" class="text-center">#</th>
                <th style="width: 20%;">Kode Gudang</th>
                <th style="width: 30%;">Nama Warehouse</th>
                <th style="width: 30%;">Alamat / Deskripsi</th>
                <th style="width: 15%;" class="text-center">Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($items as $index => $item)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td style="font-family: monospace;">{{ $item->code ?? '-' }}</td>
                    <td><strong>{{ $item->name ?? '-' }}</strong></td>
                    <td>{{ $item->desc ?? '-' }}</td>
                    <td class="text-center">
                        {{ $item->is_active ? 'Active' : 'Inactive' }}
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" class="text-center" style="color: #777;">Tidak ada data gudang terdaftar.</td>
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
