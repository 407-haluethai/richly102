<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run()
    {
        $categories = [
            // ✅ รายจ่าย (Expense)
            ['name' => 'อาหาร', 'type' => 'expense', 'icon' => '🍔'],
            ['name' => 'การเดินทาง', 'type' => 'expense', 'icon' => '🚗'],
            ['name' => 'ที่อยู่อาศัย', 'type' => 'expense', 'icon' => '🏠'],
            ['name' => 'ของใช้', 'type' => 'expense', 'icon' => '🛒'],
            ['name' => 'อื่นๆ', 'type' => 'expense', 'icon' => '🛠️'],

            // ✅ รายรับ (Income)
            ['name' => 'เงินเดือน', 'type' => 'income', 'icon' => '💵'],
            ['name' => 'โบนัส', 'type' => 'income', 'icon' => '🎉'],
            ['name' => 'ธุรกิจ', 'type' => 'income', 'icon' => '🏢'],
            ['name' => 'ครอบครัว', 'type' => 'income', 'icon' => '👨‍👩‍👧‍👦'],
            ['name' => 'อื่นๆ', 'type' => 'income', 'icon' => '🛠️'],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate([
                'name' => $category['name'],
                'type' => $category['type'],
            ], [
                'icon' => $category['icon'],
            ]);
        }
    }
}
