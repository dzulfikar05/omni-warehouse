<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Subscription Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 11px;
            color: #333;
            margin: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 10px;
        }
        .header h2 {
            margin: 0;
            color: #1e3a8a;
            font-size: 18px;
        }
        .header p {
            margin: 4px 0 0;
            color: #64748b;
            font-size: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th, td {
            border: 1px solid #cbd5e1;
            padding: 7px 9px;
            text-align: left;
        }
        th {
            background-color: #f1f5f9;
            color: #1e293b;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 9px;
        }
        tr:nth-child(even) {
            background-color: #f8fafc;
        }
        .badge {
            padding: 3px 6px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .badge-active { background-color: #dcfce7; color: #166534; }
        .badge-past_due { background-color: #fef3c7; color: #92400e; }
        .badge-canceled { background-color: #fee2e2; color: #991b1b; }
        .footer {
            margin-top: 20px;
            text-align: right;
            font-size: 9px;
            color: #94a3b8;
        }
    </style>
</head>
<body>

    <div class="header">
        <h2>SUBSCRIPTION MANAGEMENT REPORT</h2>
        <p>Generated on {{ date('d F Y H:i') }} WIB</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Tenant Organization</th>
                <th>Plan Tier</th>
                <th>Price / Month</th>
                <th>Status</th>
                <th>Expiration Date</th>
                <th>Created At</th>
            </tr>
        </thead>
        <tbody>
            @forelse($subscriptions as $index => $sub)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>
                        <strong>{{ $sub->tenant?->name ?? 'N/A' }}</strong><br>
                        <small style="color: #64748b;">slug: {{ $sub->tenant?->slug ?? '-' }}</small>
                    </td>
                    <td>{{ $sub->plan?->name ?? 'N/A' }}</td>
                    <td>Rp {{ number_format($sub->plan?->price ?? 0, 0, ',', '.') }}</td>
                    <td>
                        <span class="badge badge-{{ $sub->status }}">
                            {{ $sub->status }}
                        </span>
                    </td>
                    <td>{{ $sub->ends_at ? date('d/m/Y', strtotime($sub->ends_at)) : 'Lifetime' }}</td>
                    <td>{{ $sub->created_at->format('d/m/Y') }}</td>
                </tr>
            @empty
                <tr>
                    <td colSpan="7" style="text-align: center; color: #94a3b8;">No subscription records found.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Confidential Document - Internal Platform Administration
    </div>

</body>
</html>
