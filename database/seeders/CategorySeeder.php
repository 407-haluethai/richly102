<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run()
    {
        $userId = 1; // กำหนด ID ของ User ที่จะใช้ (ถ้ามีหลาย User อาจต้องใช้ auth()->id())

        // หมวดหมู่รายรับ
        $incomeCategories = [
            'ได้รับคืน', 'ได้พิเศษ', 'รายได้', 'ได้ฟรี', 'รายได้ธุรกิจ',
            'เงินปันผล', 'ยืมมา', 'อื่นๆ'
        ];

        // หมวดหมู่รายจ่าย
        $expenseCategories = [
            'อาหาร', 'เดินทาง', 'ที่พัก', 'ของใช้', 'บริการ', 'ถูกยืม', 'ค่ารักษา',
            'สัตว์เลี้ยง', 'บริจาค', 'การศึกษา', 'คนรัก', 'เสื้อผ้า', 'เครื่องสำอาง',
            'เครื่องประดับ', 'บันเทิง', 'โทรศัพท์', 'ครอบครัว', 'ประกันภัย', 'กีฬา',
            'งานอดิเรก', 'ซอฟต์แวร์', 'ฮาร์ดแวร์', 'ของสะสม', 'ภาษี', 'สารธารณูปโภค',
            'ยานพาหนะ', 'ต้นไม้', 'คืนเงิน', 'ธุรกิจ', 'ค่าธรรมเนียม', 'อื่นๆ'
        ];

        // สร้างหมวดหมู่รายรับ
        foreach ($incomeCategories as $category) {
            Category::create([
                'user_id' => $userId,
                'name' => $category,
                'type' => 'income',
            ]);
        }

        // สร้างหมวดหมู่รายจ่าย
        foreach ($expenseCategories as $category) {
            Category::create([
                'user_id' => $userId,
                'name' => $category,
                'type' => 'expense',
            ]);
        }
    }
}


