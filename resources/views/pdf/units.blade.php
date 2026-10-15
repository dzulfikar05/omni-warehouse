<!DOCTYPE html>
<html>
<head>
    <title>Unit Measurement Report</title>
    <style>
        body { font-family: sans-serif; font-size: 10pt; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
    </style>
</head>
<body>
    <h2>Unit Measurement Report</h2>
    <p>Generated At: {{ $generatedAt }}</p>

    <table>
        <thead>
            <tr>
                <th>Unit ID</th>
                <th>Unit Name</th>
                <th>Symbol</th>
            </tr>
        </thead>
        <tbody>
            @foreach($units as $unit)
            <tr>
                <td>UNIT-00{{ $unit['id'] }}</td>
                <td>{{ $unit['name'] }}</td>
                <td><strong>{{ $unit['symbol'] }}</strong></td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
