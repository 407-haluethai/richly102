<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Log; // ✅ Import ให้ถูกต้อง
use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\Budget;
use App\Models\Report;
use App\Models\Category;
use Illuminate\Support\Facades\Auth;
use Exception;

class TransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json([
            'transactions' => Transaction::orderBy('transaction_date', 'desc')->get()
        ]);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            Log::info("📥 Data received:", $request->all());

            $validated = $request->validate([
                'category_id' => 'required|integer|exists:categories,id',
                'category_name' => 'required|string|max:255', // ✅ ต้องมีชื่อหมวดหมู่
                'amount' => 'required|numeric',
                'transaction_type' => 'required|in:income,expense',
                'description' => 'nullable|string',
                'transaction_date' => 'required|date',
            ]);

            $userId = Auth::id();
            if (!$userId) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
            }

            // ✅ **สร้างหมวดหมู่ใหม่เสมอ**
            $category = Category::create([
                'user_id' => $userId,
                'name' => trim($validated['category_name']),
                'type' => $validated['transaction_type'],
            ]);

            // ✅ บันทึกธุรกรรมลงตาราง transactions
            $transaction = Transaction::create([
                'user_id' => $userId,
                'category_id' => $category->id,
                'amount' => $validated['amount'],
                'transaction_type' => $validated['transaction_type'],
                'description' => $validated['description'],
                'transaction_date' => $validated['transaction_date'],
            ]);

            Log::info("📝 Budget Insert Data", [
                'user_id' => Auth::id(),
                'category_id' => $validated['category_id'],
                'amount' => $validated['amount'],
                'start_date' => now()->startOfMonth(),
                'end_date' => now()->endOfMonth(),
            ]);

            // ✅ **เช็คเฉพาะ `user_id` ว่ามีใน `budgets` หรือไม่**
            $budget = Budget::where('user_id', $userId)->first();

            if ($budget) {
                // ✅ ถ้ามีงบประมาณ → อัปเดตยอดเงิน
                if ($validated['transaction_type'] === 'income') {
                    $budget->amount += abs($validated['amount']); // บวกเงินเข้า
                } else {
                    $budget->amount -= abs($validated['amount']); // ลบเงินออก
                }
                $budget->save();
            } else {
                // ✅ ถ้าไม่มี `user_id` ใน `budgets` → สร้างใหม่
                Budget::create([
                    'user_id' => $userId,
                    'category_id' => $validated['category_id'], // ✅ ต้องมีค่า
                    'amount' => $validated['transaction_type'] === 'income'
                        ? abs($validated['amount'])
                        : -abs($validated['amount']),
                    'start_date' => now()->startOfMonth(),
                    'end_date' => now()->endOfMonth(),
                ]);
            }

            return response()->json([
                'success' => true,
                'transaction' => $transaction,
                'category' => $category,
                'budget' => $budget ?? 'Created new budget',
            ]);

        } catch (\Exception $e) {
            Log::error("❌ Error: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
