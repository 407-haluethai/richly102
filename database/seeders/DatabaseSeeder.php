<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $this->call([
            UserSeeder::class,
            CategorySeeder::class,
            TransactionSeeder::class,
            BudgetSeeder::class,
            ReportSeeder::class,
        ]);
    }
}
