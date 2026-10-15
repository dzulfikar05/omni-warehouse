<!DOCTYPE html>
<html>
<head>
    <title>SKU Variant Report</title>
    <style>
        body { font-family: sans-serif; font-size: 10pt; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
    </style>
</head>
<body>
    <h2>SKU Variant Report</h2>
    <p>Generated At: {{ $generatedAt }}</p>

    <table>
        <thead>
            <tr>
                <th>SKU Code</th>
                <th>Product Parent</th>
                <th>Current Stock</th>
                <th>Unit</th>
            </tr>
        </thead>
        <tbody>
            @foreach($skus as $sku)
            <tr>
                <td><strong>{{ $sku['sku_code'] }}</strong></td>
                <td>{{ $sku['product']['name'] ?? '-' }}</td>
                <td>{{ $sku['current_stock'] }}</td>
                <td>{{ $sku['unit']['symbol'] ?? '-' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
