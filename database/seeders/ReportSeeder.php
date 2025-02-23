<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Report;

class ReportSeeder extends Seeder
{
    public function run()
    {
        Report::factory(10)->create(); // สร้างรายงาน 10 รายการ
    }
}
