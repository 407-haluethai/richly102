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
    //อ่านข้อมูลจาก Request และบันทึกข้อมูลลงฐานข้อมูล
    public function store(Request $request)
    {
        try {
            Log::info("📥 Data received in Backend:", $request->all());

            // Validate input
            $validated = $request->validate([
                'category_id'      => 'required|integer|exists:categories,id',
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

            // ตรวจสอบว่าหมวดหมู่ที่เลือกมีอยู่จริงหรือไม่
            $category = Category::where('id', $validated['category_id'])
                ->where('user_id', $userId)
                ->first();

            if (!$category) {
                return response()->json(['success' => false, 'message' => 'หมวดหมู่ที่เลือกไม่ถูกต้อง'], 400);
            }

            Log::info("📌 Selected Category:", ['id' => $category->id, 'icon' => $category->icon]);

            // บันทึกธุรกรรม
            $transaction = Transaction::create([
                'user_id'           => $userId,
                'category_id'       => $category->id,
                'amount'            => $validated['amount'],
                'transaction_type'  => $validated['transaction_type'],
                'description'       => $validated['description'],
                'transaction_date'  => $validated['transaction_date'],
            ]);

            return response()->json([
                'success'     => true,
                'transaction' => $transaction,
                'category'    => $category,
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

    $validated = $request->validate([
        'category_id'      => 'required|integer|exists:categories,id',
        'amount'           => 'required|numeric',
        'transaction_type' => 'required|string',
        'description'      => 'nullable|string',
        'transaction_date' => 'required|date',
    ]);

    // ตรวจสอบว่าหมวดหมู่มีอยู่หรือไม่
    $category = Category::where('id', $validated['category_id'])
        ->where('user_id', $userId)
        ->first();

    if (!$category) {
        return response()->json(['success' => false, 'message' => 'หมวดหมู่ที่เลือกไม่ถูกต้อง'], 400);
    }

    // อัปเดตรายการธุรกรรม
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
