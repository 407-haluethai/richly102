<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class CategorySeeder extends Seeder
{
    public function run()
    {
        DB::table('categories')->insert([
            [
                'id' => 1,
                'user_id' => 1,
                'name' => 'อาหาร',
                'icon' => '🍔',
                'type' => 'expense',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'id' => 2,
                'user_id' => 1,
                'name' => 'การเดินทาง',
                'icon' => '🚗',
                'type' => 'expense',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'id' => 3,
                'user_id' => 1,
                'name' => 'ที่อยู่อาศัย',
                'icon' => '🏠',
                'type' => 'expense',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'id' => 4,
                'user_id' => 1,
                'name' => 'ของใช้',
                'icon' => '🛒',
                'type' => 'expense',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'id' => 5,
                'user_id' => 1,
                'name' => 'อื่นๆ',
                'icon' => '🛠️',
                'type' => 'expense',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'id' => 6,
                'user_id' => 1,
                'name' => 'เงินเดือน',
                'icon' => '💵',
                'type' => 'income',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'id' => 7,
                'user_id' => 1,
                'name' => 'โบนัส',
                'icon' => '🎉',
                'type' => 'income',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'id' => 8,
                'user_id' => 1,
                'name' => 'ธุรกิจ',
                'icon' => '🏢',
                'type' => 'income',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'id' => 9,
                'user_id' => 1,
                'name' => 'ครอบครัว',
                'icon' => '👨‍👩‍👧‍👦',
                'type' => 'income',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'id' => 10,
                'user_id' => 1,
                'name' => 'อื่นๆ',
                'icon' => '🛠️',
                'type' => 'income',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ]);
    }
}
