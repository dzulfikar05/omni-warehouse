<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Supplier Report</title>
    <style>
        body { font-family: sans-serif; font-size: 11px; color: #333; line-height: 1.4; }
        .kop-table { width: 100%; border-collapse: collapse; border-bottom: 2px solid #000; margin-bottom: 15px; }
        .kop-table td { vertical-align: middle; }
        .logo { max-height: 50px; width: auto; }
        .content-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .content-table th, .content-table td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
        .content-table th { background-color: #f2f2f2; font-weight: bold; }
        .footer-note { margin-top: 20px; font-size: 10px; color: #666; border-top: 1px solid #ddd; padding-top: 5px; }
    </style>
</head>
<body>

    <!-- Header / Kop Surat -->
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
                <td style="width: 20%; text-align: right; font-size: 9px;">
                    <strong>NPWP / TAX ID:</strong><br>{{ $tenant->tax_number }}
                </td>
            @endif
        </tr>
    </table>

    <h3 style="text-align: center; margin-bottom: 10px;">LAPORAN DATA SUPPLIER</h3>

    <!-- Content Table -->
    <table class="content-table">
        <thead>
            <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 25%;">Nama Supplier</th>
                <th style="width: 15%;">PIC</th>
                <th style="width: 15%;">Telepon</th>
                <th style="width: 20%;">Email</th>
                <th style="width: 20%;">NPWP / Tax ID</th>
            </tr>
        </thead>
        <tbody>
            @forelse($suppliers as $index => $supplier)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td><strong>{{ $supplier->name }}</strong></td>
                    <td>{{ $supplier->pic ?? '-' }}</td>
                    <td>{{ $supplier->phone ?? '-' }}</td>
                    <td>{{ $supplier->email ?? '-' }}</td>
                    <td>{{ $supplier->tax_number ?? '-' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="6" style="text-align: center; color: #777;">Tidak ada data supplier.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- Footer Catatan -->
    @if(!empty($settings['doc_footer_html']))
        <div class="footer-note">
            {!! $settings['doc_footer_html'] !!}
        </div>
    @endif

</body>
</html>
