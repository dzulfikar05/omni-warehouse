<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlanFeature extends Model
{
    protected $table = 'plan_features';

    protected $guarded = [];

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }
}
