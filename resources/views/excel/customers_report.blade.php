<table>
    <!-- Header Kop Surat -->
    <tr>
        <td colspan="6" style="font-weight: bold; font-size: 14px; text-align: center;">
            {{ strip_tags($settings['doc_header_html'] ?? $tenant->name) }}
        </td>
    </tr>
    @if(!empty($settings['doc_show_npwp']) && $settings['doc_show_npwp'] == '1' && $tenant->tax_number)
    <tr>
        <td colspan="6" style="text-align: right; font-size: 10px;">
            NPWP: {{ $tenant->tax_number }}
        </td>
    </tr>
    @endif
    <tr><td colspan="6"></td></tr>

    <!-- Title -->
    <tr>
        <td colspan="6" style="font-weight: bold; text-align: center; font-size: 12px;">
            LAPORAN DATA CUSTOMER
        </td>
    </tr>
    <tr><td colspan="6"></td></tr>

    <!-- Table Header -->
    <thead>
        <tr>
            <th style="font-weight: bold; background-color: #f2f2f2;">#</th>
            <th style="font-weight: bold; background-color: #f2f2f2;">Nama Customer</th>
            <th style="font-weight: bold; background-color: #f2f2f2;">Telepon</th>
            <th style="font-weight: bold; background-color: #f2f2f2;">Email</th>
            <th style="font-weight: bold; background-color: #f2f2f2;">NPWP / Tax ID</th>
            <th style="font-weight: bold; background-color: #f2f2f2;">Alamat</th>
        </tr>
    </thead>
    <tbody>
        @foreach($customers as $index => $customer)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $customer->name }}</td>
                <td>{{ $customer->phone ?? '-' }}</td>
                <td>{{ $customer->email ?? '-' }}</td>
                <td>{{ $customer->tax_number ?? '-' }}</td>
                <td>{{ $customer->address ?? '-' }}</td>
            </tr>
        @endforeach
    </tbody>

    <!-- Footer Catatan -->
    @if(!empty($settings['doc_footer_html']))
    <tr><td colspan="6"></td></tr>
    <tr>
        <td colspan="6" style="font-size: 9px; color: #555555;">
            {{ strip_tags($settings['doc_footer_html']) }}
        </td>
    </tr>
    @endif
</table>
