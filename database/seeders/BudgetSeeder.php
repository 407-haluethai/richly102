<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Budget;

class BudgetSeeder extends Seeder
{
    public function run()
    {
        Budget::factory(15)->create(); // สร้างงบประมาณ 15 รายการ
    }
}
