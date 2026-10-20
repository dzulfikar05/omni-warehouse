<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Central Users Report</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 11px; color: #333; margin: 20px; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
        .header h2 { margin: 0; color: #1e3a8a; font-size: 18px; }
        .header p { margin: 4px 0 0; color: #64748b; font-size: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
        th { background-color: #f1f5f9; color: #1e293b; font-weight: bold; font-size: 9px; text-transform: uppercase; }
        tr:nth-child(even) { background-color: #f8fafc; }
        .badge { display: inline-block; padding: 2px 6px; background-color: #e2e8f0; border-radius: 4px; font-size: 9px; }
    </style>
</head>
<body>
    <div class="header">
        <h2>CENTRAL USERS REPORT</h2>
        <p>Generated on {{ date('d F Y H:i') }} WIB</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Assigned Roles</th>
                <th>Created Date</th>
            </tr>
        </thead>
        <tbody>
            @forelse($users as $index => $user)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>#{{ $user->id }}</td>
                    <td><strong>{{ $user->name }}</strong></td>
                    <td>{{ $user->email }}</td>
                    <td>
                        @if($user->roles->isNotEmpty())
                            @foreach($user->roles as $role)
                                <span class="badge">{{ $role->name }}</span>
                            @endforeach
                        @else
                            <em>No Role</em>
                        @endif
                    </td>
                    <td>{{ $user->created_at->format('d/m/Y H:i') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="6" style="text-align: center; color: #94a3b8;">No central user records found.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>
