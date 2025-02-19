<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CategoryFactory extends Factory
{
    protected $model = Category::class;

    public function definition()
    {
        $categories = [
            'อาหาร', 'เดินทาง', 'ที่พัก', 'ของใช้', 'บริการ', 'ถูกยืม', 'ค่ารักษา',
            'สัตว์เลี้ยง', 'บริจาค', 'การศึกษา', 'คนรัก', 'เสื้อผ้า', 'เครื่องสำอาง',
            'เครื่องประดับ', 'บันเทิง', 'โทรศัพท์', 'ครอบครัว', 'ประกันภัย', 'กีฬา',
            'งานอดิเรก', 'ซอฟต์แวร์', 'ฮาร์ดแวร์', 'ของสะสม', 'ภาษี', 'สารธารณูปโภค',
            'ยานพาหนะ', 'ต้นไม้', 'คืนเงิน', 'ธุรกิจ', 'ค่าธรรมเนียม', 'อื่นๆ'
        ];

        return [
            'user_id' => User::factory(),
            'name' => $this->faker->randomElement($categories),
            'type' => $this->faker->randomElement(['income', 'expense']),
        ];
    }
}


