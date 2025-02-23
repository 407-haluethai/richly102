<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\Budget;
use App\Models\Category;
use Illuminate\Support\Facades\Auth;

class TransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $userId = Auth::id();

        $transactions = Transaction::with('category') // ดึงข้อมูลจากตาราง categories
            ->where('user_id', $userId)
            ->orderBy('transaction_date', 'desc')
            ->get()
            ->map(function ($transaction) {
                return [
                    'id'                => $transaction->id,
                    'category'          => $transaction->category->name ?? 'ไม่ระบุหมวดหมู่',
                    'icon'              => $transaction->category->icon ?? '❓',
                    'description'       => $transaction->description ?? 'ไม่มีรายละเอียด',
                    'amount'            => $transaction->amount,
                    'transaction_type'  => $transaction->transaction_type,
                    'date'              => $transaction->transaction_date,
                    'created_at'        => $transaction->created_at,
                ];
            });

        return response()->json(['transactions' => $transactions]);
    }

    /**
     * Store a newly created transaction.
     */
    public function store(Request $request)
    {
        try {
            Log::info("📥 Data received in Backend:", $request->all());

            // Validate input รวมทั้งข้อมูลของหมวดหมู่ที่ใช้สำหรับสร้าง Category หากไม่พบ
            $validated = $request->validate([
                'category_id'      => 'sometimes|integer',
                'category_name'    => 'required|string',
                'category_icon'    => 'required|string',
                'amount'           => 'required|numeric',
                'transaction_type' => 'required|string',
                'description'      => 'nullable|string',
                'transaction_date' => 'required|date',
            ]);

            Log::info("✅ Validated Data:", $validated);

            $userId = Auth::id();
            if (!$userId) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
            }

            // ตรวจสอบว่าหมวดหมู่มีอยู่แล้วหรือไม่ (โดยใช้ category_name และ transaction_type)
            $category = Category::where('user_id', $userId)
                ->whereRaw('LOWER(name) = ?', [strtolower(trim($validated['category_name']))])
                ->where('type', $validated['transaction_type'])
                ->first();

            if (!$category) {
                // ถ้าไม่มีหมวดหมู่ ให้สร้างใหม่
                $category = Category::create([
                    'user_id' => $userId,
                    'name'    => trim($validated['category_name']),
                    'type'    => $validated['transaction_type'],
                    'icon'    => $validated['category_icon'],
                ]);
                Log::info("🆕 New Category Created:", ['category' => $category->toArray()]);
            } else {
                // ถ้ามีอยู่แล้วและไม่มี icon ให้อัปเดต
                if (!$category->icon) {
                    $category->update(['icon' => $validated['category_icon']]);
                    Log::info("🔄 Category Updated:", ['id' => $category->id, 'icon' => $validated['category_icon']]);
                }
            }

            // เช็คว่า $category ถูกกำหนดค่าแน่นอน
            if (!$category) {
                Log::error("❌ Error: Category is still undefined!");
                return response()->json(['success' => false, 'message' => 'Category could not be determined'], 500);
            }

            Log::info("📌 Final Category Data:", ['id' => $category->id, 'icon' => $category->icon]);

            // บันทึกธุรกรรม โดยเก็บเฉพาะ category_id (ไม่เก็บ category_name กับ category_icon ซ้ำ)
            $transaction = Transaction::create([
                'user_id'           => $userId,
                'category_id'       => $category->id,
                'amount'            => $validated['amount'],
                'transaction_type'  => $validated['transaction_type'],
                'description'       => $validated['description'],
                'transaction_date'  => $validated['transaction_date'],
            ]);

            // อัปเดตงบประมาณ
            Log::info("📝 Budget Update Data", [
                'user_id'     => $userId,
                'category_id' => $category->id,
                'amount'      => $validated['amount'],
                'start_date'  => now()->startOfMonth(),
                'end_date'    => now()->endOfMonth(),
            ]);

            $budget = Budget::where('user_id', $userId)->first();
            if ($budget) {
                if ($validated['transaction_type'] === 'income') {
                    $budget->amount += abs($validated['amount']);
                } else {
                    $budget->amount -= abs($validated['amount']);
                }
                $budget->save();
            } else {
                $budget = Budget::create([
                    'user_id'     => $userId,
                    'category_id' => $category->id,
                    'amount'      => $validated['transaction_type'] === 'income'
                                        ? abs($validated['amount'])
                                        : -abs($validated['amount']),
                    'start_date'  => now()->startOfMonth(),
                    'end_date'    => now()->endOfMonth(),
                ]);
            }

            return response()->json([
                'success'     => true,
                'transaction' => $transaction,
                'category'    => $category,
                'budget'      => $budget,
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
        $transaction = Transaction::find($id);

        if (!$transaction) {
            return response()->json(['message' => 'Transaction not found'], 404);
        }

        return response()->json($transaction);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
{
    $transaction = Transaction::find($id);
    if (!$transaction) {
        return response()->json(['message' => 'ไม่พบธุรกรรม'], 404);
    }

    $userId = Auth::id();

    // Validate รับข้อมูลของหมวดหมู่ด้วย
    $validated = $request->validate([
        'category_id'      => 'sometimes|integer',
        'category_name'    => 'required|string',
        'category_icon'    => 'required|string',
        'amount'           => 'required|numeric',
        'transaction_type' => 'required|string',
        'description'      => 'nullable|string',
        'transaction_date' => 'required|date',
    ]);

    // ถ้ามี category_id ส่งมาจาก request ให้พยายามดึง Category นั้น
    if (isset($validated['category_id'])) {
        $category = Category::where('user_id', $userId)
            ->where('id', $validated['category_id'])
            ->first();
    }

    // หากไม่พบ Category ด้วย category_id ให้ค้นหาด้วย category_name และ transaction_type
    if (!isset($category) || !$category) {
        $category = Category::where('user_id', $userId)
            ->whereRaw('LOWER(name) = ?', [strtolower(trim($validated['category_name']))])
            ->where('type', $validated['transaction_type'])
            ->first();

        if (!$category) {
            // ถ้ายังไม่มี Category ให้สร้างใหม่
            $category = Category::create([
                'user_id' => $userId,
                'name'    => trim($validated['category_name']),
                'type'    => $validated['transaction_type'],
                'icon'    => $validated['category_icon'],
            ]);
        } else {
            // ถ้ามีอยู่แล้วแต่ icon ไม่ตรงกัน ให้อัปเดต icon
            if ($category->icon !== $validated['category_icon']) {
                $category->update(['icon' => $validated['category_icon']]);
            }
        }
    }

    // Update transaction โดยใช้ category_id จาก Category ที่ได้จากฐานข้อมูล
    $transaction->update([
        'category_id'      => $category->id,
        'amount'           => $validated['amount'],
        'transaction_type' => $validated['transaction_type'],
        'description'      => $validated['description'],
        'transaction_date' => $validated['transaction_date'],
    ]);

    return response()->json([
        'message'     => 'อัปเดตรายการสำเร็จ',
        'transaction' => $transaction,
        'category'    => $category,
    ]);
}


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $transaction = Transaction::find($id);
        if (!$transaction) {
            return response()->json(['message' => 'ไม่พบธุรกรรม'], 404);
        }

        $transaction->delete();
        return response()->json(['message' => 'ลบธุรกรรมสำเร็จ']);
    }
}
