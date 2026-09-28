<?php

namespace App\Providers;

use App\Contracts\CompanyProfileContract;
use App\Contracts\CustomerContract;
use App\Contracts\InboundContract;
use App\Contracts\OutboundContract;
use App\Contracts\RoleContract;
use App\Contracts\WarehousesContract;
use App\Contracts\StockOpnameContract;
use App\Contracts\SupplierContract;
use App\Contracts\TenantContract;
use App\Contracts\TenantUserRoleContract;
use App\Contracts\UserContract;
use App\Services\CompanyProfileService;
use App\Services\CustomerService;
use App\Services\InboundService;
use App\Services\OutboundService;
use App\Services\RoleService;
use App\Services\WarehousesService;
use App\Services\StockOpnameService;
use App\Services\SupplierService;
use App\Services\TenantService;
use App\Services\TenantUserRoleService;
use App\Services\UserService;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(UserContract::class, UserService::class);
        $this->app->bind(RoleContract::class, RoleService::class);
        $this->app->bind(TenantContract::class, TenantService::class);
        $this->app->bind(TenantUserRoleContract::class, TenantUserRoleService::class);
        $this->app->bind(CompanyProfileContract::class, CompanyProfileService::class);
        $this->app->bind(WarehousesContract::class, WarehousesService::class);
        $this->app->bind(StockOpnameContract::class, StockOpnameService::class);
        $this->app->bind(CustomerContract::class, CustomerService::class);
        $this->app->bind(SupplierContract::class, SupplierService::class);
        $this->app->bind(InboundContract::class, InboundService::class);
        $this->app->bind(OutboundContract::class, OutboundService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(
            fn(): ?Password => app()->isProduction()
                ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
                : null,
        );
    }
}
