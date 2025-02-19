<?php

namespace Database\Factories;

use App\Models\Report;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReportFactory extends Factory
{
    protected $model = Report::class;

    public function definition()
    {
        return [
            'user_id' => User::factory(),
            'report_type' => $this->faker->randomElement(['daily', 'weekly', 'monthly', 'yearly']),
            'total_income' => $this->faker->randomFloat(2, 1000, 50000),
            'total_expense' => $this->faker->randomFloat(2, 500, 40000),
            'report_date' => $this->faker->date(),
        ];
    }
}

