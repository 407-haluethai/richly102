<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // ✅ เพิ่มบรรทัดนี้

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable; // ✅ ต้องมี HasApiTokens

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function categories()
    {
        return $this->hasMany(Category::class);
    }

    public function budgets()
    {
        return $this->hasMany(Budget::class);
    }

    public function reports()
    {
        return $this->hasMany(Report::class);
    }
}
