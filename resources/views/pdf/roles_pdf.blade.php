<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Central Roles Report</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 11px; color: #333; margin: 20px; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
        .header h2 { margin: 0; color: #1e3a8a; font-size: 18px; }
        .header p { margin: 4px 0 0; color: #64748b; font-size: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
        th { background-color: #f1f5f9; color: #1e293b; font-weight: bold; font-size: 9px; text-transform: uppercase; }
        tr:nth-child(even) { background-color: #f8fafc; }
        .badge { display: inline-block; padding: 2px 5px; background-color: #e2e8f0; border-radius: 4px; font-size: 8px; margin: 1px; }
    </style>
</head>
<body>
    <div class="header">
        <h2>CENTRAL ROLES & PERMISSIONS REPORT</h2>
        <p>Generated on {{ date('d F Y H:i') }} WIB</p>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 5%;">No</th>
                <th style="width: 10%;">ID</th>
                <th style="width: 25%;">Role Name</th>
                <th style="width: 10%;">Total Perms</th>
                <th style="width: 50%;">Mapped Permissions</th>
            </tr>
        </thead>
        <tbody>
            @forelse($roles as $index => $role)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>#{{ $role->id }}</td>
                    <td><strong>{{ $role->name }}</strong></td>
                    <td>{{ $role->permissions->count() }}</td>
                    <td>
                        @forelse($role->permissions as $perm)
                            <span class="badge">{{ $perm->name }}</span>
                        @empty
                            <em>No permissions attached</em>
                        @endforelse
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" style="text-align: center; color: #94a3b8;">No role records found.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>
