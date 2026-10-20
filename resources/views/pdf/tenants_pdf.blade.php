<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Tenants Export Report</title>
    <style>
        body { font-family: sans-serif; font-size: 10px; color: #333; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h2 { margin: 0; }
        .badge { padding: 2px 6px; border-radius: 4px; font-size: 8px; font-weight: bold; text-transform: uppercase; }
        .badge-active { background-color: #d1fae5; color: #065f46; }
        .badge-inactive { background-color: #fee2e2; color: #991b1b; }
    </style>
</head>
<body>
    <div class="header">
        <h2>Registered Tenants Report</h2>
        <p>Generated on: {{ now()->format('d M Y, H:i') }}</p>
    </div>
    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Company Name</th>
                <th>Email / Phone</th>
                <th>Tax Number</th>
                <th>Plan Tier</th>
                <th>Status</th>
                <th>Registered Date</th>
            </tr>
        </thead>
        <tbody>
            @foreach($tenants as $index => $tenant)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>
                    <strong>{{ $tenant->name }}</strong><br>
                    <small style="color: #666;">/{{ $tenant->slug }}</small>
                </td>
                <td>
                    {{ $tenant->email ?? '-' }}<br>
                    <small style="color: #666;">{{ $tenant->phone ?? '-' }}</small>
                </td>
                <td>{{ $tenant->tax_number ?? '-' }}</td>
                <td>{{ $tenant->subscription?->plan?->name ?? 'Standard' }}</td>
                <td>
                    <span class="badge {{ $tenant->subscription?->status === 'active' ? 'badge-active' : 'badge-inactive' }}">
                        {{ $tenant->subscription?->status ?? 'INACTIVE' }}
                    </span>
                </td>
                <td>{{ $tenant->created_at?->format('d M Y') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
