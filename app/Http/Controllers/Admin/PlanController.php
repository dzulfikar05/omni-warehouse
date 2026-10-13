<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\PlanFeature;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class PlanController extends Controller
{
    public function index()
    {
        $plans = Plan::with('features')
            ->withCount('subscriptions')
            ->orderBy('price', 'asc')
            ->get();

        return Inertia::render('Admin/Plans/Index', [
            'plans' => $plans,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Plans/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'desc' => 'nullable|string',
            'features' => 'nullable|array',
            'features.*' => 'required|string',
        ]);

        $plan = Plan::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'desc' => $request->desc,
            'price' => $request->price,
            'is_active' => true,
        ]);

        if ($request->has('features')) {
            foreach ($request->features as $featureText) {
                if (!empty(trim($featureText))) {
                    PlanFeature::create([
                        'plan_id' => $plan->id,
                        'feature_key' => Str::slug($featureText, '_'),
                        'value' => $featureText,
                    ]);
                }
            }
        }

        return redirect()->route('admin.plans.index')->with('success', 'Plan berhasil ditambahkan.');
    }

    public function edit($id)
    {
        $plan = Plan::with('features')->findOrFail($id);

        return Inertia::render('Admin/Plans/Edit', [
            'plan' => $plan,
        ]);
    }

    public function update(Request $request, $id)
    {
        $plan = Plan::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'desc' => 'nullable|string',
            'features' => 'nullable|array',
            'features.*' => 'required|string',
        ]);

        $plan->update([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'desc' => $request->desc,
            'price' => $request->price,
        ]);

        // Perbarui fitur: hapus yang lama, masukkan yang baru
        $plan->features()->delete();

        if ($request->has('features')) {
            foreach ($request->features as $featureText) {
                if (!empty(trim($featureText))) {
                    PlanFeature::create([
                        'plan_id' => $plan->id,
                        'feature_key' => Str::slug($featureText, '_'),
                        'value' => $featureText,
                    ]);
                }
            }
        }

        return redirect()->route('admin.plans.index')->with('success', 'Plan berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $plan = Plan::findOrFail($id);
        $plan->features()->delete();
        $plan->delete();

        return redirect()->route('admin.plans.index')->with('success', 'Plan berhasil dihapus.');
    }
}