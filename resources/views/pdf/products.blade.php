<!DOCTYPE html>
<html>
<head>
    <title>Product Master Report</title>
    <style>
        body { font-family: sans-serif; font-size: 10pt; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .header { margin-bottom: 20px; }
        .badge { padding: 2px 6px; border-radius: 4px; font-size: 8pt; font-weight: bold; }
        .active { background-color: #d1fae5; color: #065f46; }
        .draft { background-color: #fef3c7; color: #92400e; }
        .inactive { background-color: #f3f4f6; color: #374151; }
    </style>
</head>
<body>
    <div class="header">
        <h2>Product Master Report</h2>
        <p>Generated At: {{ $generatedAt }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Product ID</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Status</th>
                <th>SKU Count</th>
            </tr>
        </thead>
        <tbody>
            @foreach($products as $product)
            <tr>
                <td>PRD-00{{ $product['id'] }}</td>
                <td>{{ $product['name'] }}</td>
                <td>{{ $product['category']['name'] ?? '-' }}</td>
                <td>
                    <span class="badge {{ $product['status'] ?? 'active' }}">
                        {{ strtoupper($product['status'] ?? 'ACTIVE') }}
                    </span>
                </td>
                <td>{{ count($product['skus'] ?? []) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
