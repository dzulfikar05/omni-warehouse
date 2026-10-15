<!DOCTYPE html>
<html>
<head>
    <title>Category Master Report</title>
    <style>
        body { font-family: sans-serif; font-size: 10pt; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .header { margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h2>Category Master Report</h2>
        <p>Generated At: {{ $generatedAt }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Category ID</th>
                <th>Category Name</th>
                <th>Description</th>
                <th>Products Count</th>
            </tr>
        </thead>
        <tbody>
            @foreach($categories as $category)
            <tr>
                <td>CAT-00{{ $category['id'] }}</td>
                <td><strong>{{ $category['name'] }}</strong></td>
                <td>{{ $category['desc'] ?? '-' }}</td>
                <td>{{ $category['products_count'] ?? 0 }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
